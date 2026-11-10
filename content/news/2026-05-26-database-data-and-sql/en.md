---
title: You can now look at a database's data in the Dashboard
summary: A database's Data tab shows table rows and runs SQL. Its Advisor tab lists index candidates that you can turn into a database change.
publishedAt: 2026-05-26T11:10:00+09:00
category: feature
tags: [dashboard, databases]
---
You can now see what is inside a database from the Dashboard.

## What you can do

- Select a table to show its rows in Table preview.
- Use Query to run a single read-only SELECT or WITH statement, or Batch to run DDL and DML statements together.
- On tables with a primary key, generate SQL from editing or deleting rows, then run it as a batch or turn it into a draft on the Changes tab.
- On the Advisor tab, turn an index candidate into a draft change with Create change.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open the Project and select the database under Databases in the sidebar.
2. On the Data tab, select a table.
3. Write SQL under Query or Batch, then select Run or Run batch.

## Good to know

- Databases of type Managed (cloud) have no Data or Advisor tab.
- Batch is available only for CloudNativePG databases. In a Project on an isolated runtime, neither Batch nor viewing Neon data is available.
- Data on a Neon branch is read-only, and is shown once a member with edit permission selects Enable data access.
- Running queries or batches requires the Admin or Editor role on the Project.
