---
title: Functions can now be added to applications
summary: Add a Function component to an application to run code on HTTP requests or CloudEvents events. It can scale down to 0 Pods while there are no requests, and you can publish it over HTTP.
publishedAt: 2026-06-09T11:00:00+09:00
category: feature
tags: [dashboard, functions]
---
Code that runs on requests or events can now be added to an application as a Function component.

## What you can do

- Run an already-built Function image as-is. With Python 3.12 or Node.js 22, you can also write the code in the Dashboard instead.
- Invoke the Function through an HTTP endpoint or a CloudEvents endpoint.
- Choose Scale to zero to scale down to 0 Pods while there are no requests.
- Publish the Function over HTTP from the Publish screen.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open the application's Components tab, select New component and choose Function.
2. Under Code, choose to use an image and select Validate Function. Choose the Invocation and Scaling options, then select Create Function.
3. To publish it, open the Function's page and select Open Publish.

## Good to know

- Choosing Public endpoint under Visibility does not issue a public URL by itself.
- Code starts on Write code, but creating a Function that way needs storage for the code that your platform administrator has set up. Where it is not set up, creation fails, so use an image instead. Create from Git is not available yet.
