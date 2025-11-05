import PageContainer from "@/components/admin/layout/page-container";

import { getServicesContainer } from "@/app/utils";
import { PageFooterForm } from "@/components/admin/pages/footers/form";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import { Styling } from "@timelish/page-builder/reader";
import { formatArguments } from "@timelish/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

type Props = PageProps<"/dashboard/pages/footers/[id]">;

const getPageFooter = cache(async (id: string) => {
  const servicesContainer = await getServicesContainer();
  return await servicesContainer.pagesService.getPageFooter(id);
});

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  const { id } = await props.params;
  const pageFooter = await getPageFooter(id);
  return {
    title: `${pageFooter?.name} | ${t("pages.footers.title")}`,
  };
}

export default async function EditPageFooterPage(props: Props) {
  const logger = getLoggerFactory("AdminPageFooters")("edit-page-footer");
  const params = await props.params;
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      pageId: params.id,
    },
    "Loading page edit page",
  );

  const pageFooter = await getPageFooter(params.id);

  if (!pageFooter) {
    logger.warn({ pageId: params.id }, "Page footer not found");
    return notFound();
  }

  logger.debug(
    {
      pageFooterId: params.id,
      name: pageFooter.name,
    },
    "Page footer edit page loaded",
  );

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
      <PageFooterForm initialData={pageFooter} args={args} apps={apps} />
    </PageContainer>
  );
}
