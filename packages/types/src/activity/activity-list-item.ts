import type { Prettify } from "../utils/helpers";
import type { ActivityEntry } from "./activity-entry";
import type { ActivityActorDisplay } from "./activity-actor";

export type ActivityListItem = Prettify<
  ActivityEntry & {
    actorDisplay: ActivityActorDisplay;
  }
>;
