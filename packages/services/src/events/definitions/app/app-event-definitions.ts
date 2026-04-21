import { AvailableApps } from "@timelish/app-store";
import { BaseAllKeys } from "@timelish/i18n";
import {
  APP_CONNECTED_EVENT_TYPE,
  APP_FAILED_EVENT_TYPE,
  APP_INSTALLED_EVENT_TYPE,
  APP_UNINSTALLED_EVENT_TYPE,
  type AppConnectedPayload,
  type AppFailedPayload,
  type AppInstalledPayload,
  type AppUninstalledPayload,
  type EventDefinition,
} from "@timelish/types";

export const APP_EVENT_DEFINITIONS: Record<string, EventDefinition> = {
  [APP_INSTALLED_EVENT_TYPE]: {
    type: APP_INSTALLED_EVENT_TYPE,
    recordActivity: (envelope) => {
      const payload = envelope.payload as AppInstalledPayload;
      return {
        eventId: envelope.id,
        eventType: envelope.type,
        title: {
          key: "admin.apps.events.installed.title" satisfies BaseAllKeys,
        },
        description: {
          key: "admin.apps.events.installed.description" satisfies BaseAllKeys,
          args: {
            appName: payload.appName,
            t_appDisplayName:
              AvailableApps[payload.appName]?.displayName ?? payload.appName,
          },
        },
        severity: "success",
        source: envelope.source,
        link: "/dashboard/apps",
      };
    },
    dashboardNotification: false,
    emailNotifications: false,
    smsNotifications: false,
  },
  [APP_CONNECTED_EVENT_TYPE]: {
    type: APP_CONNECTED_EVENT_TYPE,
    recordActivity: (envelope) => {
      const payload = envelope.payload as AppConnectedPayload;
      return {
        eventId: envelope.id,
        eventType: envelope.type,
        title: {
          key: "admin.apps.events.connected.title" satisfies BaseAllKeys,
        },
        description: {
          key: "admin.apps.events.connected.description" satisfies BaseAllKeys,
          args: {
            appName: payload.appName,
            t_appDisplayName:
              AvailableApps[payload.appName]?.displayName ?? payload.appName,
          },
        },
        source: envelope.source,
        severity: "success",
        link: "/dashboard/apps",
      };
    },
    dashboardNotification: false,
    emailNotifications: false,
    smsNotifications: false,
  },
  [APP_UNINSTALLED_EVENT_TYPE]: {
    type: APP_UNINSTALLED_EVENT_TYPE,
    recordActivity: (envelope) => {
      const payload = envelope.payload as AppUninstalledPayload;
      return {
        eventId: envelope.id,
        eventType: envelope.type,
        title: {
          key: "admin.apps.events.uninstalled.title" satisfies BaseAllKeys,
        },
        description: {
          key: "admin.apps.events.uninstalled.description" satisfies BaseAllKeys,
          args: {
            appName: payload.appName,
            t_appDisplayName:
              AvailableApps[payload.appName]?.displayName ?? payload.appName,
          },
        },
        source: envelope.source,
        severity: "warning",
        link: "/dashboard/apps",
      };
    },
    dashboardNotification: false,
    emailNotifications: false,
    smsNotifications: false,
  },
  [APP_FAILED_EVENT_TYPE]: {
    type: APP_FAILED_EVENT_TYPE,
    recordActivity: (envelope) => {
      const payload = envelope.payload as AppFailedPayload;
      return {
        eventId: envelope.id,
        eventType: envelope.type,
        title: {
          key: "admin.apps.events.failed.title" satisfies BaseAllKeys,
        },
        description: {
          key: "admin.apps.events.failed.description" satisfies BaseAllKeys,
          args: {
            appName: payload.appName,
            t_appDisplayName:
              AvailableApps[payload.appName]?.displayName ?? payload.appName,
          },
        },
        source: envelope.source,
        severity: "error",
        link: "/dashboard/apps",
      };
    },
    dashboardNotification: async (envelope) => {
      const payload = envelope.payload as AppFailedPayload;
      return {
        type: "app-failed",
        toast: {
          type: "error",
          title: {
            key: "admin.apps.notifications.failed.title" satisfies BaseAllKeys,
          },
          message: {
            key: "admin.apps.notifications.failed.message" satisfies BaseAllKeys,
            args: {
              appName: payload.appName,
              t_appDisplayName:
                AvailableApps[payload.appName]?.displayName ?? payload.appName,
            },
          },
          action: {
            label: {
              key: "admin.apps.notifications.failed.action" satisfies BaseAllKeys,
            },
            href: "/dashboard/apps",
          },
        },
      };
    },
    emailNotifications: false,
    smsNotifications: false,
  },
};
