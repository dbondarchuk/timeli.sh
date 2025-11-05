import { AllKeys } from "@timelish/i18n";
import { ConnectedAppData } from "../connected-app.data";

export type DashboardNotificationBadge = {
  key: string;
  count: number;
};

export type DashboardNotification = {
  type: string;
  badges?: DashboardNotificationBadge[];
  toast?: {
    type: "info" | "warning" | "error";
    title: {
      key: AllKeys;
      args?: Record<string, any>;
    };
    message: {
      key: AllKeys;
      args?: Record<string, any>;
    };
    action?: {
      label: {
        key: AllKeys;
        args?: Record<string, any>;
      };
      href: string;
    };
  };
};

export interface IDashboardNotifierApp {
  getInitialNotifications(
    appData: ConnectedAppData,
    date?: Date,
  ): Promise<DashboardNotification[]>;
}
