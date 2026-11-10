---
title: Create applications from public images
summary: You can now create an application from a public container image with apth, without registering registry credentials. In the Dashboard, the container port is detected from the image's EXPOSE.
publishedAt: 2026-10-13T11:00:00+09:00
updatedAt: 2026-11-10T12:00:00+09:00
category: feature
tags: [apth, dashboard, images]
---
You can now create an application from a public container image without registering registry credentials.

## What you can do

- Pass a public image to `apth apps create --image` and the application is created.
- If the image needs authentication, creation stops and shows the `apth registries create` command to run.
- In the Dashboard, if the image's `EXPOSE` lists a single TCP port, that port is used automatically.
- If the port cannot be determined, you are asked to specify a port or add `EXPOSE` to the Dockerfile.

## How to use it

1. Run `apth apps create my-app --image 'ghcr.io/acme/app:v1.10.1'`.
2. If you are told the image needs credentials, replace `REGISTRY_CONNECTION_ID` in the suggested command with the ID of a registry connection that can pull the image, run it, then create the application again.
3. When you create an application in the [Dashboard]({{.PlatformAPIURL}}), "Container port" defaults to "Detect from image (EXPOSE)". To use another port, choose "Specify port".

## Good to know

- With apth, omitting `--port` uses the template's default port, not `EXPOSE`.
- In the Dashboard, you can only choose images already registered in the Project.
- Get apth from [appthrust/cli on GitHub](https://github.com/appthrust/cli).
