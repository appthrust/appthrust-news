---
title: Update for 13 October 2026
summary: This update brings reworked Dashboard navigation, the Data tab for Neon databases, cluster availability modes and a startup screen for stopped apps.
publishedAt: 2026-10-13T10:00:00+09:00
category: release
tags: [dashboard, database, cluster, apth]
---
Here are the main changes in this update.

## Dashboard

- **New navigation**: the [Dashboard]({{.PlatformAPIURL}}) header now shows the Team / Project / application / component path, and you can switch team or Project from it. The sidebar switches between team and Project menus to match the page you are on, and you can search by name when there are many Projects.
- **Applications list**: a Project's Applications page now shows the list first. Progress is shown only for applications that are not ready yet.

## Applications

- **Startup screen for stopped apps**: when you open an app that has stopped because it had no traffic, a page saying it is starting is shown straight away while it starts. Once the app is up, requests reach it as usual.
- **Creating from public images**: you can now create an application from a public container image without registering registry credentials. For an image that needs authentication, you are shown the `apth registries create` command to register them.
- **Automatic port detection**: if you leave out the container port, it is now taken from the image's `EXPOSE`. If it cannot be determined, you are asked to set the port or add `EXPOSE` to the Dockerfile.

## Databases

- **Data tab for Neon databases**: you can now browse a Neon database's data in the Data tab. Once a member with edit rights enables data access for a branch, that branch's data can also be viewed read-only. This is not available in Projects that use an isolated runtime.
- **Overview page and create form**: the top of the database overview page now brings together status, setup progress and connection details. A warning is shown if setup takes longer than 15 minutes. The create form has also been simplified.
- **Initial schema approval**: under the default policy, the initial schema applied to a newly created, empty database no longer needs approval. If your settings require approval, the page now shows that the change is waiting for it.

## Clusters

- **Switching availability mode**: Projects have a new Cluster tab. You can switch between the Single and HA availability modes and see the mode the cluster reports and the state of its worker pools. The modes on offer depend on the cluster configuration, and the mode cannot be changed for Projects on a shared runtime.

## apth CLI

- **Signing in to AppThrust Cloud**: `apth login` can now sign in with an AppThrust Cloud account. `apth whoami` and `apth logout` also work with Cloud profiles.

## Fixes

- Fixed an issue where requests to a stopped app could time out before it finished starting.
- Fixed an issue where environment variables entered in the container creation wizard were not saved.
- Fixed an issue where an image update kept showing "Building". Updates now show "Deploying", and workloads that fail to start show the reason and logs.
- Fixed an issue where editing environment variables in two places at once could erase each other's changes. Also fixed an issue where edits made on a preview could be saved to production, and one where secret values became visible while being typed.
