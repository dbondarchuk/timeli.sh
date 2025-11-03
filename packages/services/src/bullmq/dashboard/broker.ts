import { getLoggerFactory } from "@vivid/logger";
import type { DashboardNotification } from "@vivid/types";
import { Redis } from "ioredis";
import { getRedisClient } from "../redis-client";

type Client = {
  id: string;
  companyId: string;
  send: (data: DashboardNotification) => void;
};

class DashboardNotificationRealtimeBroker {
  protected readonly redisClient: Redis;
  private subscribers = new Map<string, Set<Client>>();

  protected readonly loggerFactory = getLoggerFactory(
    "DashboardNotificationRealtimeBroker",
  );

  public constructor(redisClient: Redis) {
    this.redisClient = redisClient.duplicate();
    this.redisClient.on("message", this.onMessage.bind(this));
  }

  subscribeCompany(companyId: string) {
    const logger = this.loggerFactory("subscribeCompany");
    logger.info({ companyId }, "Subscribing to company");
    if (!this.subscribers.has(companyId)) {
      this.subscribers.set(companyId, new Set());
      this.redisClient.subscribe(`dashboard:notifications:${companyId}`);
      logger.info({ companyId }, "Subscribed to company");
    } else {
      logger.info({ companyId }, "Already subscribed to company");
    }
  }

  unsubscribeCompany(companyId: string) {
    const logger = this.loggerFactory("unsubscribeCompany");
    logger.info({ companyId }, "Unsubscribing from company");
    const clients = this.subscribers.get(companyId);
    if (clients && clients.size === 0) {
      this.redisClient.unsubscribe(`dashboard:notifications:${companyId}`);
      this.subscribers.delete(companyId);
      logger.info({ companyId }, "Unsubscribed from company");
    } else {
      logger.info({ companyId }, "Not subscribed to company");
    }
  }

  registerClient(companyId: string, client: Client) {
    const logger = this.loggerFactory("registerClient");
    logger.info({ companyId, clientId: client.id }, "Registering client");
    this.subscribeCompany(companyId);
    const set = this.subscribers.get(companyId)!;
    set.add(client);
    logger.info({ companyId, clientId: client.id }, "Registered client");
  }

  unregisterClient(companyId: string, client: Client) {
    const logger = this.loggerFactory("unregisterClient");
    logger.info({ companyId, clientId: client.id }, "Unregistering client");
    const set = this.subscribers.get(companyId);
    if (!set) return;
    set.delete(client);
    if (set.size === 0) this.unsubscribeCompany(companyId);
    logger.info({ companyId, clientId: client.id }, "Unregistered client");
  }

  private onMessage(channel: string, raw: string) {
    const logger = this.loggerFactory("onMessage");
    logger.info({ channel, raw }, "Received message");

    const companyId = channel.split(":").pop()!;
    const clients = this.subscribers.get(companyId);
    if (!clients) {
      logger.info({ companyId }, "No clients found");
      return;
    }

    const data = JSON.parse(raw);
    for (const client of clients) client.send(data);
    logger.info(
      { companyId, clients: clients.size },
      "Sent message to clients",
    );
  }
}

let realtimeBroker: DashboardNotificationRealtimeBroker | null = null;

export const getDashboardNotificationRealtimeBroker =
  (): DashboardNotificationRealtimeBroker => {
    if (!realtimeBroker) {
      realtimeBroker = new DashboardNotificationRealtimeBroker(
        getRedisClient(),
      );
    }

    return realtimeBroker;
  };
