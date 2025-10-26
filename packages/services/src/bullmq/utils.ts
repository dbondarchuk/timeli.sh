import { BullMQConfig } from "./types";

export const getBullMQBaseConfig = (
  overrides?: Partial<BullMQConfig>,
): BullMQConfig => {
  return {
    redis: {
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0"),
    },
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
