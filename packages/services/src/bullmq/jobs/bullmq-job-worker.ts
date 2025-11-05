import { getLoggerFactory } from "@timelish/logger";
import {
  AppJobRequest,
  CompanyJobRequest,
  HookJobRequest,
  IScheduled,
  IServicesContainer,
  WithCompanyId,
} from "@timelish/types";
import { Job } from "bullmq";
import { BaseBullMQClient } from "../base-bullmq-client";
import { BullMQJobConfig } from "./types";
import { reviveJobData } from "./utils";

export class BullMQJobWorker extends BaseBullMQClient {
  protected readonly config: BullMQJobConfig;

  constructor(
    config: BullMQJobConfig,
    protected readonly getServices: (companyId: string) => IServicesContainer,
  ) {
    super(config, getLoggerFactory("BullMQJobWorker"));
    this.config = config;
    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    const logger = this.loggerFactory("initializeWorkers");

    // Create email worker
    const jobWorker = this.createWorker(
      this.config.queues.job.name,
      this.processJob.bind(this),
      {
        concurrency: this.config.queues.job.concurrency,
      },
    );
    this.setupWorkerEventListeners(jobWorker, this.config.queues.job.name);

    logger.info("BullMQ job workers initialized");
  }

  private async processJob(job: Job<CompanyJobRequest>): Promise<void> {
    const logger = this.loggerFactory("processJob");
    const jobData = reviveJobData(job.data);

    try {
      logger.info(
        {
          jobId: job.id,
          attempt: job.attemptsMade + 1,
          maxAttempts: job.opts.attempts,
          jobData,
        },
        "Processing job",
      );

      switch (jobData.type) {
        case "app":
          await this.processAppJob(job.id!, jobData);
          break;
        case "hook":
          await this.processHookJob(job.id!, jobData);
          break;
      }

      logger.info({ jobId: job.id }, "Job completed successfully");
    } catch (error) {
      logger.error(
        {
          error,
          jobId: job.id,
          attempt: job.attemptsMade + 1,
          maxAttempts: job.opts.attempts,
        },
        "Job failed",
      );

      throw error; // Re-throw to trigger retry mechanism
    }
  }

  public async getWorkerStats(): Promise<{
    job: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  }> {
    const jobStats = await this.getQueueStats(this.config.queues.job.name);

    return {
      job: jobStats,
    };
  }

  public async start(): Promise<void> {
    const logger = this.loggerFactory("start");
    logger.info("Starting BullMQ job worker");

    try {
      // Call parent start method to handle Redis connection
      await super.start();

      // Start all workers
      for (const [name, worker] of this.workers) {
        await worker.waitUntilReady();
        logger.info({ worker: name }, "Worker started");
      }

      logger.info("BullMQ job worker started successfully");
    } catch (error) {
      logger.error({ error }, "Failed to start BullMQ job worker");
      throw error;
    }
  }

  public async stop(): Promise<void> {
    const logger = this.loggerFactory("stop");
    logger.info("Stopping BullMQ job worker");

    try {
      // Call parent stop method to handle cleanup
      await super.stop();
      logger.info("BullMQ job worker stopped successfully");
    } catch (error) {
      logger.error({ error }, "Error stopping BullMQ job worker");
    }
  }
  /**
   * Start the worker and keep it running until it crashes or is stopped
   * This method will block until the worker encounters a fatal error
   */
  public async run(): Promise<void> {
    const logger = this.loggerFactory("runUntilCrash");

    try {
      await this.start();
      logger.info("BullMQ job worker started successfully");

      // Set up graceful shutdown handlers
      const gracefulShutdown = async (signal: string) => {
        logger.info(
          { signal },
          "Received shutdown signal, stopping worker gracefully",
        );
        await this.stop();
        process.exit(0);
      };

      process.on("SIGINT", () => gracefulShutdown("SIGINT"));
      process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

      // Keep the process alive and wait for worker errors
      await new Promise<void>((resolve, reject) => {
        // Listen for worker errors
        for (const [workerName, worker] of this.workers) {
          worker.on("error", (error: Error) => {
            logger.error(
              { error, worker: workerName },
              "Worker encountered fatal error",
            );
            reject(error);
          });
        }

        // Listen for Redis connection errors
        this.redis.on("error", (error: Error) => {
          logger.error({ error }, "Redis connection error");
          reject(error);
        });

        // Listen for Redis connection close
        this.redis.on("close", () => {
          logger.warn("Redis connection closed");
          reject(new Error("Redis connection closed"));
        });

        // Keep the process alive
        const keepAlive = () => {
          setTimeout(keepAlive, 1000);
        };
        keepAlive();
      });
    } catch (error) {
      logger.error({ error }, "Worker crashed with error");
      await this.stop();
      throw error;
    }
  }

  /**
   * Start the worker and run it indefinitely with automatic restart on crashes
   * This method will restart the worker if it crashes, with exponential backoff
   */
  public async runWithRestart(
    maxRestarts: number = 10,
    restartDelay: number = 5000,
  ): Promise<void> {
    const logger = this.loggerFactory("runWithRestart");
    let restartCount = 0;

    while (restartCount < maxRestarts) {
      try {
        logger.info({ restartCount, maxRestarts }, "Starting worker");
        await this.run();
      } catch (error) {
        restartCount++;
        logger.error(
          { error, restartCount, maxRestarts },
          "Worker crashed, attempting restart",
        );

        if (restartCount >= maxRestarts) {
          logger.error({ maxRestarts }, "Max restarts reached, giving up");
          throw new Error(`Worker crashed ${maxRestarts} times, giving up`);
        }

        // Exponential backoff delay
        const delay = restartDelay * Math.pow(2, restartCount - 1);
        logger.info({ delay }, "Waiting before restart");
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  private async processAppJob(
    jobId: string,
    jobData: WithCompanyId<AppJobRequest>,
  ): Promise<void> {
    const logger = this.loggerFactory("processAppJob");

    try {
      logger.info({ jobId, jobData }, "Processing app job");
      const companyId = jobData.companyId;
      if (!companyId) {
        throw new Error("companyId is required in job data");
      }
      const { app, service } = await this.getServices(
        companyId,
      ).connectedAppsService.getAppService<IScheduled>(jobData.appId);

      if (service.processJob) {
        await service.processJob(app, jobData);
        logger.info({ jobId }, "Job completed successfully");
      } else {
        logger.error({ jobId }, "Job does not implement processJob");
      }
    } catch (error) {
      logger.error({ error, jobId, jobData }, "Failed to process app job");
      throw error;
    }
  }

  private async processHookJob(
    jobId: string,
    jobData: WithCompanyId<HookJobRequest>,
  ): Promise<void> {
    const logger = this.loggerFactory("processHookJob");

    try {
      logger.info({ jobId, jobData }, "Processing hook job");
      const companyId = jobData.companyId;
      if (!companyId) {
        throw new Error("companyId is required in job data");
      }

      await this.getServices(companyId).connectedAppsService.executeHooks<
        any,
        void
      >(jobData.scope, async (app, service) => {
        try {
          const method = service[jobData.method];
          if (!method) {
            logger.error({ jobId, jobData }, "Method not found");
            return;
          }

          logger.info(
            { jobId, jobData, method, type: service.constructor.name },
            "Executing method",
          );
          return await method.apply(service, [app, ...jobData.args]);
        } catch (error) {
          logger.error({ error, jobId, jobData }, "Failed to execute method");
        }
      });

      logger.info({ jobId }, "Job completed successfully");
    } catch (error) {
      logger.error({ error, jobId, jobData }, "Failed to process hook job");
      throw error;
    }
  }
}
