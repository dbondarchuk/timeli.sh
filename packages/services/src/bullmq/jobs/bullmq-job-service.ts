import { getLoggerFactory } from "@timelish/logger";
import {
  AppScope,
  CompanyJobRequest,
  HookJobRequest,
  IJobService,
  Job,
  JobRequest,
} from "@timelish/types";
import { BaseBullMQClient } from "../base-bullmq-client";
import { BullMQJobConfig } from "./types";
import { serializeJobData } from "./utils";

export class BullMQJobService extends BaseBullMQClient implements IJobService {
  protected readonly config: BullMQJobConfig;

  constructor(
    protected readonly companyId: string,
    config: BullMQJobConfig,
  ) {
    super(config, getLoggerFactory("BullMQJobService", companyId));
    this.config = config;
    this.initializeQueues();
  }

  private initializeQueues(): void {
    const logger = this.loggerFactory("initializeQueues");

    // Create job queue
    const jobQueue = this.createQueue(this.config.queues.job.name);
    // this.createQueueEvents(this.config.queues.job.name);

    // Create job queue
    logger.info("BullMQ job queues initialized");
  }

  public async scheduleJob(jobRequest: JobRequest): Promise<Job> {
    const logger = this.loggerFactory("scheduleJob");

    try {
      logger.info({ jobRequest }, "Scheduling job");

      const queue = this.getQueue(this.config.queues.job.name);
      const job = await queue.add(
        "job",
        serializeJobData({
          ...jobRequest,
          companyId: this.companyId,
        } satisfies CompanyJobRequest),
        {
          jobId: jobRequest.id,
          priority: 0,
          delay:
            jobRequest.executeAt === "now"
              ? 0
              : jobRequest.executeAt.getTime() - new Date().getTime(),
          deduplication: jobRequest.deduplication,
        },
      );

      logger.info(
        {
          jobId: job.id,
          jobRequest,
        },
        "Job scheduled",
      );

      return {
        ...jobRequest,
        id: job.id!,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error({ error, jobRequest }, "Failed to schedule job");
      throw error;
    }
  }

  public async getJob(id: string): Promise<Job | null> {
    const logger = this.loggerFactory("getJob");
    try {
      logger.info({ jobId: id }, "Getting job");
      const queue = this.getQueue(this.config.queues.job.name);
      const job = await queue.getJob(id);
      if (!job) {
        logger.warn({ jobId: id }, "Job not found");
        return null;
      }

      logger.info({ jobId: id }, "Job found");
      return {
        ...job.data,
        id: job.id!,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error({ error, jobId: id }, "Failed to get job");
      throw error;
    }
  }

  public async getDeduplicatedJob(
    deduplicationId: string,
  ): Promise<Job | null> {
    const logger = this.loggerFactory("getDeduplicatedJob");
    try {
      logger.info({ deduplicationId }, "Getting deduplicated job");
      const queue = this.getQueue(this.config.queues.job.name);
      const jobId = await queue.getDeduplicationJobId(deduplicationId);
      if (!jobId) {
        logger.debug({ deduplicationId }, "Deduplicated job not found");
        return null;
      }

      return this.getJob(jobId);
    } catch (error) {
      logger.error(
        { error, deduplicationId },
        "Failed to get deduplicated job",
      );
      throw error;
    }
  }

  public async getJobs(): Promise<Job[]> {
    const logger = this.loggerFactory("getJobs");
    try {
      logger.info("Getting jobs");
      const queue = this.getQueue(this.config.queues.job.name);
      const jobs = await queue.getJobs();
      return jobs
        .map((job) => ({
          ...job.data,
          id: job.id!,
          createdAt: new Date(),
        }))
        .filter((job) => job.companyId === this.companyId);
    } catch (error) {
      logger.error({ error }, "Failed to get jobs");
      throw error;
    }
  }

  public async cancelJob(id: string): Promise<void> {
    const logger = this.loggerFactory("cancelJob");
    try {
      logger.info({ jobId: id }, "Canceling job");
      const queue = this.getQueue(this.config.queues.job.name);
      await queue.remove(id);
      logger.info({ jobId: id }, "Job canceled");
    } catch (error) {
      logger.error({ error, jobId: id }, "Failed to cancel job");
      throw error;
    }
  }

  public async getJobQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    return this.getQueueStats(this.config.queues.job.name);
  }

  public async enqueueHook<
    T extends Record<string, (...args: any[]) => Promise<void>>,
    M extends keyof T & string,
  >(scope: AppScope, method: M, ...args: Parameters<T[M]>): Promise<Job> {
    const logger = this.loggerFactory("enqueueHook");
    try {
      logger.info({ scope, method }, "Enqueuing hook");

      const jobRequest: HookJobRequest = {
        type: "hook",
        executeAt: "now",
        scope,
        method,
        args,
      };

      const job = await this.scheduleJob(jobRequest);

      logger.info({ scope, method }, "Hook enqueued");
      return job;
    } catch (error) {
      logger.error({ error, scope, method, args }, "Failed to enqueue hook");
      throw error;
    }
  }
}
