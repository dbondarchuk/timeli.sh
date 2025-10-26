import { startBullMQJobProcessorApp } from "./bullmq";
// Start the application
startBullMQJobProcessorApp().catch((error: unknown) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
