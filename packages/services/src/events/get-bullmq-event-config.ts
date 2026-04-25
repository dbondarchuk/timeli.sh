import { getBullMQBaseConfig } from "../bullmq/utils";
import type { BullMQEventConfig } from "./bullmq-event-types";

export const getBullMQEventConfig = (
  overrides?: Partial<BullMQEventConfig>,
): BullMQEventConfig => ({
  ...getBullMQBaseConfig(),
  queues: {
    events: {
      name: process.env.BULLMQ_EVENTS_QUEUE_NAME || "events",
      concurrency: parseInt(process.env.BULLMQ_EVENTS_CONCURRENCY || "5", 10),
    },
  },
  ...overrides,
});
