import { AllKeys } from "@vivid/i18n";
import { ConnectedAppData } from "../connected-app.data";

export type DashboardNotification = {
  key: string;
  count?: number;
  toast?: {
    title: {
      key: AllKeys;
      args?: Record<string, any>;
    };
    message: {
      key: AllKeys;
      args?: Record<string, any>;
    };
    action: {
      label: {
        key: AllKeys;
        args?: Record<string, any>;
      };
      href: string;
    };
  };
};

export interface IDashboardNotifierApp {
  getNotifications(
    appData: ConnectedAppData,
    date?: Date,
  ): Promise<DashboardNotification[]>;
}
