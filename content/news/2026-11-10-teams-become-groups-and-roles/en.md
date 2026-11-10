---
title: Access management moves from teams to groups and roles
summary: Access to a Project is now decided by the roles given to users and groups, not by teams. Project Admins should check who holds which role on the Access tab.
publishedAt: 2026-11-10T10:30:00+09:00
category: announcement
tags: [iam, access]
---
Teams have been removed from AppThrust access management, which now uses groups and roles. A Project can be reached only by users who hold a role on it, and by members of groups that hold a role on it.

## What changes

- **The Project Access tab**: a Project's Settings in the [Dashboard]({{.PlatformAPIURL}}) now include an Access tab. Here you give users or groups one of three roles: Admin, Editor or Viewer. Admins manage everything, including access and settings; Editors create and change resources; Viewers have read-only access. Whoever creates a Project becomes its Admin.
- **Creating groups**: groups are created under Groups on the Dashboard's Settings page. There are two kinds: Local, whose members you list in AppThrust, and Claim, whose members come from the groups claim issued by your identity provider. A group grants nothing until it is given a role.
- **Re-mapping a group**: a Claim group mapped to an identity provider group can be moved to a new claim value with Re-map. A new group is created, every role assignment is moved to it, and only then is the old group deleted, so no role assignment is left without the group part-way through.
- **apth**: because access to a Project now comes from role assignments, Platform commands reject `--team` and the `APTH_TEAM` environment variable.

## What you need to do

- **Project Admins**: on the Access tab, check that the users and groups who need access hold the right role. To add one, choose Add access, pick the role and either User or Group, then confirm with the button named after the role, such as Add as Editor.
- **People creating groups**: creating a group needs the Group manager or Platform admin Platform role.
- **Members**: if a Project you expect to see is missing, ask one of its Admins to add you on the Access tab. If your apth scripts pass `--team` or `APTH_TEAM`, remove them.

## Good to know

- Only a Project's Admins can view and change its Access tab, and a Project always keeps at least one Admin.
- Removing a role assignment takes effect from the next request. Changes to group membership take effect when the user's access token is renewed, so ask the user to sign in again if it needs to apply straight away.
- Re-map changes only the claim value; the issuer stays the same. The old group is deleted and replaced by a group with a new name.
