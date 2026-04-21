import type { CoreEventPayloadByType } from "../events/core-event-payloads";
import type { EventSource } from "../events/envelope";

export interface IEventService {
  emit<K extends keyof CoreEventPayloadByType>(
    type: K,
    payload: CoreEventPayloadByType[K],
    source: EventSource,
  ): Promise<void>;
  emit(type: string, payload: unknown, source: EventSource): Promise<void>;
}
