import { getServicesContainer, getWebsiteUrl } from "@/app/utils";
import PageContainer from "@/components/admin/layout/page-container";
import { PageForm } from "@/components/admin/pages/form";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import { Styling } from "@timelish/page-builder/reader";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("pages.new"),
  };
}

export default async function NewPagesPage() {
  const logger = getLoggerFactory("AdminPages")("new-page");
  const t = await getI18nAsync("admin");
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

  logger.debug({ apps }, "Connected apps");

  return (
    <PageContainer scrollable>
      <Styling styling={styling} />
      <PageForm
        config={{ general, social }}
        apps={apps}
        websiteUrl={websiteUrl}
      />
    </PageContainer>
  );
}
