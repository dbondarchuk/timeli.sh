import { activityHandler } from "./activity-handler";
import { appsHandler } from "./apps-handler";
import { dashboardNotificationHandler } from "./dashboard-notification-handler";
import { notificationHandler } from "./notification-handler";
import type { EventHandler } from "./types";

export const eventHandlers: EventHandler[] = [
  activityHandler,
  dashboardNotificationHandler,
  notificationHandler,
  appsHandler,
];

export type { EventHandler, EventHandlerContext } from "./types";
