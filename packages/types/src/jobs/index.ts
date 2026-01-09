import { AppScope } from "../apps/app";
import { WithCompanyId } from "../database";

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

export type HookJobRequest = BaseJobRequest & {
  type: "hook";
  scope: AppScope;
  method: string;
  args: any[];
};

export type CoreJobRequest<T = any> = BaseJobRequest & {
  type: "core";
  appId: string;
  payload: T;
};

export type JobRequest = AppJobRequest | HookJobRequest | CoreJobRequest;
export type CompanyJobRequest = WithCompanyId<JobRequest>;

export type Job = JobRequest & {
  id: string;
  createdAt: Date;
};
