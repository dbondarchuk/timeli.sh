export type EventSource = {
  actor: "system" | "user" | "customer";
  actorId?: string;
};

export type EventEnvelope<T = unknown> = {
  id: string;
  type: string;
  payload: T;
  organizationId: string;
  createdAt: Date;
  source: EventSource;
};
