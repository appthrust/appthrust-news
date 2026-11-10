---
title: Update for 27 October 2026
summary: This update adds application labels, scheduled jobs, point-in-time database restore, DNS checks for custom domains, access keys and an audit log.
publishedAt: 2026-10-27T10:00:00+09:00
updatedAt: 2026-11-10T11:30:00+09:00
category: release
tags: [dashboard, database, network, apth]
---
Here are the main changes in this update.

## Applications

- **Grouped list and labels**: the application list in the [Dashboard]({{.PlatformAPIURL}}) is now grouped by state, such as Needs attention and In progress, and can be filtered by label. Labels can be set in the Dashboard or with `apth applications set-labels`.
- **New create form**: the Create Application form now has three steps: What to build, Options, and Review and create. Templates are grouped by category, and one search covers every category.
- **Scheduled jobs**: you can now add a Scheduled job component to an application. After creation, its command, schedule, time zone and other settings can be changed under Job settings.

## Domains

- **DNS configuration check**: the Project's Domains page now shows whether each custom domain's DNS is configured correctly and whether its certificate has been issued. When the configuration is wrong, it lists the DNS records to set, ready to copy.

## Databases

- **Point-in-time restore**: once continuous archive is turned on in Backup settings, a database can be restored to any moment inside its recovery window. For now this applies to single-instance databases whose backups use volume snapshots.

## Network and access

- **Egress allowlist**: on installations with AppThrust Enterprise, the Project's Network settings now let you list the external domain names and CIDR ranges that workloads may reach. When logging of denied traffic is turned on, the same page lists the denied flows.
- **Access keys**: API keys that work the same way from Project apps, local development and external services can now be issued, paused and revoked from Access keys under a Project's Settings or with `apth access-keys`. The secret is shown only once, when the key is issued.
- **Audit log**: activity can now be reviewed under Audit in the Dashboard by a Project's Admin and by users with the Auditor or Platform admin role. Events can be filtered by period and other criteria, and each one expands to show its details.

## Built-in apps

- **In-cluster LLM**: a new LLM built-in app lets Knowledge generate answers with a CPU model running inside the Project's cluster. As long as no external AI service credential is configured, questions and answers stay inside the cluster.

## Publishing

- **Maintenance page**: when an application cannot be reached, or keeps failing to start, visitors now see a maintenance page in Japanese and English instead of a bare 503 error. Errors returned by the application itself are passed through unchanged.

## Fixes

- Fixed an issue where the storage size requested for a database was ignored and the database was created with 1Gi. The size of existing databases does not change.
- Fixed an issue where a database restored from a backup never became Ready, and where a restored database prevented the original application from being released.
- Fixed an issue where creating or publishing an application on the Project's own domain was rejected as a reserved domain.
- Fixed an issue where a failed application creation reported that nothing had been created even though the source had been saved. You can now continue from the saved source.
