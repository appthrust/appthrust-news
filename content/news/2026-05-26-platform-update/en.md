---
title: Update for 26 May 2026
summary: The Dashboard can now be shown in Japanese. This update also adds data access, change management and backups for databases, plus logs and metrics for components.
publishedAt: 2026-05-26T10:00:00+09:00
category: release
tags: [dashboard, database]
---
Here are the main changes in this update.

## Dashboard

- **Japanese language**: the [Dashboard]({{.PlatformAPIURL}}) can now be shown in Japanese. On your first visit it follows your browser's language, and you can switch it later under Language settings in Settings.

## Databases

- **Browsing data and running SQL**: a database's Data tab now shows the contents of its tables. You can run SQL queries and multi-statement scripts, and edit rows.
- **Database changes**: you can now submit versioned SQL as a database change, either written directly or taken from a file in a Git repository. A preview before submitting shows the statements that will run, with a warning when they include DROP, DELETE or ALTER.
- **Backups and restore**: the Backup tab lets you set the backup interval, retention and destination. The destination can be a volume snapshot or an S3 bucket chosen with a registered cloud provider credential. You can also take a backup straight away, or restore a completed backup into a new database.
- **Index advisor**: suggests index candidates based on pg_stat_statements statistics. From a candidate you can go straight to creating a database change.

## Caches and storage

- **Caches (beta)**: the Project's Caches tab lets you create a cache in an application. Valkey, a Redis-compatible managed cache, is available as a beta.
- **Storage**: the Project's Storage tab lets you create volumes and distributed filesystems. You can set the replica count and failure domain, then follow progress until the resource is ready.

## Components

- **Logs**: the Logs tab, previously marked as coming soon, now shows container logs. You can choose the pod, the container and the number of lines, and it can refresh automatically.
- **Metrics**: the Metrics tab now shows CPU and memory usage per pod and per container.
- **Environment variables**: the Environment variables tab lets you add, edit and remove variables you set yourself. Variables set by the platform are shown on the same page.

## Fixes

- Fixed an issue where the link to a public URL could be clicked before publishing had finished. The link now becomes active only once the URL actually responds.
- Fixed an issue where container components showed tabs that apply only to databases.
