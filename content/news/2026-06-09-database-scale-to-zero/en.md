---
title: Databases can now stop when idle
summary: PostgreSQL databases can stop after a period of inactivity and start again on the next connection. For CloudNativePG databases, you can switch the mode in the Data tab after creation.
publishedAt: 2026-06-09T11:10:00+09:00
category: feature
tags: [database, postgresql]
---
A PostgreSQL database can now stop its compute after a period of inactivity and start it again on the next connection. Use it for databases that do not need to run all the time.

## What you can do

- For a CloudNativePG database, turn on Stop when idle at creation and set how long to wait before stopping and the minimum uptime.
- For a CloudNativePG database, switch between Always on, Manual and Serverless under Compute lifecycle in the Data tab after creation.
- While the database is stopped, the Overview tab shows Compute is paused. Stored data is kept.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open the application's Components tab, choose New component and select Database.
2. Under Provider, choose CloudNativePG, turn on Stop when idle and select Create database component.
3. To change it later, choose a Mode in the Data tab and select Save lifecycle.

## Good to know

- It is available for PostgreSQL databases whose provider is CloudNativePG or Neon. It is not available for Managed (cloud).
- For Neon, stopping and resuming follow the policy of the Project's runtime class and cannot be changed per database.
- The time before stopping must be 300 to 86400 seconds.
- Selecting Suspend compute switches the mode to Manual, and new connections wait until compute is resumed.
