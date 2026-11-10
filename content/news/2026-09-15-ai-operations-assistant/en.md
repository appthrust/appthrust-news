---
title: Ask the Dashboard's AI Operations Assistant about the Project you are viewing
summary: The AI Operations Assistant, opened from the Dashboard header, reads the state, logs and metrics of the Project or component you have open and answers your questions. Writes such as creating resources run only after you review and approve them.
publishedAt: 2026-09-15T11:10:00+09:00
category: feature
tags: [dashboard, ai]
---
The AI Operations Assistant in the Dashboard reads the state of the Project, application or component you have open and answers your questions about it. It acts with the permissions of the signed-in user.

## What you can do

- Check the state of Projects, applications, components, databases and domains, plus a component's logs and metrics.
- Let it move between pages, or highlight the log line that looks like the cause.
- After your approval, create Projects, applications, components, databases and publish routes. A database change is stored as a DatabaseChange that, by default, is applied manually.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open a Project or component, then select the AI assistant button in the header.
2. In the AI Operations Assistant panel that opens on the right, pick a suggested question or type your own and send it.
3. When an approval prompt appears, check where it will write and the SQL to be stored, then select Run or Cancel. Environment variables are shown by key name only, never by value.

## Good to know

- Your platform administrator must configure an AI provider API key for the Dashboard. Where none is configured, the panel shows "AI assistant is not available here." and the message box is disabled.
- If changing screens after asking changes where a pending operation would write, that operation can no longer be approved. Select Dismiss and ask again.
- Deleting, redeploying, rolling back and working with secrets are not available.
