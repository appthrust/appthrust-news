---
title: Issue API keys with Project access keys
summary: You can now issue API keys for calling application APIs from Access keys under a Project's Settings or with `apth access-keys`, and disable or revoke them.
publishedAt: 2026-10-27T11:00:00+09:00
category: feature
tags: [iam, apth]
---
A Project can now issue API keys, called access keys, for calling application APIs from local development, external services and other places.

## What you can do

- Issue a key in the Space of an app that exposes an API, choosing its scopes and how long it lasts.
- Disable a key for a while, or revoke it. Revoking cannot be undone. Tokens already exchanged before revocation may stay valid for a short time afterwards.
- Project Admins can manage every key in the Project and can also issue a Service key for a service outside the Project.

## How to use it

1. In the [Dashboard]({{.PlatformAPIURL}}), open Access keys under the Project's Settings.
2. Select Create key, choose the Space and scopes, and create the key.
3. Save the key with Copy key. The key is shown only this once.
4. To stop a key, open its menu and choose Disable or Revoke.
5. With apth, issue a key with `apth access-keys create --project <project> --space <space> --scope <scope>`, and use `disable`, `enable` and `revoke` for the same actions.

## Good to know

- In a Project without a usable Space, you cannot create a key.
- A key is exchanged for a short-lived token before use. You can also exchange it with `apth access-keys exchange`.
