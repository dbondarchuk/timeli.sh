import type { EventEnvelope } from "../../events/envelope";
import type { ConnectedAppData } from "../connected-app.data";

/** Apps with scope `event-subscriber` receive org-wide events via {@link EventEnvelope} (`envelope.type`). */
export interface IEventSubscriber {
  onEvent(appData: ConnectedAppData, envelope: EventEnvelope): Promise<void>;
}
