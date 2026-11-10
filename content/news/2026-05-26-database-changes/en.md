---
title: Apply SQL to a database as a reviewed and approved change
summary: From a database's Changes tab, submit SQL that changes its schema or data. Write the SQL in the form or load it from a file in a Git repository; it is checked for risky statements and approved where required before it is applied.
publishedAt: 2026-05-26T11:20:00+09:00
updatedAt: 2026-11-10T12:00:00+09:00
category: feature
tags: [databases, sql]
---
Developers who manage a database's schema and data can now submit SQL for a PostgreSQL database as a change. Each change is reviewed, waits for any required approval, and is then applied, and its result stays in the change history.

## What you can do

- Write the SQL in the form, or load an SQL file from a Git repository registered as a Flux source.
- Before submitting, check the statement count and risk under Review preview. Statements such as DROP or DELETE raise a warning.
- By default, a change that contains DROP TABLE or TRUNCATE needs one approval.
- Use `apth databases changes` to create, approve, execute and otherwise manage changes.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open Databases in the sidebar, select the database, open its Changes tab and select New change.
2. Under Source, choose Inline SQL or Flux Git file. Type the SQL, or pick the file and select Preview source.
3. Choose an Apply mode and select Create change. With the default, Automatic, the change is applied as soon as review and approval are complete. With Manual, it is applied when you select Execute on the change's detail page.
4. For a change that needs approval, select Approve or Reject on its detail page.

## Good to know

- MySQL is not supported. In a Project on an isolated runtime, changes cannot be used with Neon databases either.
- A change that contains DELETE or UPDATE without WHERE, DROP DATABASE or DROP SCHEMA stops at review and does not run.
- The SQL cannot be edited after the change is created. To correct it, create a new change.
- Apply mode starts on Automatic. To check a change before it is applied, choose Manual before creating it.
- Get apth from [appthrust/cli on GitHub](https://github.com/appthrust/cli).
