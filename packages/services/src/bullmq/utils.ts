import { getRedisClient } from "./redis-client";
import { BullMQConfig } from "./types";

export const getBullMQBaseConfig = (
  overrides?: Partial<BullMQConfig>,
): BullMQConfig => {
  return {
    redis: getRedisClient(),
    defaultJobOptions: {
      removeOnComplete: parseInt(
        process.env.BULLMQ_REMOVE_ON_COMPLETE || "100",
      ),
      removeOnFail: parseInt(process.env.BULLMQ_REMOVE_ON_FAIL || "50"),
      attempts: parseInt(process.env.BULLMQ_MAX_RETRIES || "3"),
      backoff: {
        type:
          (process.env.BULLMQ_BACKOFF_TYPE as "exponential" | "fixed") ||
          "exponential",
        delay: parseInt(process.env.BULLMQ_BACKOFF_DELAY || "2000"),
      },
    },
    ...overrides,
  };
};
