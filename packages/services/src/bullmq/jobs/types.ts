import { AppScope } from "@vivid/types";
import { BullMQConfig } from "../types";

export type BullMQJobConfig = BullMQConfig & {
  queues: {
    job: {
      name: string;
      concurrency: number;
    };
  };
};

export type BullMQHookJob = {
  scope: AppScope;
  method: string;
  args: any[];
};
