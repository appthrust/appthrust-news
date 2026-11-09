// Package content validates and indexes a release-versioned news edition.
package content

import (
	"cmp"
	"errors"
	"fmt"
	"io"
	"mime"
	"path"
	"regexp"
	"slices"
	"strings"
	"time"

	"github.com/appthrust/appthrust-news/cmd/server/internal/render"
	"gopkg.in/yaml.v3"
)

var itemID = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*$`)

var ErrInvalidCursor = errors.New("cursor does not identify an item in this list")

func ValidCategory(category string) bool {
	switch category {
	case "announcement", "release", "feature", "maintenance", "incident", "event":
		return true
	default:
		return false
	}
}

type Metadata struct {
	Title       string   `yaml:"title" json:"title"`
	Summary     string   `yaml:"summary" json:"summary"`
	PublishedAt string   `yaml:"publishedAt" json:"publishedAt"`
	UpdatedAt   string   `yaml:"updatedAt" json:"updatedAt,omitempty"`
	Category    string   `yaml:"category" json:"category"`
	Pinned      bool     `yaml:"pinned" json:"pinned"`
	Tags        []string `yaml:"tags" json:"tags"`
}

type ItemSummary struct {
	Metadata
	ID     string `json:"id"`
	Locale string `json:"locale"`
}

type Item struct {
	ItemSummary
	Markdown string `json:"markdown"`
}

type Edition struct {
	Version   string `json:"version"`
	ItemCount int    `json:"itemCount"`
}

type ItemList struct {
	Items      []ItemSummary `json:"items"`
	NextCursor string        `json:"nextCursor,omitempty"`
	Edition    Edition       `json:"edition"`
}

type Latest struct {
	ID          string  `json:"id,omitempty"`
	PublishedAt string  `json:"publishedAt,omitempty"`
	Edition     Edition `json:"edition"`
}

type newsItem struct {
	locales     map[string]Item
	assets      map[string][]byte
	publishedAt time.Time
}

func (i *newsItem) localized(locale string) Item {
	if item, ok := i.locales[locale]; ok {
		return item
	}
	return i.locales["ja"]
}

type Catalog struct {
	edition Edition
	byID    map[string]*newsItem
	lists   map[string][]*newsItem
	latest  Latest
}

func frontmatter(name, source string) (Metadata, string, error) {
	var metadata Metadata
	source = strings.ReplaceAll(source, "\r\n", "\n")
	if !strings.HasPrefix(source, "---\n") {
		return metadata, "", fmt.Errorf("%s: missing frontmatter", name)
	}
	header, body, ok := strings.Cut(source[4:], "\n---\n")
	if !ok {
		return metadata, "", fmt.Errorf("%s: unterminated frontmatter", name)
	}
	decoder := yaml.NewDecoder(strings.NewReader(header))
	decoder.KnownFields(true)
	if err := decoder.Decode(&metadata); err != nil {
		return metadata, "", fmt.Errorf("%s: frontmatter: %w", name, err)
	}
	var extra any
	if err := decoder.Decode(&extra); err != io.EOF {
		return metadata, "", fmt.Errorf("%s: frontmatter must contain one YAML document", name)
	}
	if strings.TrimSpace(metadata.Title) == "" || strings.TrimSpace(metadata.Summary) == "" || metadata.Tags == nil || !ValidCategory(metadata.Category) {
		return metadata, "", fmt.Errorf("%s: title, summary, valid category and tags array are required", name)
	}
	published, err := time.Parse(time.RFC3339, metadata.PublishedAt)
	if err != nil {
		return metadata, "", fmt.Errorf("%s: publishedAt must be RFC 3339", name)
	}
	if metadata.UpdatedAt != "" {
		updated, err := time.Parse(time.RFC3339, metadata.UpdatedAt)
		if err != nil {
			return metadata, "", fmt.Errorf("%s: updatedAt must be RFC 3339", name)
		}
		if updated.Before(published) {
			return metadata, "", fmt.Errorf("%s: updatedAt must not precede publishedAt", name)
		}
	}
	return metadata, body, nil
}

func validAssetName(name string) bool {
	return name != "." && name != ".." && name != "" && !strings.ContainsAny(name, "/\\") && strings.HasPrefix(mime.TypeByExtension(strings.ToLower(path.Ext(name))), "image/")
}

func Load(source Source, values render.Values) (*Catalog, error) {
	raw, err := source.Items()
	if err != nil {
		return nil, err
	}
	catalog := &Catalog{
		edition: Edition{Version: values.ReleaseVersion, ItemCount: len(raw)},
		byID:    make(map[string]*newsItem, len(raw)),
		lists:   map[string][]*newsItem{"": make([]*newsItem, 0, len(raw))},
	}
	pinned := 0
	var latest *newsItem
	for _, rawItem := range raw {
		if !itemID.MatchString(rawItem.ID) {
			return nil, fmt.Errorf("%s: invalid item id", rawItem.ID)
		}
		if _, exists := catalog.byID[rawItem.ID]; exists {
			return nil, fmt.Errorf("%s: duplicate item id", rawItem.ID)
		}
		if _, exists := rawItem.Locales["ja"]; !exists {
			return nil, fmt.Errorf("%s: ja.md is required", rawItem.ID)
		}
		for name := range rawItem.Assets {
			if !validAssetName(name) {
				return nil, fmt.Errorf("%s/%s: an image file beside the item is required", rawItem.ID, name)
			}
		}
		item := &newsItem{locales: make(map[string]Item, len(rawItem.Locales)), assets: rawItem.Assets}
		for locale, source := range rawItem.Locales {
			if locale != "ja" && locale != "en" {
				return nil, fmt.Errorf("%s: unsupported locale %s", rawItem.ID, locale)
			}
			name := rawItem.ID + "/" + locale + ".md"
			metadata, body, err := frontmatter(name, string(source))
			if err != nil {
				return nil, err
			}
			rendered, err := render.Markdown(name, body, values)
			if err != nil {
				return nil, err
			}
			rendered, err = render.Images(name, rendered, "/api/news/v1/items/"+rawItem.ID+"/assets/", func(file string) bool {
				_, exists := rawItem.Assets[file]
				return exists
			})
			if err != nil {
				return nil, err
			}
			item.locales[locale] = Item{ItemSummary: ItemSummary{Metadata: metadata, ID: rawItem.ID, Locale: locale}, Markdown: rendered}
		}
		ja := item.locales["ja"]
		if en, exists := item.locales["en"]; exists && (en.PublishedAt != ja.PublishedAt || en.Category != ja.Category || en.Pinned != ja.Pinned) {
			return nil, fmt.Errorf("%s: publishedAt, category and pinned must match across locales", rawItem.ID)
		}
		item.publishedAt, _ = time.Parse(time.RFC3339, ja.PublishedAt)
		if ja.Pinned {
			pinned++
			if pinned > 3 {
				return nil, fmt.Errorf("at most 3 items may be pinned")
			}
		}
		catalog.byID[rawItem.ID] = item
		catalog.lists[""] = append(catalog.lists[""], item)
		if latest == nil || chronological(item, latest) < 0 {
			latest = item
		}
	}
	slices.SortFunc(catalog.lists[""], func(a, b *newsItem) int {
		if a.locales["ja"].Pinned != b.locales["ja"].Pinned {
			if a.locales["ja"].Pinned {
				return -1
			}
			return 1
		}
		return chronological(a, b)
	})
	for _, item := range catalog.lists[""] {
		category := item.locales["ja"].Category
		catalog.lists[category] = append(catalog.lists[category], item)
	}
	catalog.latest.Edition = catalog.edition
	if latest != nil {
		catalog.latest.ID = latest.locales["ja"].ID
		catalog.latest.PublishedAt = latest.locales["ja"].PublishedAt
	}
	return catalog, nil
}

func chronological(a, b *newsItem) int {
	return cmp.Or(b.publishedAt.Compare(a.publishedAt), strings.Compare(b.locales["ja"].ID, a.locales["ja"].ID))
}

// List treats the cursor as an opaque last-seen ID in the selected category.
// The caller validates category and limit before entering this domain operation.
func (c *Catalog) List(locale, category, cursor string, limit int) (ItemList, error) {
	items := c.lists[category]
	start := 0
	if cursor != "" {
		index := slices.IndexFunc(items, func(item *newsItem) bool { return item.locales["ja"].ID == cursor })
		if index < 0 {
			return ItemList{}, ErrInvalidCursor
		}
		start = index + 1
	}
	end := min(start+limit, len(items))
	result := ItemList{Items: make([]ItemSummary, 0, end-start), Edition: c.edition}
	for _, item := range items[start:end] {
		result.Items = append(result.Items, item.localized(locale).ItemSummary)
	}
	if end < len(items) {
		result.NextCursor = items[end-1].locales["ja"].ID
	}
	return result, nil
}

func (c *Catalog) Item(id, locale string) (Item, bool) {
	item, ok := c.byID[id]
	if !ok {
		return Item{}, false
	}
	return item.localized(locale), true
}

func (c *Catalog) Latest() Latest { return c.latest }

func (c *Catalog) Asset(id, file string) ([]byte, bool) {
	item, ok := c.byID[id]
	if !ok {
		return nil, false
	}
	data, ok := item.assets[file]
	return data, ok
}
