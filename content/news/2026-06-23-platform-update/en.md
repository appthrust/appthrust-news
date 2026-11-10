---
title: Update for 23 June 2026
summary: This update adds a catalog to the Dashboard, so MySQL, Kafka, OpenSearch, ClickHouse and buckets can be added to an application, and lets you submit database changes from a dev workspace.
publishedAt: 2026-06-23T10:00:00+09:00
category: release
tags: [dashboard, catalog, database]
---
Here are the main changes in this update.

## Catalog

- **Catalog page**: the [Dashboard]({{.PlatformAPIURL}}) sidebar now has a Catalog entry. It shows the components and application stacks you can add as cards. Pick a component, choose a Project and application, and continue straight to the create page.
- **More data services**: MySQL, Kafka, OpenSearch, ClickHouse and S3-compatible buckets can now be created from the catalog.
- **Presets in the create form**: choose a layout from presets, such as a simple or high-availability setup for MySQL, or a single-node development or high-availability production setup for Kafka and OpenSearch. Finer options are grouped under advanced settings, and settings that are not needed at creation are hidden.

## Applications

- **Next.js + Blacksmith template**: a new "Next.js + Blacksmith" application template creates an App Router web app with managed database wiring and CI builds on Blacksmith already set up.
- **Paged application list**: the application list now shows 30 applications per page, along with which range of the total you are viewing.

## Databases

- **Database changes from a dev workspace**: a SQL migration file written and pushed in a dev workspace can now be submitted as a DatabaseChange. The Dashboard AI assistant can also submit it, after your approval.

## Fixes

- Fixed an issue where an AI task's result was lost if its response stream was interrupted. If the task has finished, its result is now fetched again and shown.
- Fixed an issue where the connection to a dev workspace could drop when the workspace was left open.
- Fixed an issue where a completed publish could briefly appear to be in progress again.
- Fixed an issue where a suspended serverless database was shown as not ready, and where an application connected to a database could miss its connection details.
- Fixed an issue where an application's releases were shown as failed just because an earlier release had failed. The status now follows the latest release.
- Application drafts can now be viewed and edited only by the user who created them.
