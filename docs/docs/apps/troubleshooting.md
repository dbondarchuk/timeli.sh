---
sidebar_position: 2
description: Fix common App connection problems in Timelish reconnect flows permissions and browsers.
---

# Apps troubleshooting

Use this page when an App stuck on **Pending** loops sign-in screens or suddenly stops syncing.

## Before you troubleshoot

1. Confirm you are in the correct **Timelish workspace**.
2. Try the same steps in another browser or a private/incognito window.
3. Pause browser extensions that block cookies pop-ups or third-party scripts temporarily.

## Sign-in windows close or stay blank

**Symptoms:** Partner sign-in never finishes or flashes away.

**Things to try:**

- Allow pop-ups for your Timelish admin domain.
- Disable strict tracking protection for the sign-in moment.
- Retry on a different browser or device.

If it still fails capture a short screen recording and contact support with the App name and approximate time.

## Endless Pending or Disconnected

**Symptoms:** The App card never shows success or flips back to error after a day.

**Things to try:**

- Open **Installed apps** choose **Reconnect** and complete every screen.
- Check email for security alerts from Google Microsoft Stripe PayPal Zoom or your mail host.
- If your IT team controls access ask them to approve Timelish as a third-party app where required.

## Permissions or scope errors

**Symptoms:** The vendor says Timelish lacks access to calendar mail payments or meetings.

**Things to try:**

- Use **Reconnect** and accept all requested permissions for that App.
- If you previously denied access revoke the old connection at the vendor uninstall the App in Timelish then add it again cleanly.

## Credentials for SMTP or CalDAV reject

**Symptoms:** Test send fails or calendars stay empty.

**Things to try:**

- Re-copy host port username and password from your provider help article.
- Toggle between recommended ports and encryption modes TLS versus SSL as your host documents.
- Confirm the account allows sign-in from automation not only webmail.

## Payments App shows live but checkout still fails

**Things to try:**

- Stripe Square PayPal each have their own dashboard for account status compliance and webhooks follow their alerts first.
- Confirm the App is chosen under **Default apps** or **Appointment settings** where checkout expects a processor.
- Run a small test payment before announcing go-live.

## Still stuck

Contact **Timelish support** through the channel your plan provides. Include App name workspace region rough timestamp and what you already tried from this page so support can reply faster.
