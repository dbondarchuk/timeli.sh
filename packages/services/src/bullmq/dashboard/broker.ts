// lib/realtime-broker.ts
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

  public constructor(redisClient: Redis) {
    this.redisClient = redisClient.duplicate();
    this.redisClient.on("message", this.onMessage.bind(this));
  }

  subscribeCompany(companyId: string) {
    if (!this.subscribers.has(companyId)) {
      this.subscribers.set(companyId, new Set());
      this.redisClient.subscribe(`dashboard:notifications:${companyId}`);
    }
  }

  unsubscribeCompany(companyId: string) {
    const clients = this.subscribers.get(companyId);
    if (clients && clients.size === 0) {
      this.redisClient.unsubscribe(`dashboard:notifications:${companyId}`);
      this.subscribers.delete(companyId);
    }
  }

  registerClient(companyId: string, client: Client) {
    this.subscribeCompany(companyId);
    const set = this.subscribers.get(companyId)!;
    set.add(client);
  }

  unregisterClient(companyId: string, client: Client) {
    const set = this.subscribers.get(companyId);
    if (!set) return;
    set.delete(client);
    if (set.size === 0) this.unsubscribeCompany(companyId);
  }

  private onMessage(channel: string, raw: string) {
    const companyId = channel.split(":").pop()!;
    const clients = this.subscribers.get(companyId);
    if (!clients) return;
    const data = JSON.parse(raw);
    for (const client of clients) client.send(data);
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
