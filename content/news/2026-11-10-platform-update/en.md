---
title: Update for 10 November 2026
summary: This update adds app installation from the marketplace, access management with groups and roles, GitHub / Google sign-in configuration and automatic handling of runtime vulnerabilities.
publishedAt: 2026-11-10T10:10:00+09:00
category: release
tags: [dashboard, marketplace, apth, iam]
---
Here are the main changes in this update.

## Marketplace

- **Installing from the marketplace**: built-in apps are now marketplace apps, and you can install, update and remove them from a Project's marketplace in the [Dashboard]({{.PlatformAPIURL}}). When installing, you choose between following updates and pinning a version.
- **App detail page**: one page inside the Dashboard shows an app's overview, screenshots, highlights, requirements and versions. The name and description are shown in the display language when the app provides it, and in English otherwise.
- **Choosing whether to run staging**: when installing, you can run an app in production only, or also run a staging copy with its own resources and data. You can change this later on the app's detail page, and Inference, which uses a GPU, runs in production only by default.

## apth CLI

- **Installing apps**: `apth app-installations` now has `list`, `get`, `install`, `update` and `uninstall`, so marketplace apps can be managed without opening the Dashboard. With `--wait` it waits for completion, and an app that is briefly Degraded during an update is not treated as a failure; it waits until the app is Ready.
- **Login code expiry**: `apth login` now shows when the approval code expires.

## Applications

- **Handling runtime vulnerabilities**: applications created from the Next.js templates, from the Dashboard or apth, now use the managed Node.js 24 runtime by default and take runtime updates automatically. Even for a runtime set to manual updates, the fix for a Critical or High advisory is applied after a grace period, and you can follow it in the Project's Runtime advisories tab or with `apth runtime-advisories list`.

## Clusters

- **Creating a cluster**: cluster creation is now a three-step flow: what to create, setup, and review and create. It offers only values you can choose and explains why a runtime is unavailable.

## Sign-in and access

- **Access with groups and roles**: groups and roles replace teams for managing access. In a Project's Access tab, you give users or groups the Admin, Editor or Viewer role; groups are created in Platform settings.
- **Sign in with GitHub or Google**: once an administrator configures it, members can sign in with a GitHub or Google account.
- **Re-mapping a group**: a group mapped to an external identity provider group can be re-mapped to another value from the Dashboard. Access is never dropped part-way through.
- **Managing AI policies**: platform administrators can create and edit the organisation's AI policies on the AI policies page in the Dashboard. Each Project can bind a policy in its AI tab and restrict it further.

## Fixes

- Fixed issues where every application template was shown as unavailable, a blank application stayed in the "unknown" state, and an application created from a template could be deployed with a marketplace app's definition.
- Fixed an issue where, with several usable source connections, the application creation page automatically picked the first one by name. The repository destination now stays empty until you choose a connection.
- Fixed an issue where the Project overview showed GitOps as connected and Argo CD as synced based only on the number of applications.
