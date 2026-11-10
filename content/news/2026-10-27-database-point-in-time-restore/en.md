---
title: Restore a database to a point in time
summary: Turn on continuous archive in Backup settings, and a PostgreSQL database can be restored to any moment inside its recovery window as a new Database.
publishedAt: 2026-10-27T11:20:00+09:00
category: feature
tags: [dashboard, database, backup]
---
If you run PostgreSQL databases, you can now restore one to the state it was in at a time you choose, not only to the moment a backup was taken.

## What you can do

- Keep the database's change history for 1 to 365 days with continuous archive.
- See the recovery window and the archive state on the Backup tab.
- Pick a time inside the window, to the second, and restore it as a new Database. The original database stays as it is.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open the database's Backup tab.
2. In Backup settings, turn on Scheduled backups, set Destination to Volume snapshot, turn on Continuous archive, and select Save backup settings.
3. Once a backup completes after you turn it on, the Recovery window appears.
4. On a completed backup, select Restore backup and turn on Restore to a point in time. Enter the Recovery target time and the New database name, and select Restore.

## Good to know

- This works for PostgreSQL databases with a single instance whose backup destination is a volume snapshot. PostgreSQL (Neon) and MySQL are not supported.
- The database's volume profile must support snapshots.
- It is available for databases running on clusters on AWS.
- You cannot restore to a time before continuous archive was turned on, and turning it off discards the recovery window.
- A volume snapshot backup must have completed before the target time.
- While the archive shows Archive failed, a point-in-time restore is not possible.
