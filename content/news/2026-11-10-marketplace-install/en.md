---
title: Install marketplace apps into your Project
summary: You can now install, update and remove apps from the marketplace in the Dashboard, choosing how each app updates and whether it also runs staging.
publishedAt: 2026-11-10T11:00:00+09:00
category: feature
tags: [marketplace, dashboard]
---
You can now install, update and remove ready-made apps from your Project's Marketplace. An installed app becomes one of the Project's Applications.

## What you can do

- See an app's overview, screenshots, highlights and versions on a detail page inside the Dashboard.
- Choose "Follow updates" or "Pin version".
- Choose "Production only" or "Production and staging". Staging runs with its own resources and data.
- Use `install`, `update`, `uninstall` and more in `apth app-installations` to do the same from the command line.

## How to use it

1. Open Marketplace in your Project in the [Dashboard]({{.PlatformAPIURL}}).
2. Select "Learn more" on an app to open its detail page.
3. Select "Install", choose the version, "Updates" and "Branches", then select "Install".
4. On an installed app's page, change its update policy or branches, or use "Delete". An "Update" button appears when a newer version is available.

## Good to know

- Disabling staging deletes the staging data.
- If you delete an app that other apps use, those apps are degraded until you install it again.
