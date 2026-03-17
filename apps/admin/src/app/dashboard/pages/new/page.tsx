import { getServicesContainer, getWebsiteUrl } from "@/app/utils";
import PageContainer from "@/components/admin/layout/page-container";
import { PageForm } from "@/components/admin/pages/form";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import { Styling } from "@timelish/page-builder/reader";
import { PageUpdateModel } from "@timelish/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = PageProps<"/dashboard/pages/new">;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("pages.new"),
  };
}

export default async function NewPagesPage(props: Props) {
  const logger = getLoggerFactory("AdminPages")("new-page");
  const t = await getI18nAsync("admin");
  const { from: fromParam } = await props.searchParams;
  const from = fromParam as string;

  logger.debug(
    {
      from,
    },
    "Loading new page creation page",
  );

  const servicesContainer = await getServicesContainer();
  const websiteUrl = await getWebsiteUrl();
  logger.debug("Loading new page creation page");

  const { styling, general, social } =
    await servicesContainer.configurationService.getConfigurations(
      "styling",
      "general",
      "social",
    );

  const connectedApps =
    await servicesContainer.connectedAppsService.getAppsByScope(
      "ui-components",
    );

  const apps = connectedApps.map((app) => ({
    appId: app._id,
    appName: app.name,
  }));

  let initialData: PageUpdateModel | undefined = undefined;
  if (from) {
    logger.debug({ from }, "Cloning page");
    const page = await servicesContainer.pagesService.getPage(from);
    if (!page) {
      logger.warn({ from }, "Source page not found");
      return notFound();
    }

    logger.debug({ pageId: page._id }, "Source page found");

    const { _id: _, createdAt: __, updatedAt: ___, ...pageData } = page;
    initialData = pageData;
  }

  logger.debug({ apps }, "Connected apps");

  return (
    <PageContainer scrollable>
      <Styling styling={styling} />
      <PageForm
        config={{ general, social }}
        apps={apps}
        websiteUrl={websiteUrl}
        initialData={initialData}
      />
    </PageContainer>
  );
}
