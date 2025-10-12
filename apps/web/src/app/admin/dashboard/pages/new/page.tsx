import PageContainer from "@/components/admin/layout/page-container";
import { PageForm } from "@/components/admin/pages/form";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Styling } from "@vivid/page-builder/reader";
import { ServicesContainer } from "@vivid/services";
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

  logger.debug("Loading new page creation page");

  const { styling, general, social } =
    await ServicesContainer.ConfigurationService().getConfigurations(
      "styling",
      "general",
      "social",
    );

  return (
    <PageContainer scrollable>
      <Styling styling={styling} />
      <PageForm config={{ general, social }} />
    </PageContainer>
  );
}
