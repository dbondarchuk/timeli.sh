import { AppScope } from "../apps/app";
import { Job, JobRequest } from "../jobs";

type FunctionKeys<T> = {
  [K in keyof T]: NonNullable<T[K]> extends (...args: any[]) => any ? K : never;
}[keyof T] &
  string;

type FunctionParamsWithoutAppData<T, K extends keyof T> =
  NonNullable<T[K]> extends (appData: any, ...args: infer P) => any ? P : never;

export interface IJobService {
  scheduleJob(job: JobRequest): Promise<Job>;
  getJob(id: string): Promise<Job | null>;
  getJobs(): Promise<Job[]>;
  cancelJob(id: string): Promise<void>;
  enqueueHook<T extends object, M extends FunctionKeys<T>>(
    scope: AppScope,
    method: M,
    ...args: FunctionParamsWithoutAppData<T, M>
  ): Promise<Job>;
}
