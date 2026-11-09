package main

import (
	"context"
	"errors"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/appthrust/appserver-go/appserver/platformenv"
	"github.com/appthrust/appthrust-news/cmd/server/internal/content"
	embedded "github.com/appthrust/appthrust-news/content"
)

func main() {
	listen := flag.String("listen", ":8080", "HTTP listen address")
	defaultStaticDir := os.Getenv("APPTHRUST_NEWS_STATIC_DIR")
	if defaultStaticDir == "" {
		defaultStaticDir = "/srv/appthrust-news"
	}
	staticDir := flag.String("static-dir", defaultStaticDir, "static SPA appthrust-news")
	flag.Parse()
	if flag.NArg() != 0 {
		log.Fatal("usage: appthrust-news-server [--listen :8080] [--static-dir /srv/appthrust-news]")
	}
	// Validate platform identity before binding the listener.
	platform, err := platformenv.FromEnv()
	if err != nil {
		log.Fatal(err)
	}
	if err := platformenv.ValidateIdentityListen(*listen, platform.OIDCIssuer); err != nil {
		log.Fatal(err)
	}
	handler, err := newHandler(*staticDir, platform.APIURL, platform.ProjectID, content.EmbeddedSource{Files: embedded.Files})
	if err != nil {
		log.Fatal(err)
	}
	server := &http.Server{Addr: *listen, Handler: handler, ReadHeaderTimeout: 10 * time.Second}
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	go func() {
		<-ctx.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdown); err != nil {
			log.Printf("shutdown: %v", err)
		}
	}()
	log.Printf("appthrust-news-server listening on %s", *listen)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
