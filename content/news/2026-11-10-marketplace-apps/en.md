---
title: Apps available in the marketplace
summary: An overview of the 16 apps currently in the marketplace, grouped by what they are for.
publishedAt: 2026-11-10T10:05:00+09:00
category: feature
tags: [marketplace]
---
The marketplace currently offers 16 apps. Here they are by purpose. Install them from the marketplace in the [Dashboard]({{.PlatformAPIURL}}).

## For your team

- **Home**: every built-in app installed in the Project, in one place.
- **Directory**: people, groups and profiles of the organisation.
- **Memo**: write and share Markdown articles inside the organisation; follow authors and like what you read.
- **Contacts**: scan business cards into shared contacts and see who in your team already knows whom.
- **Peer Bonus**: send points and thanks to colleagues every week; close each month into a payroll-ready statement.
- **Issues**: report and track AppThrust defects and work items on a keyboard-first board.
- **AppThrust News**: this app. It delivers news from AppThrust.

## AI

- **AI Gateway**: routes chat completions to allowed providers under the Project AI policy and records invocations.
- **Knowledge**: search and ask across Notion, esa and your own documents.
- **LLM**: a chat model (CPU) running inside the Project. No prompt or document content leaves the cluster.
- **Embedding**: text embeddings served inside the Project for Knowledge search. No content leaves the cluster.
- **Inference**: OpenAI-compatible chat completions inside the Project. Requires a GPU.
- **Vision**: chat completions for OCR and image understanding inside the Project. Requires a GPU.

## Build

- **Builder Console**: a console for building and releasing applications without touching cluster details.
- **Internal Tool Builder**: tables, forms and dashboards on the data in the Project.
- **Agent Guide**: an environment-bound guide and skills that teach coding agents to operate the Project with `apth` and `apthctl`.

Apps that require a GPU run only in environments that have one.
