import PageContainer from "@/components/admin/layout/page-container";
import { PageForm } from "../../../../../components/admin/pages/form";

import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Styling } from "@vivid/page-builder/reader";
import { ServicesContainer } from "@vivid/services";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

const getPage = cache(async (id: string) => {
  return await ServicesContainer.PagesService().getPage(id);
});

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  const { id } = await props.params;
  const page = await getPage(id);
  return {
    title: `${page?.title} | ${t("pages.title")}`,
  };
}

export default async function EditPagesPage(props: Props) {
  const logger = getLoggerFactory("AdminPages")("edit-page");
  const t = await getI18nAsync("admin");
  const params = await props.params;

  logger.debug(
    {
      pageId: params.id,
    },
    "Loading page edit page",
  );

  const page = await getPage(params.id);
  const { styling, general, social } =
    await ServicesContainer.ConfigurationService().getConfigurations(
      "styling",
      "general",
      "social",
    );

  if (!page) {
    logger.warn({ pageId: params.id }, "Page not found");
    return notFound();
  }

  const connectedApps =
    await ServicesContainer.ConnectedAppsService().getAppsByScope(
      "ui-components",
    );

  const apps = connectedApps.map((app) => ({
    appId: app._id,
    appName: app.name,
  }));

  logger.debug({ apps }, "Connected apps");

  logger.debug(
    {
      pageId: params.id,
      pageSlug: page.slug,
      pageTitle: page.title,
      isPublished: page.published,
    },
    "Page edit page loaded",
  );

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col gap-4">
        <Styling styling={styling} />
        <PageForm initialData={page} config={{ general, social }} apps={apps} />
      </div>
    </PageContainer>
  );
}
