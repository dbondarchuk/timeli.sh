---
sidebar_position: 11
description: Connect Microsoft Outlook or Microsoft 365 calendars to Timelish.
---

# Outlook

Syncs bookings with Outlook calendar so Microsoft 365 workplaces keep one source of truth for busy times Teams links when configured through your tenancy.

## Adding the App

1. Open **Apps** → **App Store** locate **Outlook** or labelled Microsoft Calendar integration.
2. Choose **Install** start the connection wizard.
3. Sign in with the Microsoft work or personal account admins use policies that consent to delegated calendar scopes.
4. Accept every permission Outlook shows partial consent fails the handshake.
5. Return to Timelish wait until status is healthy then pick this connection under calendars or defaults.

If admin consent banners appear see **[Apps troubleshooting](/docs/apps/troubleshooting)** and involve Microsoft 365 admin center.

### App-specific requirement

Conditional Access or Intune blocks must allow Timelish as a SaaS relay same as other third-party SaaS integrations.

## Usage

### Maintain Outlook events for services

**What it is for:** Confirmed bookings land on Outlook everyone uses desktop web or Teams schedule views.

**Prerequisites:** Mailbox licensed for Outlook calendar room resources optional.

### Honour organisation busy rules

**What it is for:** Exchange busy data prevents double booking across subsidiaries.

**Prerequisites:** Connecting account owns or delegates those calendars.

### Leverage Teams join links

**What it is for:** Virtual meetings populate like native Outlook meetings when your template maps them.

**Prerequisites:** Tenant policy permits online meetings auto creation licensing covers Teams.

## Removing the App

1. Navigate **Installed apps** → Outlook Microsoft connection.
2. Choose disconnect revoke or uninstall following on-screen wording.
3. Confirm your choice.

### After you disconnect

Outlook stops updating from Timelish new bookings rely on another calendar path or manual entry.

### Vendor-side cleanup

In **Azure AD** Enterprise apps or Outlook connected apps revoke Timelish access if your security team insists delete ghost events separately on the mailbox.
