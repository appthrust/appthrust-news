# AppThrust News: a marketplace app that delivers AppThrust announcements to Project members

Status: accepted 2026-11-10 (owner decision: pull-only delivery, global audience and
batched releases are accepted for v1). Reference implementation shape:
`appthrust/agent-guide` at `426d21275fb1ab25b46a22cd6d90a80ed4335d5e`.

Baselines read: `design/platform/marketplace-apps/README.md` (D1–D7, catalog artifact,
`AppCatalogSource`, `AppInstallation`, app developer contract, lifecycle),
`design/platform/marketplace-apps/first-party-app-repositories.md` (app repository and
publisher contract), `appthrust/agent-guide` (`README.md`, `catalog/entry.yaml`,
`catalog/listing.yaml`, `.github/workflows/{publish,catalog-listing}.yml`).

## Problem

AppThrust starts serving Craftsman. Its members have no in-product place to learn what
changed: releases, new marketplace apps, maintenance windows, incidents, events. The
marketing page `appthrust.com/new` is outside the product and outside the Project sign-in.
The news must be authored by AppThrust (the vendor), not by each customer, and must reach
every installation without a per-estate operation.

## Decision

| # | Decision | Why |
| --- | --- | --- |
| N1 | AppThrust News is a first-party marketplace app `appthrust-news` in its own repository `appthrust/appthrust-news`, published through the Cloud catalog and installed as an ordinary `AppInstallation`. | ADR-0072 D1/D7; the only supported path to a marketplace entry. No platform or Cloud source change. |
| N2 | News content is release-versioned Markdown embedded in the image. Publishing a news item is a patch release. | Same model as Agent Guide. The signed catalog is already the vendor-to-estate delivery channel; no second trust path, no runtime egress, works behind a mirror (`AppCatalogSource.spec.imageMirror`). |
| N3 | The catalog entry defaults to `updatePolicy: follow` and every release stays in one stream (`stream: "1"`, versions `1.x.y`). | `follow` admits new tags of the installed stream and release-v2 rolls the image without a human; it does not cross streams and does not re-render the graph (lifecycle step 4). A news app that stops following stops delivering, so the stream must not change for content. |
| N4 | The server is stateless: one `web-service` component, no PostgreSQL, no dependencies, no requirements, no access keys. | Nothing is written per installation. The customer owns no news data, so uninstall/reinstall loses nothing. |
| N5 | Read state is browser-local in v1 (`localStorage`). | Cross-device unread needs a database and a member identity store; not justified before the reading surface exists. The content source and read-state are ports, so adding either later changes no consumer. |
| N6 | Content is global: every estate that follows the `appthrust` catalog sees the same items. No per-estate targeting in v1. | The catalog has one audience. Estate-specific notices need a different owner and channel (see Out of scope). |

## Domain model

| Entity | Owner (sole writer) | Lifecycle | Invariants |
| --- | --- | --- | --- |
| **NewsItem** | AppThrust news author, by PR to `content/news/` | drafted on a branch → merged → released | `id` = directory name `YYYY-MM-DD-<slug>`, immutable after first release; `publishedAt` never changes; a correction sets `updatedAt` and keeps the id |
| **NewsEdition** | the release (`v1.x.y` tag) | immutable per image digest | the complete, ordered set of NewsItems in that image; an edition only adds items or corrects existing ones, it never silently drops one (enforced by a release check against the previous tag) |
| **Catalog entry `appthrust-news`** | publisher workflow through the Cloud catalog API | `PUT entries/appthrust-news` → `POST publish` → signed OCI artifact | `images.web` digest immutable per version; `stream: "1"` for every version |
| **AppInstallation `appthrust-news`** | Project owner through the Platform API | install → `follow` → uninstall | a read-only projection of one NewsEdition; holds no data |
| **ReadMarker** | the member's browser | per origin | `{lastSeenPublishedAt}`; lost markers degrade to "everything unread", never to an error |

```mermaid
flowchart LR
  Author[News author] -- PR content/news --> Repo[appthrust/appthrust-news]
  Repo -- tag v1.x.y --> Img[ghcr.io/appthrust/appthrust-news@digest]
  Repo -- PUT entry + publish --> Cat[Signed catalog ghcr.io/appthrust/catalog]
  Cat -- AppCatalogSource poll + verify --> Def[ApplicationStackDefinition appthrust-news]
  Def -- follow admits 1.x.y --> Inst[AppInstallation in the Project]
  Inst --> Web[news.PROJECT.BASEDOMAIN]
  Web --> Member[Project member, signed in]
```

Ownership boundaries:

- The server never writes to the platform and holds no service credential.
- The publisher workflow is the only writer of the entry's `versions[]`.
- The Project owner decides install, `follow`/`pinned`, and uninstall. AppThrust cannot
  push news into a Project that pinned or uninstalled the app.

## Contracts

### Repository layout (mirrors `appthrust/agent-guide`)

```
appthrust-news/
  go.mod                       requires github.com/appthrust/appserver-go
  cmd/server/                  entrypoint, routes
  cmd/server/internal/content/ frontmatter validation, ordering, indexes (port: content.Source)
  cmd/server/internal/render/  Markdown + strict template rendering
  content/news/<id>/{ja,en}.md embedded by content/embed.go
  web/                         Vite/React SPA (@appthrust/app-launcher, platform-dashboard-i18n)
  catalog/{entry.yaml,listing.yaml,screenshots/}
  hack/publish-entry.ts        submit | await | validate-listing | listing (Agent Guide interface)
  hack/check-edition.ts        append-only check against the previous tag
  .github/workflows/{ci,publish,catalog-listing}.yml
  docs/design.md               this document
```

`content.Source` is the single seam between "where items come from" and everything that
serves them. v1 has one adapter (embedded FS). A feed adapter can be added without
touching the API or the SPA.

### `catalog/entry.yaml`

```yaml
apiVersion: appthrust.io/v1alpha1
kind: ApplicationStackDefinition
metadata: { name: appthrust-news }
spec:
  display: { title: AppThrust News, category: collaborate, iconRef: { name: sparkles },
             description: "Product news from AppThrust: releases, new marketplace apps, maintenance and incidents." }
  components:
    - id: web
      definitionRef: { name: web-service, version: v1 }
      defaultValues: { port: 8080, minScale: 1, readinessProbePath: /readyz, livenessProbePath: /healthz, publicURLEnv: APPTHRUST_NEWS_PUBLIC_URL }
  publish: { hostnameLabel: news }
  access:
    audiences: [appthrust-platform-api]
    scopes: [openid, profile, email]
  releaseIdentityEnvPrefix: APPTHRUST_NEWS
  updatePolicy: { default: follow, allowed: [follow, pinned] }
  versions: []   # written by hack/publish-entry.ts on tag; every element stream: "1"
```

`category: collaborate` is the Cloud catalog grouping used by `portal`, `memo` and
`directory`. `iconRef.name: sparkles` is a bundled Dashboard launcher icon key; there is no
news-specific key today, and unknown keys fall back to `puzzle`.

### Content tree

`content/news/<id>/ja.md` is required; `en.md` is optional. The API serves the requested
locale and falls back to `ja`. Frontmatter (unknown keys rejected):

```yaml
---
title: AppThrust を Craftsman に提供開始しました
summary: 一覧に出る 1〜2 文。
publishedAt: 2026-11-10T09:00:00+09:00
updatedAt:                 # optional, corrections only
category: announcement     # announcement | release | feature | maintenance | incident | event
pinned: false              # optional; pinned items sort first, at most 3
tags: [craftsman]
---
```

Body is Markdown with the Agent Guide template field set only (`{{.PlatformAPIURL}}`,
`{{.ProjectID}}`, `{{.PublicURL}}`, `{{.BaseDomain}}`, `{{.ReleaseVersion}}`): a news item
can link to "the marketplace in your Dashboard" without naming an estate. No functions,
no conditionals, no raw HTML, no remote images (images are embedded files beside the item).
Never hardcode an estate hostname or Project ID.

Content parses once at boot. A defect keeps `/healthz` alive, fails `/readyz`, so
release-v2 keeps the previous edition serving. CI runs the same validation plus
`hack/check-edition.ts`, which compares HEAD with the latest earlier `v*` tag (a tag run
excludes its own tag; no earlier tag passes):

- an item present at the base must exist at HEAD;
- a locale of an existing item is never removed, with or without `updatedAt`;
- `publishedAt` of an existing item never changes;
- a changed title or body needs `updatedAt` set (not before `publishedAt`) or advanced;
- a locale added to an existing item needs no `updatedAt` and carries the item's original
  `publishedAt`.

### HTTP surface

| Route | Auth | Response |
| --- | --- | --- |
| `GET /healthz`, `GET /readyz` | none | 200 once content is parsed; `readyz` 503 while parsing or invalid |
| `GET /releasez` | none | `releaseidentity.NewHandler("APPTHRUST_NEWS", …)` |
| `GET /config` | none | `{ "projectId", "publicUrl" }` |
| `GET /launcher` | bearer | `launcher.NewHandler` (Agent Guide convention) |
| `GET /api/news/v1/items?locale=&category=&cursor=&limit=` | user bearer | `ItemList` |
| `GET /api/news/v1/items/{id}?locale=` | user bearer | `Item`; 404 `not_found` |
| `GET /api/news/v1/latest` | user bearer | `Latest` |
| `GET /` and SPA routes (`/`, `/items/{id}`) | edge cookie | SPA from `--static-dir` (default `/srv/appthrust-news`), history fallback |

```ts
type Category = 'announcement' | 'release' | 'feature' | 'maintenance' | 'incident' | 'event'
type Locale = 'ja' | 'en'
type ItemSummary = {
  id: string              // YYYY-MM-DD-<slug>
  title: string
  summary: string
  category: Category
  publishedAt: string     // RFC 3339
  updatedAt?: string      // RFC 3339, corrections only
  pinned: boolean
  tags: string[]          // always an array
  locale: Locale          // the locale actually served (fallback is visible)
}
type Item = ItemSummary & { markdown: string }   // rendered template, Markdown; the SPA renders it with marked + dompurify
type ItemList = { items: ItemSummary[]; nextCursor?: string; edition: Edition }
type Latest = { id: string; publishedAt: string; edition: Edition } | { edition: Edition }   // no id when the edition is empty
type Edition = { version: string; itemCount: number }
```

- Order: pinned items first, then `publishedAt` descending, then `id` descending. `Latest`
  ignores `pinned`: it is the item with the greatest `(publishedAt, id)`.
- `locale`: `ja` or `en`; absent or unknown means `ja`. An item without `en.md` is served
  from `ja.md` with `locale: "ja"`.
- `category`: optional filter; an unknown value is 400 `invalid_category`.
- `limit`: 1–100, default 20; out of range is 400 `invalid_limit`. `cursor` is opaque
  (the last `id` of the previous page); an unknown cursor is 400 `invalid_cursor`.
- Images referenced by an item as `![alt](./file.webp)` are embedded beside it and served
  at `GET /api/news/v1/items/{id}/assets/{file}` (user bearer); the server rewrites the
  relative reference to that path. Remote image URLs fail content validation.
- Error envelope: `appserver/httpx` (`WriteError(w, err, "appthrust-news")`).
- Authentication: `identity.New(identity.FromEnv("APPTHRUST_NEWS"))`. There is no Access
  Key space, so `APPTHRUST_NEWS_ACCESS_AUDIENCE` is unset and assertions are not accepted.
- When content is invalid, content routes return 503 `content_unavailable`.

Environment: `PLATFORM_API_URL`, `PLATFORM_PROJECT_ID`, `PLATFORM_OIDC_ISSUER`,
`PLATFORM_OIDC_ISSUER_CA_PEM`, `APPTHRUST_NEWS_PUBLIC_URL`, `APPTHRUST_NEWS_OIDC_AUDIENCES`,
`APPTHRUST_NEWS_STATIC_DIR`, `APPTHRUST_NEWS_RELEASE_VERSION`,
`APPTHRUST_NEWS_ARTIFACT_DIGEST`, optional `APPTHRUST_NEWS_SOURCE_REVISION`.

### SPA

Routes `/` (list: pinned first, category filter, unread markers, edition version and date
of the newest item in the footer) and `/items/$id` (item). Shell: `@appthrust/app-launcher`;
chrome i18n ja/en through `@appthrust/platform-dashboard-i18n`; the UI locale is the API
`locale`. An item served in a fallback locale shows a note.

ReadMarker: `localStorage` key `appthrust-news:last-seen` holding the greatest
`publishedAt` the member has seen. An item is unread when `publishedAt` is greater than the
marker. Opening the list advances the marker to the newest item when the member leaves the
list or after the unread items were shown; a missing or unparsable marker means every item
is unread. Storage failures are ignored.

### Listing

`catalog/listing.yaml` (ja/en) with screenshots `home` (`catalog/screenshots/home.webp`,
the list) and `item` (`catalog/screenshots/item.webp`, one item), captured from the SPA
against the development mock.

### Versioning

- `1.x.y`, `stream: "1"` always. Patch = content only. Minor = server/SPA change.
- A change to `catalog/entry.yaml` that adds or removes graph members is not delivered by
  `follow`; it needs a `PATCH {version}` per installation. Avoid it; if unavoidable it is a
  platform-visible migration, not a news release.
- `/releasez` reports version and digest; the SPA footer shows the edition version.

## Delivery

One-time, to open the channel:

1. Create `appthrust/appthrust-news` (public) from the Agent Guide shape. Repository secret
   `CLOUD_CATALOG_ADMIN_TOKEN`; organisation App secrets for the Cloud dispatch; read access
   to the shared GitHub Packages.
2. Tag `v1.0.0` with the first items. The workflow builds amd64/arm64, signs the index,
   submits the entry, dispatches Cloud `catalog-publish`, and `await`s the exact
   version/digest in the signed catalog. Make the GHCR package public.
3. Craftsman needs no source change: its `AppCatalogSource/appthrust`
   (`ghcr.io/appthrust/catalog:latest`) projects `ApplicationStackDefinition/appthrust-news`
   on the next poll.
4. Install in the Craftsman Project (`pj-a167a047c8d3`) from the Dashboard marketplace
   (`POST /api/v1/projects/{id}/app-installations`), policy `follow`. `apth` has no install
   command today (`app-installations` offers only `retry-release`).
5. Readback: `AppInstallation` `Ready` and `Healthy`; a fresh connection to
   `https://news.pj-a167a047c8d3.platform.craftsman-software.com/`; `/releasez` equals the
   catalog version and digest; the app appears in the portal launcher.

Per news item afterwards: PR → merge → tag `v1.x.(y+1)` → installations on `follow` roll
without an operator. Expected latency is the image build plus catalog publication plus one
`AppCatalogSource` poll (design default 15 min) plus the rollout.

Precondition observed on 2026-11-10 while the Craftsman update was in progress: all five
installations in `pj-a167a047c8d3` reported `Degraded` (portal: `Ready=False/PublishPending`).
Install after the update settles; otherwise the new installation waits on the same publish
path and proves nothing about the app.

## Slices

| # | Slice | Owner type | Depends on |
| --- | --- | --- | --- |
| P0 | Repository scaffold, `docs/design.md`, `catalog/entry.yaml`, API types, content frontmatter schema | primary | — |
| A | Server: `content.Source`, validation, render, API, health/release routes, tests | deep-worker | P0 |
| B | SPA: list, item, category filter, unread markers, ja/en UI | designer | P0 |
| C | Publisher and listing workflows, `hack/publish-entry.ts`, `hack/check-edition.ts` | deep-worker | P0 |
| D | First items (ja/en), `catalog/listing.yaml`, screenshots | primary | A, B |
| E | Tag `v1.0.0`, catalog readback, Craftsman install and readback | primary | A–D, Craftsman update settled |

## Risks and open points

- **Catalog growth.** One catalog version per news item. Agent Guide keeps earlier versions
  `served`; at a weekly cadence the entry gains ~50 versions a year. Decide a retention rule
  (for example keep the newest N served) and confirm the Cloud intake allows un-serving a
  version that `follow` installations have already left. Until then, batch items per release.
- **Pull only.** v1 reaches members who open the portal or the app. If the requirement is
  that nobody can miss an item (email, chat, Dashboard banner), that is a notification
  capability with a different owner, not a feature of this app.
- **Pinned installations stop receiving news.** That is the Project owner's right; the SPA
  shows the edition date so a stale edition is visible.
- **Global audience.** An item about one customer is visible on every estate that installs
  the app, including `appthrust.ink` and Cloud. Write items for all customers.
- **Publisher authority.** The workflow uses the shared catalog admin token; per-publisher
  identity is an open platform issue (referenced from `first-party-app-repositories.md`).

## Out of scope / follow-ups

- Estate- or Project-targeted notices (maintenance for one customer): needs a
  platform-owned announcement resource written by the estate operator.
- Server-side read state, per-member unread across devices, portal/launcher unread badge
  (the `latest` route is the contract a badge would read).
- A runtime feed adapter behind `content.Source` if release-per-item latency or catalog
  growth becomes the constraint.
- Atom/RSS and Access Key readers for agents.
