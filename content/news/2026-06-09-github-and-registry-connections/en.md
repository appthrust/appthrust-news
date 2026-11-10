---
title: GitHub and container registries can now be connected
summary: Set up, in the Dashboard, the GitHub connection used to create application repositories from templates and the registry connections used to pull private images. A Project's Integrations page shows whether they are ready.
publishedAt: 2026-06-09T11:30:00+09:00
category: feature
tags: [github, registries]
---
The connections needed to create applications from templates can now be set up in the Dashboard. A GitHub connection is used to create application repositories; a registry connection is used to pull private images.

## What you can do

- See on a Project's Integrations page whether applications can be created from templates.
- Create the GitHub App for application creation from the Dashboard and turn it into a connection. You can limit which templates each connection offers.
- Register pull credentials for GHCR, Docker Hub, Amazon ECR and other registries as registry connections. When you register one, AppThrust lists the image's tags to check the credentials.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open Integrations under the Project's Settings and go to the connections list.
2. Start creating the GitHub App for application creation, choose its owner, then create and install the App on GitHub. Back in the Dashboard, enable the installation as a connection.
3. In the registry connections section, add a registry, enter the type, image path, user name and token, then create the connection.

## Good to know

- The GitHub App's owner is chosen from the users and organisations visible to the GitHub account you sign in with when connecting GitHub. The App is installed on GitHub, so use a GitHub account that can install Apps on that owner.
- A registry connection needs a user name and token that can list the tags at the image path you enter.
- Connections on this page do not belong to a single Project and can be used by several Projects.
- To register an image for one Project only, open Registries under Operations, choose Create repository and select External registry. This needs the Admin or Editor role on the Project.
- Checking access with Revalidate credentials does not change the saved credentials.
