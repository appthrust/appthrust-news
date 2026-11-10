---
title: Component environment variables can now be managed in the Dashboard
summary: In a component's Environment variables tab, you can add, edit and delete variables and store values as secrets. Variables added by connected databases and caches are shown on the same screen.
publishedAt: 2026-05-26T11:50:00+09:00
category: feature
tags: [dashboard, apth, config]
---
The environment variables passed to a component can now be added, edited and deleted in the Dashboard's Environment variables tab. It is for developers who run applications in a Project.

## What you can do

- Values marked Secret are not shown again after saving.
- Variables added by connected databases and caches are listed by key under Set by the platform.
- Environment variables are set per App Branch, chosen with the App Branch selector.
- With apth, `apth apps env get`, `set` and `unset` also manage the environment variables of an application's web component.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open a component from the application's Components tab and select the Environment variables tab.
2. Select Add variable or Edit, then enter the Key and Value.
3. Tick Secret if needed, then select Save.

## Good to know

- Saving starts a new release of the component, and the change takes effect with that release.
- Keys cannot be renamed; delete the variable and add it again. You cannot use a key already added by a connected resource.
- Database and cache components do not have this tab.
- Ask your platform administrator how to obtain apth.
