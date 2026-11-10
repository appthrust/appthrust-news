---
title: Run production and preview side by side with Application Branches
summary: In an application's Application Branches tab, create Application Branches for purposes such as production, staging, preview and development. Each one has its own source, automatic expiry, component configuration and publishing.
publishedAt: 2026-07-21T11:00:00+09:00
category: feature
tags: [dashboard, branches]
---
An Application Branch is an independent lane inside one application. It is not a Git branch: each Application Branch has its own runtime, environment variables, Releases and public URL.

## What you can do

- Create one with the purpose type Production, Staging, Preview, Development or Custom.
- Track a Source branch or pin a Source commit.
- Set Preview and Custom branches to be deleted automatically when they expire.
- Configure and publish components separately for each Application Branch.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open the application's Application Branches tab and select Create Application Branch.
2. Enter the Application Branch name, Purpose type, source and Automatic expiry, then select Create and configure placement.
3. Under Branch configuration and Publish, select View configured keys for a component to set its keys. To publish, use Publish from this Branch.
4. To delete it, select Delete, type the Branch ID and select Delete Application Branch.

## Good to know

- Creating, changing and deleting requires the Editor or Admin role in the Project.
- In Projects not on the shared runtime, you choose a Placement Zone after creation.
- You cannot delete the default Application Branch. Dependent resources can also block deleting other branches; if they do, follow what the dialog shows.
- Depending on the installation's configuration, expired branches may not be deleted automatically.
