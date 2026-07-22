import PageContainer from "@/components/admin/layout/page-container";
import { DashboardTabInjectorApps } from "@timelish/app-store/injectors/dashboard-tab";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import {
  Breadcrumbs,
  ResponsiveTabsList,
  Skeleton,
  TabsContent,
  TabsTrigger,
  TabsViaUrl,
} from "@timelish/ui";
import { Metadata } from "next";
import { Suspense } from "react";
import { getOrganizationId, getServicesContainer } from "../utils";
import { DashboardGreeting } from "./dashboard-greeting";
import { DashboardKpiStrip } from "./dashboard-kpi-strip";
import { getDashboardStats } from "./dashboard-stats";
import { EventsCalendar } from "./events-calendar";
import { NextAppointmentsCards } from "./next-appointments-cards";
import { DashboardNotificationsBadge } from "./notifications-toast-stream";
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

async function DashboardKpiSection() {
  const organizationId = await getOrganizationId();
  const stats = await getDashboardStats(organizationId);
  return <DashboardKpiStrip stats={stats} />;
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

  const dashboardTabAppsMap = dashboardTabApps
    .flatMap(
      (app) =>
        DashboardTabInjectorApps[app.name]?.items?.map((item) => ({
          ...item,
          appId: app._id,
          props: servicesContainer.connectedAppsService.getAppServiceProps(
            app._id,
          ),
          label: t(item.label),
          subtitle: t(item.subtitleKey),
        })) || [],
    )
    .sort((a, b) => b.order - a.order);

  const activeAppTab = dashboardTabAppsMap.find(
    (item) => item.href === activeTab,
  );

  const greetingSubtitle =
    activeTab === "appointments"
      ? tAdmin("dashboard.greeting.subtitlePending")
      : activeAppTab
        ? activeAppTab.subtitle
        : tAdmin("dashboard.greeting.subtitleOverview");

  return (
    <PageContainer scrollable>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="space-y-6 flex-1 pb-8">
        <DashboardGreeting subtitle={greetingSubtitle} />
        <Suspense>
          <TabsViaUrl defaultValue={defaultTab} className="space-y-5">
            <ResponsiveTabsList className="w-full flex flex-row gap-2">
              <TabsTrigger value="overview" className="rounded-full">
                {tAdmin("dashboard.tabs.overview")}
              </TabsTrigger>
              <TabsTrigger value="appointments" className="rounded-full">
                {tAdmin("dashboard.tabs.pendingAppointments")}{" "}
                <DashboardNotificationsBadge
                  notificationsCountKey="pending_appointments"
                  className="ml-1 scale-75 -translate-y-1"
                />
              </TabsTrigger>
              {dashboardTabAppsMap.map((item) => (
                <TabsTrigger
                  value={item.href}
                  key={item.href}
                  className="rounded-full"
                >
                  {item.label}{" "}
                  {item.notificationsCountKey ? (
                    <DashboardNotificationsBadge
                      notificationsCountKey={item.notificationsCountKey}
                      className="ml-1 scale-75 -translate-y-1"
                    />
                  ) : null}
                </TabsTrigger>
              ))}
            </ResponsiveTabsList>
            {activeTab === "overview" && (
              <TabsContent
                value="overview"
                className="space-y-5 @container [contain:layout]"
              >
                <Suspense
                  fallback={
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton
                          className="h-24 w-full rounded-2xl"
                          key={index}
                        />
                      ))}
                    </div>
                  }
                >
                  <DashboardKpiSection />
                </Suspense>
                <div className="flex flex-col-reverse @6xl:flex-row gap-6">
                  <div className="flex flex-col @6xl:flex-1 min-w-0">
                    <EventsCalendar />
                  </div>
                  <div className="@6xl:w-80 @6xl:shrink-0 flex flex-col gap-2">
                    <h2 className="tracking-tight text-base font-medium">
                      {tAdmin("dashboard.appointments.nextAppointments")}
                    </h2>
                    <Suspense
                      key={key}
                      fallback={
                        <>
                          {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton className="w-full h-40" key={index} />
                          ))}
                        </>
                      }
                    >
                      <NextAppointmentsCards className="flex-row @6xl:flex-col flex-wrap gap-2" />
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
