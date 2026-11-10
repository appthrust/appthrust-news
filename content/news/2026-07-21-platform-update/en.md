---
title: Update for 21 July 2026
summary: This update adds Application Branches with per-branch configuration and Publish, and viewing cluster operations from apth.
publishedAt: 2026-07-21T10:00:00+09:00
category: release
tags: [dashboard, apth, sdk, cluster]
---
Here are the main changes in this update.

## Application Branches

- **Creating Application Branches**: you can now create Application Branches from an Application in the [Dashboard]({{.PlatformAPIURL}}), each with a role such as production, staging, preview or development. You can set the source branch and commit, the Placement Zone and an expiry (TTL), or copy an existing Application Branch.
- **Per-branch configuration and Publish**: on an Application Branch's detail page you can now edit each component's configuration keys for that branch and publish from that Application Branch. Values can be stored as sensitive.

## apth CLI and SDK

- **Viewing cluster operations**: `apth clusters operations get <operation-id>` now shows the details of an operation on a cluster.
- **Application Branches in the Go SDK**: the Go SDK can now create, update and delete Application Branches and change their placement and component configuration.

## Fixes

- Fixed an issue where an application could be shown as Degraded in the Application list because of a status unrelated to Ready.
- Fixed an issue where the tabs on an Application's detail page overflowed on narrow screens. The tabs now scroll sideways.
- Fixed an issue where moving between Project detail pages with the browser's back and forward buttons could leave a cancelled request running and show an error.
- Fixed an issue where an approved delete or rollback of a cluster that was still being created could wait for the creation indefinitely.
- Fixed an issue where an operation kept running after its target cluster was deleted. The operation now ends as failed.
