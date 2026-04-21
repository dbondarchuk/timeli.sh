import { WithOrganizationId } from "../database";
import type { EventEnvelope } from "../events/envelope";

export type BaseJobRequest = {
  id?: string;
  executeAt: Date | "now";
  deduplication?: {
    id: string;
    ttl: number;
  };
};

export type AppJobRequest<T = any> = BaseJobRequest & {
  type: "app";
  appId: string;
  payload: T;
};

/** Delivers an {@link EventEnvelope} to a single app subscriber (built-in or connected). */
export type EventDeliveryJobRequest = BaseJobRequest & {
  type: "event";
  appId: string;
  eventType: string;
  envelope: EventEnvelope;
};

export type JobRequest = AppJobRequest | EventDeliveryJobRequest;
export type OrganizationJobRequest = WithOrganizationId<JobRequest>;

export type Job = JobRequest & {
  id: string;
  createdAt: Date;
};
