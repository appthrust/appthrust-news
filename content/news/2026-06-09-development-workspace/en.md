---
title: Edit application source in the browser with development workspaces
summary: Create a workspace on an application's Develop tab to edit source in VS Code Web in your browser, check it in the preview, then commit and open a pull request.
publishedAt: 2026-06-09T11:20:00+09:00
category: feature
tags: [dashboard, development]
---
Development workspaces let you edit an application's source in your browser. Without a local development environment, you can go from editing to opening a pull request in the Dashboard.

## What you can do

- Edit source in VS Code Web and check how the app behaves in the preview.
- Use Ask AI agent to edit to have the AI agent change the source, or open the Claude Code terminal.
- See the changed files under Changes, and push them to the workspace's source branch with Commit and push.
- Open a pull request on GitHub with Commit and create PR.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open the application from Applications in the sidebar and select the Develop tab.
2. Select New workspace, name it in Workspace name, then select Create workspace.
3. When the workspace is ready, edit the source, review it under Changes, then select Commit and create PR.

## Good to know

- Creating a workspace needs the Project Editor or Admin role.
- Committing and opening a pull request need a source repository connected to the application.
- The preview runs the dev script from the source's package.json on port 3000.
- Depending on the Project's AI policy and the installation's configuration, workspaces or the AI agent may not be available.
