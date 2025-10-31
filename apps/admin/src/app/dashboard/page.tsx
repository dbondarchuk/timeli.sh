import PageContainer from "@/components/admin/layout/page-container";
import { DashboardTabInjectorApps } from "@vivid/app-store/injectors/dashboard-tab";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import {
  Breadcrumbs,
  Skeleton,
  TabsContent,
  TabsLinkTrigger,
  TabsList,
  TabsViaUrl,
} from "@vivid/ui";
import { Metadata } from "next";
import { Suspense } from "react";
import { getServicesContainer } from "../utils";
import { EventsCalendar } from "./events-calendar";
import { NextAppointmentsCards } from "./next-appointments-cards";
import {
  DashboardTabNotificationsBadge,
  PendingAppointmentsBadge,
} from "./notifications-toast-stream";
import { PendingAppointmentsTab } from "./pending-appointments-tab";

type Params = {
  searchParams: Promise<{ activeTab?: string; key?: string }>;
};

const defaultTab = "overview";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("navigation.dashboard"),
  };
}

export default async function Page(params: Params) {
  const servicesContainer = await getServicesContainer();

  const logger = getLoggerFactory("AdminPages")("dashboard");
  const searchParams = await params.searchParams;
  const { activeTab = defaultTab, key } = searchParams;
  const tAdmin = await getI18nAsync("admin");
  const t = await getI18nAsync();
  const breadcrumbItems = [
    { title: tAdmin("navigation.dashboard"), link: "/dashboard" },
  ];

  logger.debug(
    {
      activeTab,
      key,
    },
    "Loading dashboard page",
  );

  const dashboardTabApps =
    await servicesContainer.connectedAppsService.getAppsByScope(
      "dashboard-tab",
    );

  const dashboardTabAppsMap = dashboardTabApps.flatMap(
    (app) =>
      DashboardTabInjectorApps[app.name]?.items?.map((item) => ({
        ...item,
        appId: app._id,
        props: servicesContainer.connectedAppsService.getAppServiceProps(
          app._id,
        ),
        label: t(item.label),
      })) || [],
  );

  return (
    <PageContainer scrollable>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between space-y-2">
          <Suspense fallback={<Skeleton className="w-32 h-10" />}>
            <h2 className="text-2xl font-bold tracking-tight">
              {
                (
                  await servicesContainer.configurationService.getConfiguration(
                    "general",
                  )
                ).name
              }
            </h2>
          </Suspense>
        </div>
        <Suspense>
          <TabsViaUrl defaultValue={defaultTab} className="space-y-4">
            <TabsList className="w-full flex flex-col h-auto md:flex-row gap-2">
              <TabsLinkTrigger value="overview">
                {tAdmin("dashboard.tabs.overview")}
              </TabsLinkTrigger>
              <TabsLinkTrigger value="appointments">
                {tAdmin("dashboard.tabs.pendingAppointments")}{" "}
                <PendingAppointmentsBadge />
              </TabsLinkTrigger>
              {dashboardTabAppsMap.map((item) => (
                <TabsLinkTrigger value={item.href} key={item.href}>
                  {item.label}{" "}
                  {item.notificationsCountKey ? (
                    <DashboardTabNotificationsBadge
                      notificationsCountKey={item.notificationsCountKey}
                    />
                  ) : null}
                </TabsLinkTrigger>
              ))}
            </TabsList>
            {activeTab === "overview" && (
              <TabsContent
                value="overview"
                className="space-y-4 @container [contain:layout]"
              >
                <div className="flex flex-col-reverse @6xl:flex-row gap-8">
                  <div className="flex flex-col @6xl:basis-2/3 flex-shrink">
                    <EventsCalendar />
                  </div>
                  <div className="@lg:basis-1/3 flex flex-col gap-2 ">
                    <h2 className="tracking-tight text-lg font-medium">
                      {tAdmin("dashboard.appointments.nextAppointments")}
                    </h2>
                    <Suspense
                      key={key}
                      fallback={
                        <>
                          {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton className="w-full h-72" key={index} />
                          ))}
                        </>
                      }
                    >
                      <NextAppointmentsCards />
                    </Suspense>
                  </div>
                </div>
              </TabsContent>
            )}
            {activeTab === "appointments" && (
              <TabsContent value="appointments" className="space-y-4 flex-1">
                <Suspense
                  key={key}
                  fallback={
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton className="w-full h-72" key={index} />
                      ))}
                    </div>
                  }
                >
                  <PendingAppointmentsTab />
                </Suspense>
              </TabsContent>
            )}
            {dashboardTabAppsMap
              .filter((item) => item.href === activeTab)
              .map((item) => (
                <TabsContent
                  value={item.href}
                  className="space-y-4 flex-1"
                  key={item.href}
                >
                  <Suspense
                    key={key}
                    fallback={<Skeleton className="w-full h-72" />}
                  >
                    <item.view
                      appId={item.appId}
                      props={item.props}
                      searchParams={searchParams}
                    />
                  </Suspense>
                </TabsContent>
              ))}
          </TabsViaUrl>
        </Suspense>
      </div>
    </PageContainer>
  );
}
