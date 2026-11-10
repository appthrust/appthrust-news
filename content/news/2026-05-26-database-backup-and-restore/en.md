---
title: Back up and restore databases in the Dashboard
summary: On a database's Backup tab, set the interval, retention and destination of scheduled backups. You can also take a backup on the spot, or create a new database from a completed backup.
publishedAt: 2026-05-26T11:30:00+09:00
category: feature
tags: [dashboard, database, backup]
---
You can now back up and restore PostgreSQL databases from the database's Backup tab.

## What you can do

- Choose an interval of every 6 hours, every 12 hours or daily, and a retention of 7, 14, 30 or 90 days.
- Store backups as a Volume snapshot or in an S3 bucket. S3-compatible storage also works when you enter its Endpoint URL.
- Take a backup on the spot with Take backup now.
- Restore a completed backup as a new database. The original database stays as it is.
- With Continuous archive, you can also restore to a point in time.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open the Project, choose a database under Databases in the sidebar, and open its Backup tab.
2. Under Backup settings, turn on Scheduled backups and pick the options. For S3, choose an AWS credential registered under Cloud Providers as the Backup credential, select Load buckets and choose a bucket. Then select Save backup settings.
3. To restore, select Restore backup on a completed backup, enter the New database name and select Restore.

## Good to know

- This works for PostgreSQL databases on CloudNativePG. PostgreSQL (Neon), MySQL and Managed (cloud) databases are not supported. The Backup tab may still appear for them, but its settings cannot be saved.
- Volume snapshots need a volume profile that supports snapshots.
- Restoring does not switch your applications' connections to the new database.
- Changing settings and restoring need the Admin or Editor role in the Project.
