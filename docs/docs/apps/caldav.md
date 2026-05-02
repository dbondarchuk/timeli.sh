---
sidebar_position: 13
description: Connect RFC CalDAV calendars with server URL credentials and sync schedules.
---

# CalDAV

For providers that expose CalDAV ownCloud Nextcloud Fastmail niche hosts Timelish creates events over HTTPS using standard credentials.

## Adding the App

1. Gather server base URL HTTPS port encryption mode username app password or token from host docs.
2. Open **Apps** → **App Store** pick **CalDAV**.
3. Enter connection fields run **Test connection** if present . Fix typo TLS mismatch before saving.
4. Map default calendar folders when UI asks writable calendar must permit component creation.
5. Save watch status chip until synced.

Repeated auth failures **[Apps troubleshooting](/docs/apps/troubleshooting)** especially TLS app-password sections.

### App-specific requirement

Self-signed certificates need trust installed on Timelish edge many teams instead use LetsEncrypt public chain.

## Usage

### Two-way bookings on self-managed servers

**What it is for:** Privacy-conscious teams keep infra in-house.

**Prerequisites:** CalDAV ACL allows event insert update delete quotas not exhausted.

### Alternate stack for redundancy

**What it is for:** Secondary calendar survives Google outages.

**Prerequisites:** Reliable uptime monitoring because silent failures lurk.

### Multi-resource salons

**What it is for:** Each stylist gets own CalDAV user bind separate App installs if product requires.

**Prerequisites:** Licensing covers multiple connections.

## Removing the App

1. **Installed apps** → choose CalDAV instance.
2. Disconnect delete credentials wipe fields confirm.
3. Verify no orphaned background jobs referencing same host remain if UI warns.

### After you disconnect

Writes stop deletes stop reads stop Timelish forgets credential blobs per retention policy.

### Host-side housekeeping

Rotate the app-password you disclosed revoke token at vendor Timelish no longer contacts server.
