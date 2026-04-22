export type EventSource = {
  actor: "system" | "user" | "customer";
  actorId?: string;
};

/** Emits from jobs, install flows, and integrations without a signed-in user. */
export const systemEventSource: EventSource = { actor: "system" };

export function userEventSource(userId: string): EventSource {
  return { actor: "user", actorId: userId };
}

export function customerEventSource(customerId: string): EventSource {
  return { actor: "customer", actorId: customerId };
}

export type EventEnvelope<T = unknown> = {
  id: string;
  type: string;
  payload: T;
  organizationId: string;
  createdAt: Date;
  source: EventSource;
};
