---
title: Built-in apps are now marketplace apps
summary: The former built-in apps are now apps that each Project installs from the marketplace and updates app by app. The apth commands for built-in apps have been removed.
publishedAt: 2026-11-10T10:20:00+09:00
category: announcement
tags: [marketplace, apth]
---
The apps we used to provide as built-in apps are now marketplace apps. Each Project installs them from the Marketplace in the [Dashboard]({{.PlatformAPIURL}}) and updates them app by app. This note sums up what changes if you used the built-in apps.

## What changes

- **Where you find and install apps**: the Project's Built-in apps tab is gone; the Marketplace tab next to Applications replaces it. Pick an app from the Catalog and select Install. If the app needs other apps, they are installed automatically as well.
- **Updates**: apps are no longer updated together with platform releases; each app receives new versions through the catalog. When installing, you choose Follow updates or Pin version, and you can change this later in the Updates section of the app's page. With a pinned version, Update available appears when a newer version exists, and you move to it with the Update button.
- **The app becomes your Application**: an installed app appears in the Project's Applications list, and you can change or remove it as you like.
- **Opening apps**: in the Marketplace, select Open next to an app in the Installed list to open it in a new tab. Inside an app, Switch app in the header and Home list the apps installed in this Project.

## What you need to do

The Marketplace's Installed list shows the apps installed in this Project, with their version and update policy. Check the apps you were using in this list.

The `apth builtin-apps` and `apth builtin-app-definitions` commands have been removed. Replace them in your scripts with `list`, `get`, `install`, `update` and `uninstall` under `apth app-installations`.

## Good to know

- You can remove an app that other apps use. Those apps stay installed but are degraded until you install the removed app again.
- Some versions need a minimum platform version, shown as Needs platform in the install dialog.
