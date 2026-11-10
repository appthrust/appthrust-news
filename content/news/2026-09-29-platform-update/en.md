---
title: Update for 29 September 2026
summary: This update adds login and application commands in apth, bundled agent skills, a Runtime tab for clusters, and the data browser on the shared runtime.
publishedAt: 2026-09-29T10:00:00+09:00
category: release
tags: [apth, dashboard, cluster, database]
---
Here are the main changes in this update.

## apth CLI

- **Login and application commands**: `apth login` now supports device login, where you approve the sign-in in your browser. With `apth apps create`, `get`, `wait`, `publish` and `logs` and `apth apps env get|set|unset`, you can create an application, publish it and set its environment variables from the terminal.
- **Actor commands**: `apth actors` lists, creates and invokes actor types and actors, among other operations. To invoke an actor, sign in with client credentials through `apth login`.
- **Agent skills**: `apth` now bundles an agent skill for application development. `apth skills install` installs it into the skill directories of Claude Code, Codex and OMP.
- **Checking your login and clearer errors**: `apth whoami` now asks the Platform API whether the stored credential is still valid. Errors are followed by a `Hint:` line that says what to do. The SDK and `apth` retry automatically when the API reports that delivery is still in progress.

## Clusters

- **Runtime tab**: cluster details in the [Dashboard]({{.PlatformAPIURL}}) now have a Runtime tab. It shows an overall verdict, the state of each layer such as the control plane, workers, network, storage and packages, recent changes, and the list of machines.
- **Redesigned connections page**: the page for connections between clusters is rebuilt around the connection health matrix. It no longer reports configured members as missing from the cluster list, with an empty matrix, when all connections are established.

## Databases

- **Data browser on the shared runtime**: the Data tab, previously unavailable because of the shared runtime's security policy, now lets you browse tables and rows, see index suggestions and use the read-only SQL console. Running scripts is still unavailable.
- **One database detail page**: links from the database list and from an Application's Data tab now open the database screen inside the Project. The old detail page, which showed sample values, has been removed.

## Dashboard

- **Better Japanese display**: screens that mixed English and Japanese have had their copy revised. Cluster details, Project runtime, Application Branch details and other screens now display in Japanese. A sentence without a translation stays in English instead of being partly translated.

## Fixes

- Fixed an issue where inviting a member added them straight away as "Active" without showing an invite link. An invite link is now shown for email addresses that are not yet registered.
- Fixed an issue where the Logs tab of a database showed no logs, and where component logs could load slowly and time out.
- Fixed an issue where the page heading kept the old name after an Application Branch's display name was changed.
- Fixed an issue where AI Development did not re-attach to a running AI task after the connection dropped or a draft was reopened, so the approval dialog did not appear.
- Fixed issues in the development workspace where "Commit and push" failed, the list of changes returned an error, and Restart runtime did not wake the workspace from sleep.
