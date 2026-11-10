---
title: Create and publish applications from the terminal with the apth CLI
summary: apth now has browser-based device login and `apth apps` commands, so you can create and publish an application and work with its environment variables and logs from the terminal. It also ships skills for AI coding agents.
publishedAt: 2026-09-29T11:00:00+09:00
category: feature
tags: [apth, cli, apps]
---
With apth, the developer CLI, you can now go from signing in to a published application without leaving the terminal. It is for developers who prefer not to open the Dashboard, and for teams who want an AI coding agent to do the work.

## What you can do

- Sign in by approving, in a browser, the URL and code that `apth login` shows. The token is never printed. `apth whoami` checks whether the stored token is still accepted.
- Create a repository, a web component and PostgreSQL from a template in one step with `apth apps create`. Add `--publish` to get a public URL as well.
- Check readiness and the public URL with `apth apps get`, and use `apth apps wait` to wait until every component is ready and the public URL is serving.
- Work with environment variables through `apth apps env` and read recent logs with `apth apps logs`.
- Install the bundled skills into Claude Code, Codex and OMP with `apth skills install`, so the agent can follow the steps for creating and publishing an app with apth. No network connection is needed.

## How to use it

1. Run `apth login --api-url <URL> --project <Project>`, using the address of the [Dashboard]({{.PlatformAPIURL}}) as the URL.
2. Open the printed URL in a browser, check the code and select "Approve".
3. Run `apth apps create my-app --template nextjs-postgres --publish --wait`. An application created without `--publish` can be published later with `apth apps publish my-app --wait`.
4. Check the public URL with `apth apps get my-app`.
5. Set environment variables with `apth apps env set my-app KEY=VALUE`. Variables you do not name are kept as they are.

## Good to know

- Creating from a template requires the Project to have a GitHub connection for creating apps.
- Set secret values with `--sensitive KEY`; they are not shown again afterwards.
- Ask your platform administrator how to obtain apth.
