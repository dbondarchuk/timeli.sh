import { getServicesContainer } from "@/app/utils";
import PageContainer from "@/components/admin/layout/page-container";
import { PageFooterForm } from "@/components/admin/pages/footers/form";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Styling } from "@vivid/page-builder/reader";
import { formatArguments } from "@vivid/utils";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("pages.footers.new"),
  };
}

export default async function NewPageFooterPage() {
  const logger = getLoggerFactory("AdminPageFooters")("new-page-footer");
  const servicesContainer = await getServicesContainer();
  logger.debug("Loading new page footer creation page");

  const { general, social, styling } =
    await servicesContainer.configurationService.getConfigurations(
      "general",
      "social",
      "styling",
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

  const args = formatArguments(
    {
      general,
      social,
      now: new Date(),
    },
    general.language,
  );

  return (
    <PageContainer scrollable>
      <Styling styling={styling} />
      <PageFooterForm args={args} apps={apps} />
    </PageContainer>
  );
}
