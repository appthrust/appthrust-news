---
title: Update for 4 August 2026
summary: This update shows TLS status for public URLs, lets you approve BYOC consent from apth, speeds up the template list and fixes several issues.
publishedAt: 2026-08-04T10:00:00+09:00
category: release
tags: [dashboard, apth]
---
Here are the main changes in this update.

## Dashboard

- **TLS status for public URLs**: the publish status badge now also shows HTTPS readiness as "HTTP only", "TLS pending" or "TLS ready", so you can see at a glance whether HTTPS is still being prepared.
- **Faster template list**: the application template list in the [Dashboard]({{.PlatformAPIURL}}) now loads faster. Availability checks that used to run once per template now run once per list request.

## apth CLI

- **Approving BYOC consent**: the new `apth byoc consent approve` command lets you review and approve a consent request for a runtime that runs in your own account (BYOC). Approval requires typing the challenge ID, and the command signs with the AWS IAM Identity Center profile given in `--aws-profile`.

## Fixes

- Fixed an issue where the component overview page failed to load for some applications.
- Fixed an issue where deleting a Project could fail to complete.
- Fixed an issue where a bucket stayed Ready when its storage provider could not be looked up. It is now shown as not ready.
- Fixed an issue where the sign-in page was not shown in the AppThrust design in some environments.
- Fixed an issue on the cluster Runtime Path Health page where diagnostic values such as `phase=Ready` were translated in the Japanese interface. Results from a disabled probe are now shown as past history, and skipped and warning counts are shown as well.
