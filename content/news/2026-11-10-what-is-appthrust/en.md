---
title: What is AppThrust? A guide for newcomers
summary: AppThrust is where your organization uses, installs, and builds and publishes its internal apps. This guide explains what it does and where to start, including for people who do not write code.
publishedAt: 2026-11-10T13:30:00+09:00
category: announcement
pinned: true
tags: [getting-started]
---
AppThrust is the platform your organization runs its apps on. It provides the servers, databases, public URLs and sign-in together, so people who use an app only need to open it in a browser, and people who build one can publish it without preparing servers.

AppThrust News, which you are reading now, is one of the apps running on AppThrust.

## Three ways to use it

| Way | For | What you do |
| --- | --- | --- |
| Use apps | Everyone | Sign in with your organization account and open the apps in your Project. |
| Install apps | Project admins and editors | Choose a ready-made app in the marketplace and select "Install". |
| Build and publish apps | Developers | Put your own app in a Project and publish it on a URL. |

You do not need development experience: the first way is enough to use AppThrust.

## Words to know first

| Word | Meaning |
| --- | --- |
| Dashboard | The AppThrust management screen. Every operation starts here. |
| Project | The unit that groups apps and data, split by department or purpose. You see only the Projects where you have a role. |
| Application | An app running in a Project. Apps installed from the marketplace and apps you build appear in the same list. |
| Marketplace | The catalog of ready-made apps. An installed app becomes an application of that Project. |
| Role | What you may do in a Project: Admin, Editor or Viewer. |

## Use apps

1. Open the [Dashboard]({{.PlatformAPIURL}}) and sign in with your organization account.
2. Choose your Project and open "Applications".
3. Open the app you want. Inside an app, the app switcher in the header takes you to the other apps in the same Project.

Every app opens with the same account. You do not create an ID or password per app.

## Install apps

The "Marketplace" in a Project lists apps that work as soon as they are installed. Read the overview and screenshots, select "Install", and the app joins the Project's applications within a few minutes.

An app runs only inside the Project it was installed in, and its data is stored as that Project's data.

## Build and publish apps

Developers can put their own apps on AppThrust. It provides:

- **A place to run**: specify a container image or start from a template. New versions are released gradually.
- **Databases**: created together with the app, with backup, restore and data inspection in the Dashboard.
- **Public URLs**: publish on the Project domain or on your own domain. Certificates are provisioned automatically.
- **Operations**: logs, metrics, environment variables and the audit log are available in the Dashboard.
- **Command line**: the `apth` CLI performs the same operations from a terminal or a coding agent. Get it from [https://github.com/appthrust/cli](https://github.com/appthrust/cli).

You can also ask the AI assistant in the Dashboard header about the state of the Project or app you have open.

## When you are stuck

- **You cannot see a Project**: ask an admin of that Project to add you in the "Access" tab under "Settings".
- **An app does not open**: when the screen says the app is starting, keep waiting and it opens. If it does not, check the app's state under "Applications" in the Dashboard.
- **You want to know what is new**: AppThrust News receives announcements of new and changed features. Unread items are marked in the list.
