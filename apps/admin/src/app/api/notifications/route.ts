import { getCompanyId, getServicesContainer } from "@/app/utils";
import { BaseAllKeys } from "@vivid/i18n";
import { getLoggerFactory } from "@vivid/logger";
import { getDashboardNotificationRealtimeBroker } from "@vivid/services";
import { DashboardNotification, IDashboardNotifierApp } from "@vivid/types";
import { DateTime } from "luxon";
import { NextRequest } from "next/server";
import { v4 } from "uuid";

const getPendingAppointmentsNotifications = async (date?: Date) => {
  const servicesContainer = await getServicesContainer();
  const { totalCount, newCount } =
    await servicesContainer.eventsService.getPendingAppointmentsCount(
      new Date(),
      date,
    );

  return {
    type: "pending-appointments",
    badges: [
      {
        key: "pending_appointments",
        count: totalCount,
      },
    ],
    toast:
      newCount > 0
        ? {
            type: "info",
            title: {
              key: "admin.dashboard.appointments.pendingToast" satisfies BaseAllKeys,
              args: {
                count: newCount,
              },
            },
            message: {
              key: "admin.dashboard.appointments.pendingToastMessage" satisfies BaseAllKeys,
              args: {
                count: newCount,
              },
            },
            action: {
              label: {
                key: "admin.dashboard.appointments.view" satisfies BaseAllKeys,
              },
              href: `/dashboard?activeTab=appointments&key=${Date.now()}`,
            },
          }
        : undefined,
  } satisfies DashboardNotification;
};

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/notifications")("GET");
  const servicesContainer = await getServicesContainer();
  const companyId = await getCompanyId();

  logger.debug("Starting notifications SSE stream");

  const encoder = new TextEncoder();

  let lastDate: Date | undefined = undefined;
  const paramsDateStr = request.nextUrl.searchParams.get("date");
  if (paramsDateStr) {
    const paramsDate = DateTime.fromISO(paramsDateStr);
    if (paramsDate.isValid) {
      lastDate = paramsDate.toJSDate();
    }
  }

  const fn = async (
    callback: (notifications: DashboardNotification[]) => void,
  ) => {
    logger.debug("Getting pending appointments notifications");
    const count = await getPendingAppointmentsNotifications(lastDate);

    let notifications: DashboardNotification[] = [count];

    logger.debug("Executing dashboard notifier hooks");
    const results = await servicesContainer.connectedAppsService.executeHooks<
      IDashboardNotifierApp,
      DashboardNotification[]
    >(
      "dashboard-notifier",
      async (app, service) => {
        return await service.getInitialNotifications(app, lastDate);
      },
      {
        concurrencyLimit: 10,
        ignoreErrors: true,
      },
    );

    const filteredResults = results
      .filter(Boolean)
      .flat()
      .filter((n) => !!n);
    notifications.push(...filteredResults);

    logger.debug({ notifications }, "Retrieved notifications");

    lastDate = new Date();

    callback(notifications);
  };

  const broker = getDashboardNotificationRealtimeBroker();

  const customReadable = new ReadableStream({
    start: async (controller) => {
      logger.debug("Initializing SSE stream");
      fn((count) => {
        count.forEach((notification) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(notification)}\n\n`),
          );
        });
      });

      const client = {
        id: v4(),
        companyId,
        send: (data: DashboardNotification) => {
          logger.debug({ data }, "Received notification");
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        },
      };

      broker.registerClient(companyId, client);

      request.signal.addEventListener("abort", () => {
        logger.debug("SSE stream aborted by client");
        broker.unregisterClient(companyId, client);
        controller.close();
      });
    },
    cancel: () => {
      logger.debug("SSE stream cancelled");
    },
  });

  return new Response(customReadable, {
    headers: {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
