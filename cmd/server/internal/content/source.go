package content

import (
	"fmt"
	"io/fs"
	"path"
)

// Source is the only boundary between storage and the news edition. Its result
// belongs to the caller and is validated before any item becomes available.
type Source interface {
	Items() ([]RawItem, error)
}

type RawItem struct {
	ID      string
	Locales map[string][]byte
	Assets  map[string][]byte
}

// EmbeddedSource reads the news/ tree from the image's embedded filesystem.
// Tests supply a testdata filesystem through the same adapter.
type EmbeddedSource struct {
	Files fs.FS
}

func (s EmbeddedSource) Items() ([]RawItem, error) {
	entries, err := fs.ReadDir(s.Files, "news")
	if err != nil {
		return nil, err
	}
	items := make([]RawItem, 0, len(entries))
	for _, entry := range entries {
		if !entry.IsDir() {
			return nil, fmt.Errorf("news/%s: an item directory is required", entry.Name())
		}
		item := RawItem{ID: entry.Name(), Locales: map[string][]byte{}, Assets: map[string][]byte{}}
		directory := path.Join("news", item.ID)
		files, err := fs.ReadDir(s.Files, directory)
		if err != nil {
			return nil, err
		}
		for _, file := range files {
			name := file.Name()
			if !file.Type().IsRegular() {
				return nil, fmt.Errorf("%s/%s: only files beside the item are allowed", directory, name)
			}
			data, err := fs.ReadFile(s.Files, path.Join(directory, name))
			if err != nil {
				return nil, err
			}
			switch name {
			case "ja.md", "en.md":
				item.Locales[name[:2]] = data
			default:
				item.Assets[name] = data
			}
		}
		items = append(items, item)
	}
	return items, nil
}
