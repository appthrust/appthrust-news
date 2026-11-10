---
title: Update for 9 June 2026
summary: This update adds Function components, databases that stop when idle, and development workspaces you can use in the browser.
publishedAt: 2026-06-09T10:00:00+09:00
category: release
tags: [dashboard, functions, database, github]
---
Here are the main changes in this update.

## Functions

- **Function components**: when you add a component to an application in the [Dashboard]({{.PlatformAPIURL}}), you can now choose Function. A function is created from a container image and invoked with CloudEvents over HTTP. It scales down to zero when it is not being called.
- **Runtime status**: a function's overview shows its URL, its scale settings and how many instances are currently running.
- **Publishing over HTTP**: a function can now be published over HTTP in the same way as a container.

## Databases

- **Stopping when idle**: choose "Scale to zero" when you create a database and it stops after a period of inactivity, then starts again automatically on the next connection. You can set the idle time before it stops and the minimum time it stays running after it starts, in seconds.
- **Switching the compute state**: for an existing database you can now choose whether it always stays running, is stopped manually, or stops when idle. The current state is shown as well.
- **Snapshot-capable storage**: when snapshot backups are enabled, the Dashboard now picks a storage option that supports snapshots. If you have chosen one yourself, your choice is kept.

## Development workspaces

- **Developing in the browser**: start a workspace from a Project's Develop tab to edit an application's source in VS Code Web in the browser and check it in a preview. Codex is also available inside the workspace.
- **Shipping changes**: you can review the workspace branch's diff, commit and push, and open a pull request, all from the Dashboard.

## GitHub and images

- **Source connections**: a GitHub App can now be registered as a source connection that creates application repositories from templates. You can also specify which templates it may use.
- **Registry connections**: on the GitHub Apps page you can now register credentials for pulling images from GHCR, Docker Hub, Amazon ECR and other registries. Registered credentials can be copied into a Project when you create an application. The credentials are checked on registration by listing the image's tags.

## Initial setup

- **Setup wizard**: two steps have been added. One checks the DNS delegation of the platform domain used for the Dashboard, IAM and other services; the other sets the GitOps repository that Argo CD reads from.

## Fixes

- Fixed an issue where a GitHub App could not be created from a Dashboard running on a host name other than the default.
- Fixed an issue where choosing a GitHub App for GitOps delivery saved default values without letting you check the repository and branch. A dialog now lets you review and edit them before saving.
