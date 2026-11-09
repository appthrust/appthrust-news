package render

import (
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestValuesDeriveOnlyTheExactInstallationPrefix(t *testing.T) {
	for _, test := range []struct{ url, domain string }{
		{"https://news.pj-test.example.test/", "example.test"},
		{"https://news.other.example.test", "news.other.example.test"},
		{"https://news.pj-test.example.test:8443", "example.test"},
		{"https://news.example.test", "news.example.test"},
		{"http://localhost:8080", "localhost"},
		{"http://[::1]:8080", "::1"},
	} {
		t.Run(test.url, func(t *testing.T) {
			values, err := NewValues("https://api.example.test/", "pj-test", test.url, "1.0.0")
			require.NoError(t, err)
			require.Equal(t, test.domain, values.BaseDomain)
			require.Equal(t, "https://api.example.test", values.PlatformAPIURL)
		})
	}
	for _, invalid := range []string{"", "https://user:password@example.test", "https://example.test/path", "https://example.test?x=1", "https://example.test?", "https://example.test#", "file:///tmp/news"} {
		_, err := NewValues("https://api.example.test", "pj-test", invalid, "1.0.0")
		require.ErrorContains(t, err, "APPTHRUST_NEWS_PUBLIC_URL must be an HTTP(S) origin")
	}
}

func TestImageReferencesPreserveMarkdown(t *testing.T) {
	source, err := os.ReadFile("testdata/images.md")
	require.NoError(t, err)
	expected, err := os.ReadFile("testdata/images.expected.md")
	require.NoError(t, err)
	rendered, err := Images("fixture", string(source), "/assets/", func(file string) bool { return file == "image.svg" })
	require.NoError(t, err)
	require.Equal(t, string(expected), rendered)
}
