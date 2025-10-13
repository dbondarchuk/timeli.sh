import PageContainer from "@/components/admin/layout/page-container";

import { PageFooterForm } from "@/components/admin/pages/footers/form";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Styling } from "@vivid/page-builder/reader";
import { ServicesContainer } from "@vivid/services";
import { formatArguments } from "@vivid/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

const getPageFooter = cache(async (id: string) => {
  return await ServicesContainer.PagesService().getPageFooter(id);
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
    await ServicesContainer.ConfigurationService().getConfigurations(
      "general",
      "social",
      "styling",
    );
  const connectedApps =
    await ServicesContainer.ConnectedAppsService().getAppsByScope(
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
