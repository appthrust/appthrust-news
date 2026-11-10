---
title: The apth CLI is now public on GitHub
summary: apth CLI binaries are now available without authentication from the public GitHub repository appthrust/cli. The first public release is apth-v0.1.0.
publishedAt: 2026-11-10T12:00:00+09:00
category: announcement
tags: [apth, cli]
---
Binaries of apth, the AppThrust developer CLI, are now distributed from a public GitHub repository. You do not need a GitHub account or token to get them.

- Repository: [https://github.com/appthrust/cli](https://github.com/appthrust/cli)
- First public release: [apth-v0.1.0](https://github.com/appthrust/cli/releases/tag/apth-v0.1.0)
- All releases: [https://github.com/appthrust/cli/releases](https://github.com/appthrust/cli/releases)

## What changes

- Until now you had to ask your platform administrator how to obtain apth. You can now install it directly from the public repository.
- Supported platforms are Linux and macOS on amd64 and arm64.
- Every release carries a checksum list (SHA256SUMS), and the install script verifies the downloaded file against it.

## Install

This command installs the newest release into `~/.local/bin`.

```sh
curl -fsSL https://raw.githubusercontent.com/appthrust/cli/main/install.sh | sh -s -- apth
```

- To pin a version, append it (for example `sh -s -- apth v0.1.0`).
- To install somewhere else, set the `APTH_INSTALL_DIR` environment variable.
- To download manually, take the archive and SHA256SUMS from the release page.

After installing, check it with `apth --help` and sign in with `apth login`.

## What you need to do

If you already use apth, nothing is required. You can install a newer version with the same command.

## Good to know

- The repository publishes binaries only; it does not contain the source code.
- If `~/.local/bin` is not on your PATH, add it in your shell.
