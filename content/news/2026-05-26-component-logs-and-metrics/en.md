---
title: Component logs and metrics are now available in the Dashboard
summary: See the latest logs from running pods in a component's Logs tab, and its CPU and memory usage in the Metrics tab. While Live is on, both update automatically.
publishedAt: 2026-05-26T11:40:00+09:00
category: feature
tags: [dashboard, logs, metrics]
---
You can now see the logs a component writes, along with its CPU and memory usage, on the component's page in the Dashboard.

## What you can do

- In the Logs tab, choose a pod and container and show up to 1,000 of the latest log lines.
- While Live is on, the logs update automatically and the newest line stays in view. While you are scrolled up, the view does not move.
- In the Metrics tab, see CPU and memory usage, ready instances and restarts.
- Run `apth apps logs <app>` to get the logs of an application's web component.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open the application's Components tab and select a component.
2. In the Logs tab, choose Pod, Container and Lines.
3. In the Metrics tab, choose Pod.

## Good to know

- Only the latest logs from pods that are running now are shown. Past logs are not kept, and there is no search.
- When scaling to zero leaves no running pods, the Logs and Metrics tabs show "No workload pods are running yet." While Live is on, logs appear once a pod starts, without reloading the page.
- Databases and jobs have no Metrics tab, and caches have neither tab.
- Ask your platform administrator how to obtain apth.
