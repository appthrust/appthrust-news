# AppThrust News

AppThrust product news for signed-in Project members: releases, new marketplace
apps, maintenance, incidents and events. A Go server serves a React SPA and the
`/api/news/v1` API. Markdown and images are embedded in each release image.

The app is stateless: no database, service credential or platform writes. Unread
markers live only in the browser, under `appthrust-news:last-seen`; clearing browser
storage makes items unread again. The interface supports Japanese and English.
News is global, not targeted to an estate or Project.

## Layout

- `cmd/server/`: entrypoint, authenticated routes and health/release probes.
- `cmd/server/internal/content/`: content source, validation, ordering and indexes.
- `cmd/server/internal/render/`: strict template rendering.
- `content/news/<id>/`: Japanese and optional English Markdown, plus local images.
- `content/embed.go`: embeds the news edition into the binary.
- `web/`: Vite/React SPA and development mock.
- `catalog/`: application definition, bilingual listing and screenshots.
- `hack/publish-entry.ts`: catalog submission, listing updates and signed readback.
- `hack/catalog-listing.ts`: listing validation and immutable screenshot uploads.
- `hack/check-edition.ts`: git adapter for the append-only edition check.
- `hack/edition.ts`: pure edition comparison, frontmatter extraction and base selection.
- `.github/workflows/`: CI, image publication and listing publication.
- `docs/design.md`: authoritative domain, content and HTTP contracts.

The server uses `github.com/appthrust/appserver-go`. The launcher and i18n web
packages come from GitHub Packages; no platform checkout is needed.

## Develop

Use Go 1.26 or newer and Bun 1.4.1. Supply a GitHub Packages credential through
`NODE_AUTH_TOKEN`, never a committed environment file.

```sh
go test ./cmd/...
go vet ./cmd/...
bun test hack
cd web
bun install --frozen-lockfile
bun run typecheck
bun test src
bun run build:image
```

For standalone UI development, run `bun run mock` and `bun run dev` in separate
terminals in `web/`. To serve the built SPA with the API, configure the environment
below and run from the repository root:

```sh
go run ./cmd/server --static-dir web/dist
```

`--listen` defaults to `:8080`. For issuer-free local development, bind explicitly
to `127.0.0.1:8080`; do not expose unverified local bearer handling to the network.
The installed app requires Project sign-in. The SPA and probes sit behind the
platform edge; `/launcher`, news API routes and item assets require a user bearer.

### Environment

The platform connection and catalog supply these settings in an installed app:

| Variable | Purpose |
| --- | --- |
| `PLATFORM_API_URL` | Platform API origin used by the launcher and content links. |
| `PLATFORM_PROJECT_ID` | Project identifier. |
| `PLATFORM_OIDC_ISSUER` | Issuer of signed-in members' bearer tokens. |
| `PLATFORM_OIDC_ISSUER_CA_PEM` | Optional certificate-only trust bundle for the issuer. |
| `APPTHRUST_NEWS_PUBLIC_URL` | Public app origin, used in rendered links. |
| `APPTHRUST_NEWS_OIDC_AUDIENCES` | Comma-separated trusted user-token audiences. |
| `APPTHRUST_NEWS_STATIC_DIR` | SPA directory; defaults to `/srv/appthrust-news`, overridden by `--static-dir`. |
| `APPTHRUST_NEWS_RELEASE_VERSION` | Edition version used in content and `/releasez`. |
| `APPTHRUST_NEWS_ARTIFACT_DIGEST` | Release image digest reported by `/releasez`. |
| `APPTHRUST_NEWS_SOURCE_REVISION` | Optional source revision reported by `/releasez`. |

`NODE_AUTH_TOKEN` is a dependency/build credential, not a runtime setting.
Content parses once at boot. Invalid content leaves `/healthz` alive, makes
`/readyz` return 503, and makes content routes return `content_unavailable`.
The previous healthy edition can keep serving while an invalid release is rejected.

## Content authoring

Create `content/news/YYYY-MM-DD-<slug>/ja.md`. Japanese is required; add `en.md`
when an English translation is ready. A missing English translation falls back to
Japanese, with the actual locale visible to the reader. Both locales use the same
item id and identical `publishedAt` string.

Each Markdown file starts with YAML frontmatter:

```yaml
---
title: AppThrust からのお知らせ
summary: 一覧に表示する、1〜2 文の短い説明。
publishedAt: 2026-11-10T09:00:00+09:00
category: announcement
pinned: false
tags: [appthrust]
---
```

- `title`, `summary`, `publishedAt`, `category` and `tags` describe the item.
  Timestamps use RFC 3339, including the timezone.
- `category` is `announcement`, `release`, `feature`, `maintenance`, `incident`
  or `event`.
- `pinned` is optional and defaults to false; at most three items may be pinned.
  Pinned items appear first, then publication time descending and id descending.
- `updatedAt` is optional and used for corrections. Unknown frontmatter keys are
  rejected.

The body is Markdown. Only these template fields are allowed:
`{{.PlatformAPIURL}}`, `{{.ProjectID}}`, `{{.PublicURL}}`, `{{.BaseDomain}}`,
`{{.ReleaseVersion}}`. No functions, conditionals, custom fields or raw HTML.
Never hardcode an estate hostname, Project id or credentials. Announcements must
be suitable for every installation, not just one customer.

Put images beside the locale files and reference them as `![alt](./image.webp)`.
Remote images are rejected. The server embeds the files, rewrites local image
references to `/api/news/v1/items/{id}/assets/{file}`, and requires the same user
bearer for the asset as for the item.

### Append-only editions

A release is the complete news edition, not a set of changes:

- Never remove or rename a previously released item directory.
- Never remove a published locale, even when the remaining locale has a newer
  `updatedAt`. A correction may change existing content, not erase it.
- Never change `publishedAt` in any locale, including its timezone spelling.
- Changing an existing locale's title or body requires `updatedAt`. Set it at or
  after `publishedAt` for the first correction; later corrections must advance it
  strictly beyond that locale's previous `updatedAt`.
- Adding a locale to an existing item does not require `updatedAt`, but its
  `publishedAt` must exactly match the item's original value.
- Adding a new item does not require `updatedAt`.

After committing the content change, compare the committed `HEAD` edition:

```sh
bun hack/check-edition.ts
bun hack/check-edition.ts --base v1.0.0
```

The default base is the latest reachable `v*` tag, ordered by Git version sort.
No base edition means the check passes. The checker reads git objects, not
uncommitted working-tree files, reports every comparison violation and exits
non-zero if any exist. CI fetches full history and tags. The tag publisher uses
`--exclude-tag "$TAG"` so the new release is compared with the latest earlier
reachable release, never with itself; a first tag reports **no base edition**.

## Catalog and releases

`catalog/entry.yaml` contains one `web-service` component, no dependencies, and
`versions: []`. The publisher is the only writer of version history. The app uses
the `collaborate` category, bundled `sparkles` icon and `news` hostname label.
The default update policy is `follow`; Project owners may choose `pinned` instead.
Pinned installations do not receive later news automatically.

All versions are `1.x.y`, always in catalog stream `"1"`. The first release is
`1.0.0`. Use patch releases for content-only changes and minor releases for server
or SPA changes. The publisher refuses any other major. Do not create a new stream
for a content release. Changes that add or remove graph members are not delivered
by `follow` and require a separately planned installation migration.

Build locally with a BuildKit package secret:

```sh
docker build --secret id=NODE_AUTH_TOKEN,env=NODE_AUTH_TOKEN -t appthrust-news-local .
```

The image runs `/appthrust-news-server`, serves `/srv/appthrust-news`, and listens
on port 8080. No package credential belongs in the runtime image.

### Release procedure

1. Submit the news or application change by PR, pass CI and merge to `main`.
2. Tag the release `v1.x.y` (`v1.0.0` for the first release).
3. The publish workflow checks the append-only edition before building or pushing.
   It builds amd64/arm64 images at `ghcr.io/appthrust/appthrust-news` and signs the
   image index. A rerun reuses the digest already recorded for that version.
4. The publisher preserves prior catalog versions and refuses to replace immutable
   image digests. It submits the entry to Cloud and requests a catalog publication.
   A snapshot response triggers the Cloud dispatch; a queued response is already
   scheduled by Cloud.
5. The workflow waits for the exact version and digest in the signed catalog.
   Dispatch success is not publication proof. Make the GHCR package public after
   the first publication.
6. Install from the Project marketplace with policy `follow`. Later editions arrive
   through catalog polling and image rollout. Read `/releasez` to identify the
   installed version and digest; the SPA footer also shows the edition version.

Publisher interfaces (release coordinates are supplied through the environment):

```sh
bun hack/publish-entry.ts recorded --version "$VERSION"
bun hack/publish-entry.ts submit --version "$VERSION" --digest "$DIGEST"
bun hack/publish-entry.ts await --version "$VERSION" --digest "$DIGEST"
bun hack/publish-entry.ts validate-listing
bun hack/publish-entry.ts listing
```

Signed catalog readback uses ORAS 1.3.0 and Cosign v3.1.3. Both publication workflows
are guarded to `appthrust/appthrust-news` and share the concurrency group
`appthrust-news-catalog-publish` so release and listing writers cannot overlap.

### Listing updates

`catalog/listing.yaml` contains Japanese and English copy, highlights and screenshot
references. Capture `catalog/screenshots/home.webp` and `item.webp` from the SPA
against its development mock. Keep each image within 512 KiB and provide ja/en
alt text. The helper derives dimensions and SHA-256 digests from the actual files
and uploads immutable media before submitting the listing.

Validate with `bun hack/publish-entry.ts validate-listing`. Merging a listing or
screenshot change to `main` runs the listing-only publisher; it preserves the
stored versions and does not create an app release. Publish the first release
before using this workflow, since it requires an existing catalog entry.

### Workflow credentials and variables

Repository secret:

- `CLOUD_CATALOG_ADMIN_TOKEN`

Organization App secrets:

- `APPTHRUST_GITHUB_ACTIONS_APP_ID`
- `APPTHRUST_GITHUB_ACTIONS_APP_PRIVATE_KEY`

GitHub-provided workflow token:

- `GITHUB_TOKEN`

Optional repository variable:

- `CLOUD_API_URL`

Local dependency/build credential:

- `NODE_AUTH_TOKEN`

Grant the repository read access to the shared GitHub Packages. Keep credential
values out of files, logs and screenshots.
