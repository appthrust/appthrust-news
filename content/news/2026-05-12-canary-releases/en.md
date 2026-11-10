---
title: New component versions are released gradually as canaries
summary: A new version of a container component is released as a canary that moves traffic over a little at a time, and is promoted automatically once its checks pass. You can follow progress and roll back in the component's Releases tab.
publishedAt: 2026-05-12T11:10:00+09:00
updatedAt: 2026-11-10T12:00:00+09:00
category: feature
tags: [releases, canary]
---
A new version of a container component is released as a canary, with traffic moved over to it a little at a time. If its checks pass it is promoted automatically; if not, traffic goes back to the stable version.

## What you can do

- See the release status, how traffic is split between the stable version and the canary, and the number of Failed checks.
- Set `canaryMetrics` with a PromQL query and an allowed range, so that metrics specific to your application decide whether a release passes.
- Roll back to the image of an earlier successful release.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open the component from the application's Components tab, then follow progress under Current release in the Releases tab.
2. To roll back, check the image shown under Rollback target and select Rollback. The component is then pinned to that image; to return to automatic releases, select Resume auto. The rollback target and both of these actions always apply to the application's default App branch, not to the App branch selected on the page.
3. Set `canaryMetrics` in a ContainerComponent document applied with `apth apply`.

## Good to know

- A canary is used when a version is already running.
- `canaryMetrics` takes up to 32 metrics, and each release uses the values in place when it was created.
- Rolling back and Resume auto require the Admin or Editor role in the Project.
- Get apth from [appthrust/cli on GitHub](https://github.com/appthrust/cli).
