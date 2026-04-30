import type { ActivityListItem } from "../activity/activity-list-item";
import type { ActivityListQuery } from "../activity/activity-query";
import type { ActivityRecord } from "../activity/activity-record";
import type { ActivitySeverity } from "../activity/activity-severity";
import type { ActivityFeedPreview } from "../apps/notifications/dashboard";
import type { WithTotal } from "../database/with-total";

export interface IActivityService {
  record(activity: ActivityRecord): Promise<string>;
  getActivities(query: ActivityListQuery): Promise<WithTotal<ActivityListItem>>;
  getUnreadActivityCount(userId: string): Promise<number>;
  /** Marks activity as seen for this user’s feed badge; publishes dashboard notification. */
  markActivityFeedRead(userId: string): Promise<void>;
  getActivityPreview(limit: number): Promise<ActivityFeedPreview[]>;
  getHighestSeveritySinceLastRead(
    userId: string,
  ): Promise<ActivitySeverity | null>;
  /** Distinct `eventType` values for filter UI (paginated, optional substring search). */
  getDistinctEventTypes(query: {
    search?: string;
    offset: number;
    limit: number;
  }): Promise<WithTotal<string>>;
}
