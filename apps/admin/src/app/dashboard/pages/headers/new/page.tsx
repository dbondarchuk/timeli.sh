import PageContainer from "@/components/admin/layout/page-container";
import { PageHeaderForm } from "@/components/admin/pages/headers/form";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("pages.headers.new"),
  };
}

export default async function NewPageHeaderPage() {
  const logger = getLoggerFactory("AdminPageHeaders")("new-page-header");

  logger.debug("Loading new page header creation page");

  return (
    <PageContainer scrollable>
      <PageHeaderForm />
    </PageContainer>
  );
}
