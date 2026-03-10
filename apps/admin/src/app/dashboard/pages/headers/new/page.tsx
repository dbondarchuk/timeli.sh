import { getServicesContainer } from "@/app/utils";
import PageContainer from "@/components/admin/layout/page-container";
import { PageHeaderForm } from "@/components/admin/pages/headers/form";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import { PageHeaderUpdateModel } from "@timelish/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = PageProps<"/dashboard/pages/headers/new">;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("pages.headers.new"),
  };
}

export default async function NewPageHeaderPage(props: Props) {
  const logger = getLoggerFactory("AdminPageHeaders")("new-page-header");
  const { from: fromParam } = await props.searchParams;
  const from = fromParam as string;

  logger.debug(
    {
      from,
    },
    "Loading new page header creation page",
  );

  let initialData: PageHeaderUpdateModel | undefined = undefined;
  if (from) {
    logger.debug({ from }, "Cloning page header");
    const servicesContainer = await getServicesContainer();
    const pageHeader = await servicesContainer.pagesService.getPageHeader(from);
    if (!pageHeader) {
      logger.warn({ from }, "Source page header not found");
      return notFound();
    }

    const { _id: _, updatedAt: __, ...pageHeaderData } = pageHeader;
    initialData = pageHeaderData;
  }

  logger.debug(
    {
      initialData: !!initialData,
    },
    "New page header creation page loaded",
  );

  return (
    <PageContainer scrollable>
      <PageHeaderForm initialData={initialData} />
    </PageContainer>
  );
}
