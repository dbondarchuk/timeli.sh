import { getServicesContainer } from "@/app/utils";
import PageContainer from "@/components/admin/layout/page-container";
import { AvailableApps } from "@timelish/app-store";
import { AppMenuItems } from "@timelish/app-store/menu-items";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import { Breadcrumbs, Heading } from "@timelish/ui";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cache } from "react";

type Props = PageProps<"/dashboard/[...slug]">;

const getAppPage = cache(async (path: string) => {
  const logger = getLoggerFactory("AdminDashboardPage")("getAppPage");
  const tAdmin = await getI18nAsync("admin");
  const t = await getI18nAsync();
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      slug: path,
    },
    "Processing dashboard page request",
  );

  const app = Object.entries(AppMenuItems)
    .map(([appName, menuItems]) => ({
      app: AvailableApps[appName],
      menuItems,
    }))
    .find(
      ({ app, menuItems }) =>
        app.type === "complex" &&
        menuItems?.some(({ href }) => href.toLocaleLowerCase() === path),
    );

  if (!app) {
    logger.warn({ path }, "No app found for path");
    redirect("/dashboard");
  }

  const appId = (
    await servicesContainer.connectedAppsService.getAppsByApp(app.app.name)
  )[0]?._id;
  if (!appId) {
    logger.warn({ appId }, "No app ID found for app");
    redirect("/dashboard");
  }

  const menuItem = app.menuItems?.find(
    ({ href }) => href.toLocaleLowerCase() === path,
  );

  if (!menuItem) {
    logger.warn({ path }, "No menu item found for path");
    redirect("/dashboard");
  }

  const breadcrumbItems = [
    { title: tAdmin("navigation.dashboard"), link: "/dashboard" },
    { title: tAdmin("navigation.apps"), link: "/dashboard/apps" },
    ...(menuItem.pageBreadcrumbs?.map((b) => ({
      ...b,
      title: t(b.title, { appName: t(app.app.displayName) }),
    })) || [
      {
        title: t(menuItem.pageTitle || app.app.displayName, {
          appName: t(app.app.displayName),
        }),
        link: `/dashboard/${path}`,
      },
    ]),
  ];

  return {
    title: t(menuItem.pageTitle || app.app.displayName),
    description: t(
      menuItem.pageDescription || "apps.common.defaultDescription",
      {
        appName: t(app.app.displayName),
      },
    ),
    breadcrumbItems,
    appId,
    menuItem,
    app,
  };
});

const getSlug = cache(async (props: Props) => {
  const { slug } = await props.params;
  return slug?.join("/").toLocaleLowerCase() || "/";
});

export async function generateMetadata(props: Props): Promise<Metadata> {
  const path = await getSlug(props);
  const appPage = await getAppPage(path);
  return {
    title: appPage.title,
    description: appPage.description,
  };
}

export default async function Page(props: Props) {
  const logger = getLoggerFactory("AdminDashboardPage")("Page");
  const path = await getSlug(props);
  const searchParams = await props.searchParams;

  logger.debug(
    {
      slug: path,
      searchParams: searchParams,
    },
    "Processing dashboard page request",
  );

  const { menuItem, breadcrumbItems, appId, title, description } =
    await getAppPage(path);

  return (
    <PageContainer scrollable={!menuItem.notScrollable}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          {!menuItem.hideHeading && (
            <Heading title={title} description={description} />
          )}
          {/* <Separator /> */}
        </div>
        <menuItem.Page appId={appId} />
      </div>
    </PageContainer>
  );
}
