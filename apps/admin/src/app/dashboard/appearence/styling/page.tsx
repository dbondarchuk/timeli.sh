import { getServicesContainer } from "@/app/utils";
import PageContainer from "@/components/admin/layout/page-container";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import { Breadcrumbs, Heading } from "@timelish/ui";
import { Metadata } from "next";
import { StylingsConfigurationForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("navigation.styling"),
  };
}

export default async function Page() {
  const logger = getLoggerFactory("AdminPages")("styling");
  const t = await getI18nAsync("admin");
  const servicesContainer = await getServicesContainer();
  logger.debug("Loading styling page");
  const settings =
    await servicesContainer.configurationService.getConfiguration("styling");

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/dashboard" },
    { title: t("navigation.appearance"), link: "/dashboard" },
    {
      title: t("navigation.styling"),
      link: "/dashboard/appearence/styling",
    },
  ];

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <Heading
            title={t("appearance.styling.title")}
            description={t("appearance.styling.description")}
          />
        </div>
        <StylingsConfigurationForm values={settings} />
      </div>
    </PageContainer>
  );
}
