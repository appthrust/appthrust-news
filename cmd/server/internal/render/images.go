package render

import (
	"fmt"
	"html"
	"net/url"
	"slices"
	"strings"

	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/text"
	"github.com/yuin/goldmark/util"
)

type imageSpan struct {
	start, end int
	value      string
}

// Record only the image suffix after its closing label bracket. Replacing that
// suffix supports inline, full, collapsed and shortcut references without
// changing alt text, ordinary links, reference definitions or code samples.
type imageParser struct {
	parser.InlineParser
	spans map[*ast.Image]imageSpan
}

func (p *imageParser) Parse(parent ast.Node, reader text.Reader, context parser.Context) ast.Node {
	_, start := reader.Position()
	node := p.InlineParser.Parse(parent, reader, context)
	if image, ok := node.(*ast.Image); ok {
		_, end := reader.Position()
		p.spans[image] = imageSpan{start: start.Start + 1, end: end.Start}
	}
	return node
}

func (p *imageParser) CloseBlock(parent ast.Node, reader text.Reader, context parser.Context) {
	p.InlineParser.(parser.CloseBlocker).CloseBlock(parent, reader, context)
}

// Images rejects active HTML and non-local images using the Markdown syntax
// tree, then rewrites image destinations while preserving the surrounding text.
func Images(name, markdown, assetPrefix string, exists func(string) bool) (string, error) {
	links := &imageParser{InlineParser: parser.NewLinkParser(), spans: map[*ast.Image]imageSpan{}}
	inline := parser.DefaultInlineParsers()
	for index := range inline {
		if inline[index].Value == links.InlineParser {
			inline[index].Value = links
		}
	}
	p := parser.NewParser(
		parser.WithBlockParsers(parser.DefaultBlockParsers()...),
		parser.WithInlineParsers(inline...),
		parser.WithParagraphTransformers(parser.DefaultParagraphTransformers()...),
	)
	source := []byte(markdown)
	document := p.Parse(text.NewReader(source))
	var edits []imageSpan
	err := ast.Walk(document, func(node ast.Node, entering bool) (ast.WalkStatus, error) {
		if !entering {
			return ast.WalkContinue, nil
		}
		switch node := node.(type) {
		case *ast.HTMLBlock, *ast.RawHTML:
			return ast.WalkStop, fmt.Errorf("%s: raw HTML is not allowed", name)
		case *ast.Image:
			destination := html.UnescapeString(string(util.UnescapePunctuations(node.Destination)))
			u, err := url.Parse(destination)
			if err != nil || u.IsAbs() || u.Host != "" || strings.HasPrefix(destination, "/") || u.RawQuery != "" || u.ForceQuery || u.Fragment != "" || strings.Contains(destination, "#") {
				return ast.WalkStop, fmt.Errorf("%s: image must reference a file beside the item (remote images are not allowed)", name)
			}
			file := strings.TrimPrefix(u.Path, "./")
			if file == "" || file == "." || file == ".." || strings.ContainsAny(file, "/\\") || !exists(file) {
				return ast.WalkStop, fmt.Errorf("%s: image %q must name an existing file beside the item", name, destination)
			}
			span := links.spans[node]
			span.value = "(<" + assetPrefix + url.PathEscape(file) + ">"
			if len(node.Title) != 0 {
				span.value += ` "` + strings.ReplaceAll(string(node.Title), `"`, `\"`) + `"`
			}
			span.value += ")"
			edits = append(edits, span)
		}
		return ast.WalkContinue, nil
	})
	if err != nil {
		return "", err
	}
	if len(edits) == 0 {
		return markdown, nil
	}
	slices.SortFunc(edits, func(a, b imageSpan) int { return a.start - b.start })
	var result strings.Builder
	result.Grow(len(markdown))
	start := 0
	for _, edit := range edits {
		result.WriteString(markdown[start:edit.start])
		result.WriteString(edit.value)
		start = edit.end
	}
	result.WriteString(markdown[start:])
	return result.String(), nil
}
