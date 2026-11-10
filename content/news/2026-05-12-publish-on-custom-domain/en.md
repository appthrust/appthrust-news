---
title: Publish components on the Project's domain or a custom domain
summary: From a component's Publish delivery tab, you can publish an application over HTTPS at a URL on the Project's domain or on a custom domain. The publish badge shows the TLS state.
publishedAt: 2026-05-12T11:00:00+09:00
updatedAt: 2026-11-10T12:00:00+09:00
category: feature
tags: [dashboard, publish, domains]
---
You can now publish a component over HTTPS at a URL on the Project's domain or on a custom domain added to the Project. It is for anyone who wants an application to be reachable from the internet.

## What you can do

- With Dedicated app URL, the URL is a hostname built from the URL name; with Use the domain itself, the URL is the domain itself.
- The platform issues the certificate.
- In an application's component list, the publish badge shows the TLS state as HTTP only, TLS pending or TLS ready.
- In apth, add `--publish` to `apth apps create` to publish a URL as part of creating the app.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open the component from the application's Components tab and select the Publish delivery tab.
2. Choose Domain and Public URL, enter a URL name if needed, then select Publish.
3. To stop publishing, select Unpublish to change.

## Good to know

- Custom domains are added in the Project's Domains tab. A new domain cannot be chosen until it is ready for publishing.
- You cannot publish while Publish prerequisites shows a blocking item, such as no port set on the component.
- To change a published URL, unpublish and then publish again.
- Get apth from [appthrust/cli on GitHub](https://github.com/appthrust/cli).
