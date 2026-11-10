---
title: Add MySQL, Kafka and other data services to applications from the Catalog
summary: From the Dashboard Catalog, you can create MySQL, Kafka, OpenSearch, ClickHouse, S3-compatible buckets and more as components of an application. Presets offer a development setup and a production setup.
publishedAt: 2026-06-23T11:00:00+09:00
category: feature
tags: [catalog, data]
---
Data services such as databases, messaging and search can now be added to an application as components from the Dashboard Catalog.

## What you can do

- Choose from PostgreSQL, MySQL, Redis (Valkey), Bucket (S3-compatible), ClickHouse, Kafka and OpenSearch.
- For PostgreSQL, MySQL, ClickHouse, Kafka and OpenSearch, pick a preset: a single-node or single-instance setup for development and testing, or a redundant setup for production.
- Settings you rarely need to change, such as the storage class, are grouped under Advanced settings.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open Catalog from the sidebar.
2. On the Components tab, select Place next to a service, choose the Project and application, then select Continue.
3. Enter a Display name, choose the setup and settings, then select Create.

## Good to know

- Creating a service requires the Admin or Editor role in the Project.
- The Redis-compatible cache (Valkey) is in beta.
- A service listed in the catalog may not be usable in every environment. Kafka and OpenSearch work only where your platform administrator has enabled them. Ask your platform administrator whether the Required capabilities shown in a service's Details are available on your Project's clusters.
