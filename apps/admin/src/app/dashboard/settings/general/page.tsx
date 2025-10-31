import { getServicesContainer } from "@/app/utils";
import PageContainer from "@/components/admin/layout/page-container";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Breadcrumbs, Heading } from "@vivid/ui";
import { Metadata } from "next";
import { GeneralSettingsForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("settings.general.title"),
  };
}

export default async function Page() {
  const logger = getLoggerFactory("AdminPages")("general");
  const t = await getI18nAsync("admin");

  logger.debug("Loading general page");
  const servicesContainer = await getServicesContainer();
  const settings =
    await servicesContainer.configurationService.getConfiguration("general");

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/dashboard" },
    { title: t("navigation.settings"), link: "/dashboard" },
    {
      title: t("navigation.general"),
      link: "/dashboard/settings/general",
    },
  ];

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <Heading
            title={t("settings.general.title")}
            description={t("settings.general.description")}
          />
          {/* <Separator /> */}
        </div>
        <GeneralSettingsForm values={settings} />
      </div>
    </PageContainer>
  );
}
