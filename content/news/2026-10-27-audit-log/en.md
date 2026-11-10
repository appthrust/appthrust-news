---
title: Audit log now available in the Dashboard
summary: The Audit page in the Dashboard shows who did what in a Project, and when. You can filter by period and conditions, and open each event for details.
publishedAt: 2026-10-27T11:40:00+09:00
category: feature
tags: [dashboard, audit]
---
The [Dashboard]({{.PlatformAPIURL}}) now has an Audit page. It shows who created, changed or deleted something in a Project, including operations denied for lack of permission, when they did it and what it affected. Viewing it requires the Admin role on that Project, or the Auditor or Platform admin platform role.

## What you can do

- List a Project's events with the event time, actor, operation, target and outcome.
- Filter by period, and by actor subject, operation and target.
- Open an event to see every recorded field.

## How to use it

1. In the sidebar, open Audit under Other, and choose a Project under Project.
2. Choose a period under Ingestion window. If needed, enter values in Actor subject, Operation and Product target, then select Apply filters. Values must match exactly.
3. Click a row to open its details, where you can also use Filter by this actor and Filter by this target.

## Good to know

- Ordinary viewing is not recorded, and events from before the retained history are not shown.
- In environments where audit history storage is not configured, the page shows Audit history unavailable.
