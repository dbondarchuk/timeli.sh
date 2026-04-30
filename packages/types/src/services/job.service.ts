import { Job, JobRequest } from "../jobs";

export interface IJobService {
  scheduleJob(job: JobRequest): Promise<Job>;
  getJob(id: string): Promise<Job | null>;
  getDeduplicatedJob(deduplicationId: string): Promise<Job | null>;
  getJobs(): Promise<Job[]>;
  cancelJob(id: string): Promise<void>;
}
