---
title: Scheduled jobs can now be added to applications
summary: Add a Scheduled job component to an application to run a container command at set times. After creation, you can change the command and schedule under Job settings.
publishedAt: 2026-10-27T11:10:00+09:00
category: feature
tags: [dashboard, jobs]
---
Work that needs to run at set times can now be added to an application as a Scheduled job component. It runs a container command on a schedule, then stops.

## What you can do

- Run a command you specify with a container image registered in the Project.
- Pick a schedule such as Every hour or Daily at 03:00, or enter a cron expression, and choose the time zone.
- See the last run and last success times in the job's Overview tab.
- After creation, change the command, schedule and time zone, or pause the schedule, under Job settings.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open the application's Components tab, choose New component and select Scheduled job.
2. Fill in Container image, Command, Schedule, Time zone and the other fields, then select Create job.
3. To make changes later, open the job's Settings tab, edit the values under Job settings and select Save.

## Good to know

- The command runs directly, not through a shell.
- Saving starts a new release of the job. Delivery takes a few minutes.
- A job has one schedule.
- Pausing a job does not stop a run that is already in progress.
