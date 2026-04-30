import type { BullMQConfig } from "../bullmq/types";

export type BullMQEventConfig = BullMQConfig & {
  queues: {
    events: {
      name: string;
      concurrency: number;
    };
  };
};
