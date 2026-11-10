---
title: Update for 7 July 2026
summary: This update adds a page for checking runtime path health, virtual machines in Projects, DNS record views, and a beta of platform services.
publishedAt: 2026-07-07T10:00:00+09:00
category: release
tags: [dashboard, cluster, api]
---
Here are the main changes in this update.

## Clusters and operations

- **Runtime path health**: the [Dashboard]({{.PlatformAPIURL}}) now has a Runtime Path Health page. It shows the path to your workloads layer by layer, with the failing layer and the next action needed. The status also appears on the Project overview and on the published URL card.
- **Runtime Sets**: a new page shows the status and update progress of each set of workload clusters. A Kubernetes or Talos version update first prepares replacement clusters, and traffic stays on the current clusters until the required checks pass. You can promote or roll back after reviewing the impact and giving an audit reason.
- **Storage capacity status**: the Storage page and a cluster's storage view now show capacity risk, whether AppThrust is handling it automatically or waiting for approval, and the next action needed. A plan to shrink storage can be approved after reviewing the capacity afterwards and the data protection status.

## Project

- **Virtual machines**: Virtual Machines has been added to the Project's Platform menu. You can import a VM image, create virtual machines, and start, stop, reboot, back up and restore them.
- **DNS records**: the Domains tab now lists the records in a zone in two groups, those you added and those created automatically when a component is published, each with its programming state. Records can also be added to and deleted from a zone through the Platform API.
- **Observability when creating an application**: on the application creation page you can now enable observability, choose a ready provider, and connect metrics, logs, dashboards and alerts.

## Platform services

- **Platform Services (beta)**: a beta page lets you create Git hosting, a container registry and observability as platform services. You choose where each service runs and review the plan before creating it. Afterwards, the detail and diagnostics pages show whether its dependencies are ready.

## Platform API

- **Scale-to-zero status**: the release state of components and container instances now includes the scale-to-zero status (disabled, active, scaled to zero or unknown) and the actual and desired replica counts.

## Fixes

- Fixed an issue where returning to the Dashboard after installing the GitHub App did not save the installation, so you could not go on to create a source connection. The connection list can now also be opened from Project settings and Integrations.
- Fixed an issue where image access credentials added to a source repository were not applied to existing application stacks that use it, so images from a private registry could not be pulled.
- Fixed an issue where the target clusters and database settings given when creating an application stack were not applied to its components.
- Fixed an issue where the release state of a component created from an application stack could not be read.
