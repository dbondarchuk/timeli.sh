import type { Redis } from "ioredis";

export type BullMQConfig = {
  redis:
    | {
        host: string;
        port: number;
        password?: string;
        db?: number;
      }
    | Redis;
  defaultJobOptions: {
    removeOnComplete: number;
    removeOnFail: number;
    attempts: number;
    backoff: {
      type: "exponential" | "fixed";
      delay: number;
    };
  };
};
