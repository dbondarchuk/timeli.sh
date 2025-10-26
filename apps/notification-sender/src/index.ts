import { startBullMQNotificationSenderApp } from "./bullmq";
// Start the application
startBullMQNotificationSenderApp().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
