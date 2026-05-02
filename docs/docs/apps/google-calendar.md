---
sidebar_position: 10
description: Connect Google Calendar to Timelish for availability sync and Meet links.
---

# Google Calendar

Lets Timelish read and write bookings on Google Calendar, attach Google Meet when you enable it, and keep staff busy times accurate.

## Adding the App

1. Open **Apps** → **App Store** and choose **Google Calendar**.
2. Select **Install** or **Connect** confirm you agree to calendar access for bookings.
3. Sign in with the Google account whose calendar powers this workspace finish any two-step prompts.
4. Approve scopes listed on the consent screen incomplete approval leaves the App on **Pending**.
5. When the card shows success open **Appointment settings** or **Installed apps** to pick this calendar connection as your active provider if prompted.

Forgot a step stuck on Pending or bouncing sign-in loops see **[Apps troubleshooting](/docs/apps/troubleshooting)**.

### App-specific requirement

Busy-workspace admins should use a calendar mailbox they control, not a generic shared inbox, unless your policy allows delegated calendar creation.

## Usage

### Keep appointment blocks on Google Calendar

**What it is for:** Staff see the same bookings in Timelish and Google clients.

**Prerequisites:** Google Workspace or Gmail account calendars stay enabled Gmail deliverability unaffected.

### Automatically add Meet links

**What it is for:** Video conferencing links populate on events your clients receive.

**Prerequisites:** Organisation policy allows Meet creation calendars not restricted from conferencing.

### Block times pulled from secondary calendars

**What it is for:** Personal or resource calendars subtract availability without copying events manually.

**Prerequisites:** Those calendars are shared readable to the connecting account scopes include them.

### Two-way deletes or reschedule

**What it is for:** Cancellations in either system stay aligned.

**Prerequisites:** Conflicting automation outside Timelish is paused edits happen on the authoritative calendar.

## Removing the App

1. Open **Installed apps**.
2. Open **Google Calendar** choose disconnect uninstall or trash per the buttons shown.
3. Confirm so Timelish revokes OAuth tokens.

### After you disconnect

Booking creation halts unless another calendar App is configured. Timelish stops pushing updates to Google and stops reading availability from those calendars.

### Vendor-side cleanup

Inside **Google Account** → **Security** → **Third-party apps** remove Timelish if you want the connection gone everywhere. History already written on Google calendars remains until you delete those events.
