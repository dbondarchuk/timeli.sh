import { BaseAllKeys } from "@vivid/i18n";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { DashboardNotification, IDashboardNotifierApp } from "@vivid/types";

const NOTIFICATION_INTERVAL = 5000;

const getPendingAppointmentsNotifications = async (date?: Date) => {
  const { totalCount, newCount } =
    await ServicesContainer.EventsService().getPendingAppointmentsCount(
      new Date(),
      date,
    );

  return {
    key: "pending_appointments",
    count: totalCount,
    toast:
      newCount > 0
        ? {
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
              href: `/admin/dashboard?activeTab=appointments&key=${Date.now()}`,
            },
          }
        : undefined,
  } satisfies DashboardNotification;
};

export async function GET() {
  const logger = getLoggerFactory("AdminAPI/notifications")("GET");

  logger.debug("Starting notifications SSE stream");

  const encoder = new TextEncoder();
  let id: any = null;

  let lastDate: Date | undefined = undefined;

  const fn = async (
    callback: (notifications: DashboardNotification[]) => void,
  ) => {
    logger.debug("Getting pending appointments notifications");
    const count = await getPendingAppointmentsNotifications(lastDate);

    let notifications: DashboardNotification[] = [count];

    logger.debug("Executing dashboard notifier hooks");
    const results = await ServicesContainer.ConnectedAppsService().executeHooks<
      IDashboardNotifierApp,
      DashboardNotification[]
    >(
      "dashboard-notifier",
      async (app, service) => {
        return await service.getNotifications(app, lastDate);
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
    id = setTimeout(() => fn(callback), NOTIFICATION_INTERVAL);
  };

  const customReadable = new ReadableStream({
    start: async (controller) => {
      logger.debug("Initializing SSE stream");
      fn((count) =>
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(count)}\n\n`),
        ),
      );
    },
    cancel: () => {
      logger.debug("SSE stream cancelled");
      if (!!id) clearTimeout(id);
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
