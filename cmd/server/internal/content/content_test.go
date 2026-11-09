package content

import (
	"encoding/json"
	"errors"
	"os"
	"testing"

	"github.com/appthrust/appthrust-news/cmd/server/internal/render"
	"github.com/stretchr/testify/require"
)

func testValues(t *testing.T) render.Values {
	t.Helper()
	values, err := render.NewValues("https://api.example.test", "pj-test", "https://news.pj-test.example.test", "1.0.0")
	require.NoError(t, err)
	return values
}

func loadFixture(t *testing.T) *Catalog {
	t.Helper()
	catalog, err := Load(EmbeddedSource{Files: os.DirFS("testdata/valid")}, testValues(t))
	require.NoError(t, err)
	return catalog
}

func TestLoadRejectsInvalidContent(t *testing.T) {
	data, err := os.ReadFile("testdata/invalid-cases.json")
	require.NoError(t, err)
	var cases []struct{ Directory, Message string }
	require.NoError(t, json.Unmarshal(data, &cases))
	for _, test := range cases {
		t.Run(test.Directory, func(t *testing.T) {
			catalog, err := Load(EmbeddedSource{Files: os.DirFS("testdata/" + test.Directory)}, testValues(t))
			require.ErrorContains(t, err, test.Message)
			require.Nil(t, catalog)
		})
	}
}

func TestOrderingAndLatestIgnoreDifferentAxes(t *testing.T) {
	catalog := loadFixture(t)
	list, err := catalog.List("ja", "", "", 100)
	require.NoError(t, err)
	ids := make([]string, len(list.Items))
	for i, item := range list.Items {
		ids[i] = item.ID
		require.Equal(t, "ja", item.Locale)
		require.NotNil(t, item.Tags)
	}
	require.Equal(t, []string{"2026-11-02-pinned-z", "2026-11-02-pinned-a", "2026-11-01-pinned", "2026-11-03-latest-z", "2026-11-03-latest-a", "2026-11-04-older"}, ids)
	require.Equal(t, Edition{Version: "1.0.0", ItemCount: 6}, list.Edition)
	require.Empty(t, list.NextCursor)
	require.Equal(t, Latest{ID: "2026-11-03-latest-z", PublishedAt: "2026-11-10T11:00:00Z", Edition: list.Edition}, catalog.Latest())
}

func TestLocaleSelectionAndFallback(t *testing.T) {
	catalog := loadFixture(t)
	for _, test := range []struct{ id, request, actual, title string }{
		{"2026-11-01-pinned", "en", "en", "English fixture"},
		{"2026-11-02-pinned-a", "en", "ja", "Fixture title"},
		{"2026-11-01-pinned", "ja", "ja", "Fixture title"},
		{"2026-11-01-pinned", "", "ja", "Fixture title"},
		{"2026-11-01-pinned", "fr", "ja", "Fixture title"},
	} {
		item, ok := catalog.Item(test.id, test.request)
		require.True(t, ok)
		require.Equal(t, test.actual, item.Locale)
		require.Equal(t, test.title, item.Title)
	}
	_, ok := catalog.Item("missing", "ja")
	require.False(t, ok)
	list, err := catalog.List("en", "", "", 100)
	require.NoError(t, err)
	require.Equal(t, "ja", list.Items[0].Locale)
	require.Equal(t, "en", list.Items[2].Locale)
}

func TestCursorBoundariesAndCategoryIndexes(t *testing.T) {
	catalog := loadFixture(t)
	first, err := catalog.List("ja", "", "", 3)
	require.NoError(t, err)
	require.Len(t, first.Items, 3)
	require.Equal(t, "2026-11-01-pinned", first.NextCursor)
	second, err := catalog.List("ja", "", first.NextCursor, 3)
	require.NoError(t, err)
	require.Len(t, second.Items, 3)
	require.Empty(t, second.NextCursor)
	require.Equal(t, "2026-11-03-latest-z", second.Items[0].ID)
	end, err := catalog.List("ja", "", "2026-11-04-older", 3)
	require.NoError(t, err)
	require.Empty(t, end.Items)
	require.NotNil(t, end.Items)
	require.Empty(t, end.NextCursor)
	filtered, err := catalog.List("en", "announcement", "2026-11-02-pinned-a", 1)
	require.NoError(t, err)
	require.Len(t, filtered.Items, 1)
	require.Equal(t, "2026-11-01-pinned", filtered.Items[0].ID)
	require.Empty(t, filtered.NextCursor)
	require.Equal(t, 6, filtered.Edition.ItemCount)
	empty, err := catalog.List("ja", "incident", "", 20)
	require.NoError(t, err)
	require.NotNil(t, empty.Items)
	require.Empty(t, empty.Items)
	for _, test := range []struct{ category, cursor string }{{"", "missing"}, {"release", "2026-11-01-pinned"}} {
		_, err := catalog.List("ja", test.category, test.cursor, 20)
		require.ErrorIs(t, err, ErrInvalidCursor)
	}
}

func TestRenderingAndAssets(t *testing.T) {
	catalog := loadFixture(t)
	item, ok := catalog.Item("2026-11-01-pinned", "ja")
	require.True(t, ok)
	require.Contains(t, item.Markdown, "[Dashboard](https://api.example.test) for pj-test.")
	require.Contains(t, item.Markdown, "https://news.pj-test.example.test | example.test | 1.0.0")
	require.Contains(t, item.Markdown, `![fixture](</api/news/v1/items/2026-11-01-pinned/assets/image.svg> "Image title")`)
	require.Contains(t, item.Markdown, "![reference](</api/news/v1/items/2026-11-01-pinned/assets/image.svg>)")
	require.Contains(t, item.Markdown, "`![example](https://example.test/example.png)`")
	expected, err := os.ReadFile("testdata/valid/news/2026-11-01-pinned/image.svg")
	require.NoError(t, err)
	asset, ok := catalog.Asset(item.ID, "image.svg")
	require.True(t, ok)
	require.Equal(t, expected, asset)
	for _, test := range []struct{ id, file string }{{item.ID, "ja.md"}, {item.ID, "../image.svg"}, {item.ID, "missing.svg"}, {"missing", "image.svg"}} {
		_, ok := catalog.Asset(test.id, test.file)
		require.False(t, ok)
	}
}

type sourceFunc func() ([]RawItem, error)

func (source sourceFunc) Items() ([]RawItem, error) { return source() }

func TestSourcePortAndEmptyEdition(t *testing.T) {
	calls := 0
	catalog, err := Load(sourceFunc(func() ([]RawItem, error) {
		calls++
		return nil, nil
	}), testValues(t))
	require.NoError(t, err)
	list, err := catalog.List("en", "", "", 20)
	require.NoError(t, err)
	require.NotNil(t, list.Items)
	require.Empty(t, list.Items)
	require.Equal(t, Latest{Edition: Edition{Version: "1.0.0", ItemCount: 0}}, catalog.Latest())
	require.Equal(t, 1, calls)
	unavailable := errors.New("source unavailable")
	catalog, err = Load(sourceFunc(func() ([]RawItem, error) { return nil, unavailable }), testValues(t))
	require.ErrorIs(t, err, unavailable)
	require.Nil(t, catalog)
}

func TestPortCannotBypassValidation(t *testing.T) {
	for _, test := range []struct {
		name, message string
		change        func([]RawItem) []RawItem
	}{
		{"duplicate", "duplicate item id", func(items []RawItem) []RawItem { return append(items, items[0]) }},
		{"locale", "unsupported locale", func(items []RawItem) []RawItem { items[0].Locales["fr"] = items[0].Locales["ja"]; return items }},
		{"asset-path", "image file beside the item", func(items []RawItem) []RawItem { items[0].Assets["../image.svg"] = nil; return items }},
	} {
		t.Run(test.name, func(t *testing.T) {
			items, err := (EmbeddedSource{Files: os.DirFS("testdata/valid")}).Items()
			require.NoError(t, err)
			catalog, err := Load(sourceFunc(func() ([]RawItem, error) { return test.change(items), nil }), testValues(t))
			require.ErrorContains(t, err, test.message)
			require.Nil(t, catalog)
		})
	}
}

func TestOptionalMetadataAndCorrections(t *testing.T) {
	catalog, err := Load(EmbeddedSource{Files: os.DirFS("testdata/optional")}, testValues(t))
	require.NoError(t, err)
	ja, ok := catalog.Item("2026-11-10-fixture", "ja")
	require.True(t, ok)
	require.False(t, ja.Pinned)
	require.NotNil(t, ja.Tags)
	require.Empty(t, ja.Tags)
	require.Equal(t, "2026-11-10T00:00:00Z", ja.UpdatedAt)
	en, ok := catalog.Item(ja.ID, "en")
	require.True(t, ok)
	require.Equal(t, "2026-11-11T00:00:00Z", en.UpdatedAt)
}
