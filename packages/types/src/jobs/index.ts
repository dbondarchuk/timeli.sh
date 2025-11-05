import { AppScope } from "../apps/app";
import { WithCompanyId } from "../database";

export type BaseJobRequest = {
  id?: string;
  executeAt: Date | "now";
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

export type JobRequest = AppJobRequest | HookJobRequest;
export type CompanyJobRequest = WithCompanyId<JobRequest>;

export type Job = JobRequest & {
  id: string;
  createdAt: Date;
};
