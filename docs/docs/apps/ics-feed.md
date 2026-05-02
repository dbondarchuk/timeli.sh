---
sidebar_position: 12
description: Subscribe to an ICS URL so external calendars mark you busy inside Timelish.
---

# ICS feed

Reads a hosted calendar subscription URL ICS and merges those busy intervals into scheduling without full calendar write-back.

## Adding the App

1. Obtain the HTTPS ICS URL from the source system airfare tools partner studios personal calendar exports.
2. Open **Apps** → **App Store** choose **ICS feed**.
3. Paste the subscription URL nickname it if prompted.
4. Save run the built-in preview or tester if offered so you know fetch works.
5. Tell Timelish how often to refresh some hosts throttle frequent pulls obey their limits.

Stale data or handshake errors **[Apps troubleshooting](/docs/apps/troubleshooting)**.

### App-specific requirement

Feeds must stay publicly reachable or allowlisted IP endpoints private VPN-only URLs fail from cloud workers.

## Usage

### Block staff when another product owns their timetable

**What it is for:** Side gigs school rosters coop calendars subtract availability.

**Prerequisites:** Source publishes valid ICS TTL headers not password unless Timelish supports auth for that tier.

### Overlay partner locations

**What it is for:** Contractors share ICS read-only avoids duplicating calendars.

**Prerequisites:** Sharing policy allows ICS distribution.

### Layer multiple ICS feeds

**What it is for:** Busy union across family personal brand calendars.

**Prerequisites:** Naming each feed cleanly because troubleshooting depends on URLs.

## Removing the App

1. Open **Installed apps** → ICS feed instances.
2. Delete or disconnect the feed you no longer mirror.
3. Confirm removal.

### After you disconnect

Timelish ignores that external busy overlay immediately future booking checks no longer subtract those intervals.

### Source-side expectation

Upstream calendar continues unchanged cancel sharing at vendor if secrecy matters Timelish never wrote back upstream.
