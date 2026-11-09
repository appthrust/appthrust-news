package main

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/appthrust/appthrust-news/cmd/server/internal/content"
	"github.com/appthrust/appthrust-news/cmd/server/internal/render"
	embedded "github.com/appthrust/appthrust-news/content"
	"github.com/stretchr/testify/require"
)

const fixtureRoot = "internal/content/testdata/"

func environment(t *testing.T) {
	t.Helper()
	for _, name := range []string{"PLATFORM_OIDC_ISSUER", "PLATFORM_OIDC_ISSUER_CA_PEM", "PLATFORM_ACCESS_ISSUER", "APPTHRUST_NEWS_ACCESS_AUDIENCE", "APPTHRUST_NEWS_OIDC_AUDIENCES", "APPTHRUST_NEWS_RELEASE_FILE", "APPTHRUST_NEWS_SOURCE_REVISION"} {
		t.Setenv(name, "")
	}
	t.Setenv("APPTHRUST_NEWS_PUBLIC_URL", "https://news.pj-test.example.test")
	t.Setenv("APPTHRUST_NEWS_RELEASE_VERSION", "1.0.0")
	t.Setenv("APPTHRUST_NEWS_ARTIFACT_DIGEST", "sha256:"+strings.Repeat("a", 64))
}

func fixtureHandler(t *testing.T, fixture string) http.Handler {
	t.Helper()
	handler, err := newHandler(fixtureRoot+"static", "https://api.example.test", "pj-test", content.EmbeddedSource{Files: os.DirFS(fixtureRoot + fixture)})
	require.NoError(t, err)
	return handler
}

func call(handler http.Handler, path, bearer string) *httptest.ResponseRecorder {
	r := httptest.NewRequest(http.MethodGet, path, nil)
	if bearer != "" {
		r.Header.Set("Authorization", bearer)
	}
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)
	return w
}

// Unverified claims are supported only by the SDK's loopback development mode.
func userBearer() string {
	return "Bearer eyJhbGciOiJub25lIn0." + base64.RawURLEncoding.EncodeToString([]byte(`{"sub":"user-one","email":"one@example.test","name":"Display Name"}`)) + "."
}

func TestPublicRoutesAndBearerBoundaries(t *testing.T) {
	environment(t)
	handler := fixtureHandler(t, "valid")
	for _, path := range []string{"/healthz", "/readyz", "/releasez", "/config", "/", "/items/2026-11-01-pinned"} {
		require.Equal(t, 200, call(handler, path, "").Code, path)
	}
	require.JSONEq(t, `{"projectId":"pj-test","publicUrl":"https://news.pj-test.example.test"}`, call(handler, "/config", "").Body.String())
	release := call(handler, "/releasez", "")
	require.Contains(t, release.Body.String(), `"releaseVersion":"1.0.0"`)
	require.Contains(t, release.Body.String(), "sha256:"+strings.Repeat("a", 64))
	for _, path := range []string{"/launcher", apiBase + "/items", apiBase + "/items/2026-11-01-pinned", apiBase + "/items/2026-11-01-pinned/assets/image.svg", apiBase + "/latest", "/api/unknown"} {
		t.Run(path, func(t *testing.T) {
			response := call(handler, path, "")
			require.Equal(t, 401, response.Code)
			require.Contains(t, response.Body.String(), `"error":"unauthenticated"`)
		})
	}
	for _, bearer := range []string{"Bearer invalid", "Basic credentials"} {
		require.Equal(t, 401, call(handler, apiBase+"/items", bearer).Code)
	}
	// Assertions cannot be routed into the SDK's user-development mode.
	t.Setenv("PLATFORM_ACCESS_ISSUER", "https://access.example.test")
	handler = fixtureHandler(t, "valid")
	claims := base64.RawURLEncoding.EncodeToString([]byte(`{"iss":"https://access.example.test","sub":"key-one","email":"one@example.test"}`))
	require.Equal(t, 401, call(handler, apiBase+"/items", "Bearer eyJhbGciOiJub25lIn0."+claims+".").Code)
}

func TestListDetailLatestAndLocaleContracts(t *testing.T) {
	environment(t)
	handler := fixtureHandler(t, "valid")
	response := call(handler, apiBase+"/items?locale=en", userBearer())
	require.Equal(t, 200, response.Code)
	require.Equal(t, "no-store", response.Header().Get("Cache-Control"))
	require.Equal(t, "nosniff", response.Header().Get("X-Content-Type-Options"))
	var list content.ItemList
	require.NoError(t, json.Unmarshal(response.Body.Bytes(), &list))
	require.Len(t, list.Items, 6)
	require.Equal(t, "2026-11-02-pinned-z", list.Items[0].ID)
	require.Equal(t, "ja", list.Items[0].Locale)
	require.Equal(t, "en", list.Items[2].Locale)
	require.Equal(t, content.Edition{Version: "1.0.0", ItemCount: 6}, list.Edition)
	require.NotContains(t, response.Body.String(), `"markdown"`)
	require.NotContains(t, response.Body.String(), `"nextCursor"`)
	require.NotContains(t, response.Body.String(), `"updatedAt"`)
	for _, test := range []struct{ locale, actual, title string }{{"en", "en", "English fixture"}, {"ja", "ja", "Fixture title"}, {"fr", "ja", "Fixture title"}, {"", "ja", "Fixture title"}} {
		detail := call(handler, apiBase+"/items/2026-11-01-pinned?locale="+test.locale, userBearer())
		require.Equal(t, 200, detail.Code)
		var item content.Item
		require.NoError(t, json.Unmarshal(detail.Body.Bytes(), &item))
		require.Equal(t, test.actual, item.Locale)
		require.Equal(t, test.title, item.Title)
		require.Contains(t, item.Markdown, "[Dashboard](https://api.example.test)")
		require.Contains(t, item.Markdown, apiBase+"/items/2026-11-01-pinned/assets/image.svg")
		require.NotContains(t, item.Markdown, "{{")
	}
	latest := call(handler, apiBase+"/latest", userBearer())
	require.Equal(t, 200, latest.Code)
	require.JSONEq(t, `{"id":"2026-11-03-latest-z","publishedAt":"2026-11-10T11:00:00Z","edition":{"version":"1.0.0","itemCount":6}}`, latest.Body.String())
}

func TestPaginationAndQueryValidation(t *testing.T) {
	environment(t)
	handler := fixtureHandler(t, "valid")
	cursor := ""
	var ids []string
	for page := range 3 {
		response := call(handler, apiBase+"/items?limit=2&cursor="+cursor, userBearer())
		require.Equal(t, 200, response.Code)
		var list content.ItemList
		require.NoError(t, json.Unmarshal(response.Body.Bytes(), &list))
		require.Len(t, list.Items, 2)
		for _, item := range list.Items {
			ids = append(ids, item.ID)
		}
		cursor = list.NextCursor
		if page < 2 {
			require.Equal(t, list.Items[1].ID, cursor)
		} else {
			require.Empty(t, cursor)
		}
	}
	require.Equal(t, []string{"2026-11-02-pinned-z", "2026-11-02-pinned-a", "2026-11-01-pinned", "2026-11-03-latest-z", "2026-11-03-latest-a", "2026-11-04-older"}, ids)
	for _, query := range []string{"cursor=2026-11-04-older", "category=incident"} {
		response := call(handler, apiBase+"/items?"+query, userBearer())
		require.Equal(t, 200, response.Code)
		require.JSONEq(t, `{"items":[],"edition":{"version":"1.0.0","itemCount":6}}`, response.Body.String())
	}
	for _, query := range []string{"limit=1", "limit=100", "category=release", "locale=unknown"} {
		require.Equal(t, 200, call(handler, apiBase+"/items?"+query, userBearer()).Code, query)
	}
	for _, test := range []struct{ query, code string }{
		{"category=unknown", "invalid_category"},
		{"limit=0", "invalid_limit"},
		{"limit=101", "invalid_limit"},
		{"limit=-1", "invalid_limit"},
		{"limit=1.5", "invalid_limit"},
		{"limit=no", "invalid_limit"},
		{"limit=", "invalid_limit"},
		{"limit=99999999999999999999", "invalid_limit"},
		{"cursor=missing", "invalid_cursor"},
		{"cursor=2026-11-01-pinned&category=release", "invalid_cursor"},
	} {
		t.Run(test.query, func(t *testing.T) {
			response := call(handler, apiBase+"/items?"+test.query, userBearer())
			require.Equal(t, 400, response.Code)
			require.Contains(t, response.Body.String(), `"error":"`+test.code+`"`)
		})
	}
}

func TestAssetsAndNotFound(t *testing.T) {
	environment(t)
	handler := fixtureHandler(t, "valid")
	path := apiBase + "/items/2026-11-01-pinned/assets/image.svg"
	response := call(handler, path, userBearer())
	require.Equal(t, 200, response.Code)
	expected, err := os.ReadFile(fixtureRoot + "valid/news/2026-11-01-pinned/image.svg")
	require.NoError(t, err)
	require.Equal(t, expected, response.Body.Bytes())
	require.Contains(t, response.Header().Get("Content-Type"), "image/svg+xml")
	require.Equal(t, "no-store", response.Header().Get("Cache-Control"))
	require.Contains(t, response.Header().Get("Content-Security-Policy"), "sandbox")
	for _, path := range []string{apiBase + "/items/missing", apiBase + "/items/missing/assets/image.svg", apiBase + "/items/2026-11-01-pinned/assets/missing.svg", apiBase + "/items/2026-11-01-pinned/assets/ja.md", apiBase + "/items/2026-11-01-pinned/assets/..%2fja.md", "/api/unknown"} {
		response := call(handler, path, userBearer())
		require.Equal(t, 404, response.Code, path)
		require.Contains(t, response.Body.String(), `"error":"not_found"`)
	}
}

func TestInvalidContentKeepsProcessHealthyButUnready(t *testing.T) {
	for _, fixture := range []string{"unknown-template", "invalid-yaml", "html-block", "image-missing", "missing-ja"} {
		t.Run(fixture, func(t *testing.T) {
			environment(t)
			handler := fixtureHandler(t, fixture)
			require.Equal(t, 200, call(handler, "/healthz", "").Code)
			require.Equal(t, 200, call(handler, "/", "").Code)
			require.Equal(t, 200, call(handler, "/config", "").Code)
			response := call(handler, "/readyz", "")
			require.Equal(t, 503, response.Code)
			require.Contains(t, response.Body.String(), `"error":"content_unavailable"`)
			for _, path := range []string{apiBase + "/items", apiBase + "/items/missing", apiBase + "/items/missing/assets/image.svg", apiBase + "/latest"} {
				require.Equal(t, 401, call(handler, path, "").Code)
				response := call(handler, path, userBearer())
				require.Equal(t, 503, response.Code)
				require.Contains(t, response.Body.String(), `"error":"content_unavailable"`)
			}
		})
	}
}

func TestInvalidPublicURLKeepsHealthAlive(t *testing.T) {
	environment(t)
	t.Setenv("APPTHRUST_NEWS_PUBLIC_URL", "not-an-origin")
	handler := fixtureHandler(t, "valid")
	require.Equal(t, 200, call(handler, "/healthz", "").Code)
	require.Equal(t, 503, call(handler, "/readyz", "").Code)
	require.Equal(t, 503, call(handler, apiBase+"/latest", userBearer()).Code)
}

func TestStaticHistoryFallbackAndMissingAssets(t *testing.T) {
	environment(t)
	handler := fixtureHandler(t, "valid")
	for _, path := range []string{"/", "/items/2026-11-01-pinned"} {
		response := call(handler, path, "")
		require.Equal(t, 200, response.Code)
		require.Contains(t, response.Body.String(), "News fixture shell")
		require.Equal(t, "no-store", response.Header().Get("Cache-Control"))
	}
	require.Equal(t, 404, call(handler, "/assets/missing.js", "").Code)
	asset := call(handler, "/assets/app.js", "")
	require.Equal(t, 200, asset.Code)
	require.Equal(t, "public, max-age=31536000, immutable", asset.Header().Get("Cache-Control"))
	r := httptest.NewRequest(http.MethodPost, "/", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)
	require.Equal(t, 405, w.Code)
}

// All behavioral cases use testdata. This is the single release-content check.
func TestEmbeddedEditionParses(t *testing.T) {
	values, err := render.NewValues("https://api.example.test", "pj-test", "https://news.pj-test.example.test", "1.0.0")
	require.NoError(t, err)
	catalog, err := content.Load(content.EmbeddedSource{Files: embedded.Files}, values)
	require.NoError(t, err)
	require.NotZero(t, catalog.Latest().Edition.ItemCount)
}
