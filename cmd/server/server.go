package main

import (
	"bytes"
	"errors"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/appthrust/appserver-go/appserver/httpx"
	"github.com/appthrust/appserver-go/appserver/identity"
	"github.com/appthrust/appserver-go/appserver/launcher"
	"github.com/appthrust/appserver-go/appserver/platformclient"
	"github.com/appthrust/appserver-go/appserver/platformenv"
	"github.com/appthrust/appserver-go/appserver/releaseidentity"
	"github.com/appthrust/appthrust-news/cmd/server/internal/content"
	"github.com/appthrust/appthrust-news/cmd/server/internal/render"
)

const apiBase = "/api/news/v1"

func newHandler(staticDir, upstreamURL, projectID string, source content.Source) (http.Handler, error) {
	origin, err := platformenv.Validate(upstreamURL, projectID)
	if err != nil {
		return nil, err
	}
	upstreamURL = origin.String()
	authenticator, err := identity.New(identity.FromEnv("APPTHRUST_NEWS"))
	if err != nil {
		return nil, err
	}
	values, contentErr := render.NewValues(upstreamURL, projectID, os.Getenv("APPTHRUST_NEWS_PUBLIC_URL"), os.Getenv("APPTHRUST_NEWS_RELEASE_VERSION"))
	var news *content.Catalog
	if contentErr == nil {
		news, contentErr = content.Load(source, values)
	}
	if contentErr != nil {
		log.Printf("appthrust-news content validation failed: %v", contentErr)
	}
	unavailable := func(w http.ResponseWriter) {
		httpx.WriteError(w, httpx.Fail(503, "content_unavailable", "News content is unavailable"), "appthrust-news")
	}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		_, _ = w.Write([]byte("ok\n"))
	})
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
		if contentErr != nil {
			unavailable(w)
			return
		}
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		_, _ = w.Write([]byte("ok\n"))
	})
	mux.Handle("GET /releasez", releaseidentity.NewHandler("APPTHRUST_NEWS", func(w http.ResponseWriter, r *http.Request) {
		httpx.WriteError(w, httpx.Fail(503, "release_unavailable", "Release identity is unavailable"), "appthrust-news")
	}))
	mux.HandleFunc("GET /config", func(w http.ResponseWriter, r *http.Request) {
		httpx.WriteJSON(w, http.StatusOK, map[string]string{"projectId": projectID, "publicUrl": os.Getenv("APPTHRUST_NEWS_PUBLIC_URL")})
	})
	catalog := launcher.NewCatalog(platformclient.New(upstreamURL, projectID, platformclient.WithHTTPClient(authenticator.HTTPClient())), "appthrust-news")
	mux.Handle("GET /launcher", launcher.NewHandler(catalog, authenticator.Authenticate))

	protect := func(handler http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			caller, _, err := authenticator.Authenticate(r.Context(), r.Header.Get("Authorization"))
			if err != nil || caller.Principal.Kind != "user" {
				code, status, message := "unauthenticated", http.StatusUnauthorized, "A valid bearer token is required"
				if errors.Is(err, identity.ErrUnavailable) {
					code, status, message = "identity_unavailable", http.StatusServiceUnavailable, "The identity provider is temporarily unavailable"
				}
				httpx.WriteError(w, httpx.Fail(status, code, message), "appthrust-news")
				return
			}
			w.Header().Set("Cache-Control", "no-store")
			w.Header().Set("X-Content-Type-Options", "nosniff")
			handler(w, r)
		}
	}
	contentRoute := func(pattern string, handler http.HandlerFunc) {
		mux.HandleFunc(pattern, protect(func(w http.ResponseWriter, r *http.Request) {
			if contentErr != nil {
				unavailable(w)
				return
			}
			handler(w, r)
		}))
	}
	contentRoute("GET "+apiBase+"/items", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		category := query.Get("category")
		if category != "" && !content.ValidCategory(category) {
			httpx.WriteError(w, httpx.Fail(400, "invalid_category", "The category is not supported"), "appthrust-news")
			return
		}
		limit := 20
		if query.Has("limit") {
			var err error
			limit, err = strconv.Atoi(query.Get("limit"))
			if err != nil || limit < 1 || limit > 100 {
				httpx.WriteError(w, httpx.Fail(400, "invalid_limit", "The limit must be an integer from 1 to 100"), "appthrust-news")
				return
			}
		}
		list, err := news.List(query.Get("locale"), category, query.Get("cursor"), limit)
		if err != nil {
			httpx.WriteError(w, httpx.Fail(400, "invalid_cursor", "The cursor does not identify an item in this list"), "appthrust-news")
			return
		}
		httpx.WriteJSON(w, http.StatusOK, list)
	})
	contentRoute("GET "+apiBase+"/items/{id}", func(w http.ResponseWriter, r *http.Request) {
		item, ok := news.Item(r.PathValue("id"), r.URL.Query().Get("locale"))
		if !ok {
			httpx.WriteError(w, httpx.NotFound(), "appthrust-news")
			return
		}
		httpx.WriteJSON(w, http.StatusOK, item)
	})
	contentRoute("GET "+apiBase+"/items/{id}/assets/{file}", func(w http.ResponseWriter, r *http.Request) {
		data, ok := news.Asset(r.PathValue("id"), r.PathValue("file"))
		if !ok {
			httpx.WriteError(w, httpx.NotFound(), "appthrust-news")
			return
		}
		// SVG is an image too; prohibit active content when opened directly.
		w.Header().Set("Content-Security-Policy", "default-src 'none'; sandbox")
		http.ServeContent(w, r, r.PathValue("file"), time.Time{}, bytes.NewReader(data))
	})
	contentRoute("GET "+apiBase+"/latest", func(w http.ResponseWriter, r *http.Request) {
		httpx.WriteJSON(w, http.StatusOK, news.Latest())
	})
	mux.HandleFunc("/api/", protect(func(w http.ResponseWriter, r *http.Request) {
		httpx.WriteError(w, httpx.NotFound(), "appthrust-news")
	}))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) { serveStatic(w, r, staticDir) })
	return mux, nil
}

func serveStatic(w http.ResponseWriter, r *http.Request, root string) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", "GET, HEAD")
		httpx.WriteError(w, httpx.Fail(405, "method_not_allowed", "Only GET and HEAD are supported"), "appthrust-news")
		return
	}
	name := filepath.Join(root, filepath.FromSlash(strings.TrimPrefix(path.Clean("/"+r.URL.Path), "/")))
	info, err := os.Stat(name)
	asset := strings.HasPrefix(r.URL.Path, "/assets/")
	if err != nil || !info.Mode().IsRegular() {
		if asset {
			http.NotFound(w, r)
			return
		}
		name = filepath.Join(root, "index.html")
	}
	file, err := os.Open(name)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer file.Close()
	info, err = file.Stat()
	if err != nil || !info.Mode().IsRegular() {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	if filepath.Base(name) == "index.html" {
		w.Header().Set("X-Content-Type-Options", "nosniff")
	} else if asset {
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	}
	http.ServeContent(w, r, filepath.Base(name), info.ModTime(), file)
}
