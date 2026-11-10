---
title: Update for 15 September 2026
summary: This update redesigns the application Overview tab and the Dashboard home page, improves approvals in the AI Operations Assistant, and lets administrators edit the access policy from the Dashboard.
publishedAt: 2026-09-15T10:00:00+09:00
category: release
tags: [dashboard, iam, database]
---
Here are the main changes in this update.

## Dashboard

- **Application Overview tab**: opening an application now shows an Overview tab with its status, latest release, public URL, a preview of the published site and recent events on one screen. The component cards have moved to the Components tab.
- **Home page**: the [Dashboard]({{.PlatformAPIURL}}) home page now shows three signals (applications ready and needing attention, public URLs live and blocked, and releases in the last 30 days) and a list of applications with their status, latest release and public URL. Items that need action show the cause and the next step, and the page follows the Project selected in the header.
- **Component and Project pages**: the Component detail tabs and the Project Applications, Caches, Event Sources, Domains and Status tabs have been reorganised so that the same information is no longer shown twice. A component without a runtime or metrics yet now says so instead of staying in a loading state.
- **Log viewer**: the Component log viewer now uses the full height of the page and keeps the newest line in view. Scrolling up to read earlier lines pauses following, and scrolling back to the bottom resumes it.
- **Japanese text**: the Dashboard now includes a Japanese font (Noto Sans JP), so Japanese text looks the same on every operating system. Mixed English and Japanese text on the application Overview, publish status and database pages has been fixed, as has an issue where some tabs appeared in Japanese for English users.

## AI Operations Assistant

- **Clearer approvals**: the approval prompt for a write action now shows the SQL to be run and the keys of any environment variables to be set. Variable values are never shown. Database changes from a workspace are now created with manual apply unless another apply mode is requested.
- **Approvals tied to their target**: if you move to another Project, application or component after an approval is requested, that approval can no longer be run. When one answer needs several approvals, you confirm them one at a time.
- **When the assistant is unavailable**: if the assistant is not available, it now says so up front and disables the input box instead of failing after you send a message.

## Sign-in and access

- **Editing the access policy**: platform administrators can now edit which roles may perform which actions in a table under Settings > Security. Roles can be added, and the table can be reset to its defaults.

## Fixes

- Fixed an issue where an App Branch could not be deleted once its web component had been released.
- Fixed an issue where text typed into the Edit App Branch dialog could revert before saving, and where a saved placement was shown as not set.
- Fixed an issue where actions such as App Branch changes asked you to refresh and retry while platform delivery was temporarily blocked. The message now says that delivery is temporarily blocked.
- Fixed an issue in some environments where the PostgreSQL database of an application created from a template stayed in the creating state. Errors during creation are now shown on the creation screen.
- Fixed an issue where logs or metrics were sometimes missing for components that scale down to zero.
