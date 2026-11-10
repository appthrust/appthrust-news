---
title: Check your custom domain's DNS settings in the Dashboard
summary: A Project's Domains tab now shows whether a custom domain's DNS is configured correctly and whether its certificate has been issued. The DNS records you need to set are ready to copy.
publishedAt: 2026-10-27T11:30:00+09:00
category: feature
tags: [dashboard, domains, dns]
---
A Project's Domains tab now shows the DNS configuration and certificate state of each custom domain. It is for anyone who publishes applications on their own domain.

## What you can do

- Each domain's card shows Valid configuration or Invalid configuration, and the certificate state, such as Certificate issued.
- When the configuration is invalid, the card gives the reason and the type, name and value of the record to set at your DNS provider, and you can copy the value.
- DNS details shows the records that public DNS currently returns.
- Hostnames issued under the Project's domain are listed as well, with where each one routes to and its public URL.

## How to use it

1. Open a Project in the [Dashboard]({{.PlatformAPIURL}}) and select the Domains tab.
2. Check the state on the custom domain's card. Domains with external DNS are checked automatically.
3. If it shows Invalid configuration, copy the value from the table and set that record at your DNS provider.
4. Select Refresh to check again.

## Good to know

- No record to set is shown for a domain that does not route anywhere yet.
- In some Projects, custom domains cannot be added yet.
