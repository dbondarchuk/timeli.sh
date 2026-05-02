---
sidebar_position: 30
description: Operational SMS to staff about bookings outages and escalation chains using your SMS transport.
---

# Text message notification

Sends SMS to internal numbers—practitioners managers or ops lines—when booking events thresholds or operational alerts occur so the team reacts without refreshing the admin inbox alone.

## Adding the App

1. Configure an SMS transport your workspace supports—for example **[Textbelt](/docs/apps/text-belt)** —with credits allowances and compliant use.
2. Open **Apps** → **App Store** and enable **Text message notification**.
3. Add E.164 phone numbers per role verify each device receives a **Send test**.
4. Set quiet hours and escalation order if the UI exposes them so overnight pings stay intentional.

Delivery failures **[Apps troubleshooting](/docs/apps/troubleshooting)** plus carrier DND and short-code blocks.

### App-specific requirement

Employer and regional rules may require documented consent before operational texts to personal phones.

## Usage

### Ping staff when a new booking arrives

**What it is for:** Same-day responsiveness without staring at email.

**Prerequisites:** Numbers current role mapping accurate SMS transport healthy.

### Escalate a likely no-show

**What it is for:** Recover the slot by calling alternate waiters.

**Prerequisites:** Timing rules tuned so escalations fire only after your policy threshold.

### Broadcast an internal closure

**What it is for:** Snow power outage staffing emergency.

**Prerequisites:** Recipient group maintained avoid texting customers accidentally via this channel.

### On-call rotations

**What it is for:** Fair hand-offs when only one responder should wake up.

**Prerequisites:** Calendar or ladder configuration kept up when people swap shifts.

## Removing the App

1. Open **Installed apps** → **Text message notification** uninstall or toggle off.

### After you disconnect

Operational SMS alerts stop reassure the team via email Slack or pager path so nothing critical goes silent.

### Data handling

Timelish clears active notification targets per retention policy historic delivery logs may remain for auditing until purged.
