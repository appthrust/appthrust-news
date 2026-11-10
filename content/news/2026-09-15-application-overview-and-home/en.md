---
title: A new application Overview tab and Dashboard home page
summary: Opening an application now shows an Overview tab that sums up its state at a glance. Component cards have moved to the Components tab, and the Dashboard home page lists publishes that need attention first.
publishedAt: 2026-09-15T11:00:00+09:00
category: announcement
tags: [dashboard, applications]
---
The application detail page and the [Dashboard]({{.PlatformAPIURL}}) home page have a new layout. You can see an application's state, and anything that needs attention, on the first page you open.

## What changes

- **Application Overview tab**: Opening an application now shows the Overview tab first. It brings together figures such as Component readiness, Latest release and Events (24h), a preview, Recent events and an Event activity chart for the last 24 hours on one page. The Components, Release, Databases and Endpoints cards show their state by colour; select one to open the matching tab.
- **Component cards**: The component cards that used to sit on the first page have moved to the Components tab, next to Overview. You also add components from New component on this tab.
- **Dashboard home page**: Open it from Overview at the top of the sidebar. Across every Project you can access, it shows figures for Applications, Public URLs and Releases (30 days), a list of applications with their state, latest release and public URL, and Recent activity.
- **Items that need attention**: Failed publishes, blocked publishes and publishes that are not progressing appear under Needs your attention at the top of the home page. Each item shows the component name, application, Project and cause. Open publish shows the details, and for a failed publish and similar cases Inspect logs opens the logs.

## What you need to do

Nothing. Only the page layout has changed; application and component settings are unchanged.

## Good to know

- Needs your attention appears only when there is a publish to show. Items are listed most severe first.
- The URL shown on the Overview tab is the configured public URL. It does not prove that the URL is serving traffic.
