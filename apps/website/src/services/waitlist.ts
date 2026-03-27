import { renderUserEmailTemplate } from "@timelish/email-builder/static";
import { SystemServicesContainer } from "@timelish/services";
import { getDbConnection } from "@timelish/services/database";

export async function joinWaitlist(email: string) {
  const db = await getDbConnection();
  const waitlistCollection = db.collection("website-waitlist");
  const existingEntry = await waitlistCollection.findOne({ email });
  if (existingEntry) {
    return {
      success: false,
      message: "Email already in waitlist",
    };
  }

  const waitlist = await waitlistCollection.insertOne({
    email,
    createdAt: new Date(),
  });
  const serviceContainer = SystemServicesContainer();
  const emailTemplate = await renderUserEmailTemplate({
    content: [
      {
        type: "text",
        text: `Hi there! 👋

Thanks for joining the **Timeli.sh** waitlist — we’re excited to have you on board!

We’re building a simple, modern way to create your own **appointment booking website in seconds**, without confusing tools or hidden fees. You’ll be one of the first to try it.

### What you can expect:
- Early access before the public launch  
- Special perks for early supporters  
- Updates as we add new features

We’ll be in touch soon with next steps. In the meantime, feel free to reply to this email if you’d like to share ideas or features you’d love to see — we’re listening. 💬

Thanks for being early.  
**Your future bookings will thank you.**

— The Timeli.sh Team ✨
`,
      },
      { type: "title", text: "🎉 You're on the Timeli.sh Waitlist!" },
    ],
    previewText: "You're on the waitlist!",
  });

  await serviceContainer.notificationService.sendSystemEmail({
    to: [email],
    subject: "🎉 You're on the Timeli.sh Waitlist!",
    body: emailTemplate,
  });

  await serviceContainer.notificationService.sendSystemEmail({
    to: [process.env.ADMIN_EMAIL!],
    subject: "🎉 New waitlist entry",
    body: `New waitlist entry: ${email}`,
  });

  return {
    success: true,
  };
}
