---
title: Screens shown while an application starts or cannot be reached
summary: While an idle application starts, visitors now see a startup screen, and when an application cannot be reached they see a maintenance page instead of a bare 503 error.
publishedAt: 2026-10-27T11:50:00+09:00
category: feature
tags: [applications]
---
While a published application cannot respond yet, visitors who open it in a browser now see a page in Japanese and English that tells them what is happening. No setup is needed.

## What you can do

- **Startup screen**: while an idle application starts, visitors see "Starting your app" with the elapsed time, and the original page appears automatically once the application is ready.
- **Maintenance page**: instead of a bare 503 error, visitors see "This service is temporarily unavailable", and the page reloads automatically.
- **Your application's errors stay as they are**: errors returned by the application itself are not rewritten.

## When it appears

- Startup screen: when someone opens an application that has scaled to zero instances because it received no traffic.
- Maintenance page: when the application cannot be reached, or when it keeps failing to start, for example because it crashes repeatedly or its image cannot be pulled.

## Good to know

- The startup screen, and the maintenance page for an application that keeps failing to start, are shown only when a page is opened. API calls and other requests still go to the application as before.
- For an always-on application with a single instance, neither screen is shown while that instance is restarting or waiting for capacity, unless it keeps failing to start.
