import { WithDatabaseId, WithOrganizationId } from "../database";
import type { ActivityRecord } from "./activity-record";
import { Prettify } from "../utils/helpers";

export type ActivityEntry = Prettify<
  WithOrganizationId<
    WithDatabaseId<
      ActivityRecord & {
        createdAt: Date;
      }
    >
  >
>;
