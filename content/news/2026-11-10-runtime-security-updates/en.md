---
title: How runtime security updates are handled for applications
summary: Applications created from the Next.js template now use the Node.js 24 managed runtime and take runtime updates automatically. Even for a runtime set to manual updates, Critical and High advisories are updated to the fixed version after a grace period.
publishedAt: 2026-11-10T10:40:00+09:00
category: announcement
tags: [runtime, security, apth]
---
We have changed what happens when a fix for a vulnerability is released for an application's language runtime. For applications that use an AppThrust managed runtime, Critical and High advisories are updated to the fixed runtime once the grace period has passed.

## What changes

- New applications created from the Next.js template, from the Dashboard or apth, use the Node.js 24 managed runtime by default and take runtime updates automatically.
- Even when a component's Runtime updates setting is Manual, a Critical or High advisory is updated to the fixed version automatically after a grace period. By default the grace period is 48 hours for Critical and 168 hours for High. Medium and Low advisories are shown, but an update is never forced for them on a Manual component.
- When components are affected, a Security updates badge appears on the Project overview. It opens Runtime advisories, where you can see each component's state and deadline. `apth runtime-advisories list` shows the same information.

## What you need to do

Nothing is required for runtimes set to automatic updates.

If you use manual updates, you can update at any time before the deadline with Update runtime now on the component page. If you do nothing, the update is applied after the deadline. You can change the grace periods for a Project with `apth runtime-advisory-policy set`, up to 168 hours for Critical and 720 hours for High. If your organisation's policy sets a shorter period, that period applies.

## Good to know

- Only components that use a managed runtime are covered. Applications created from other templates such as Next.js + Blacksmith, or from an existing image, run the runtime inside their image and are not covered unless you choose a managed runtime for them. Choosing None (image includes its runtime) also leaves an application uncovered.
- On a Manual component, the update made after the grace period is tried only once for each runtime image. If it fails, or if you roll back after it, the same image is not applied automatically again. Fix the application and use Update runtime now, or wait for the next patch.
- While a release is held or a rollback is pinned, the update is not forced, even after the grace period.
