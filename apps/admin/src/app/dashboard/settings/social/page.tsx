import { getServicesContainer } from "@/app/utils";
import PageContainer from "@/components/admin/layout/page-container";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Breadcrumbs, Heading } from "@vivid/ui";
import { Metadata } from "next";
import { SocialSettingsForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("settings.social.title"),
  };
}

export default async function Page() {
  const logger = getLoggerFactory("AdminPages")("social");
  const t = await getI18nAsync("admin");

  logger.debug("Loading social page");
  const servicesContainer = await getServicesContainer();
  const settings =
    await servicesContainer.configurationService.getConfiguration("social");

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/dashboard" },
    { title: t("navigation.settings"), link: "/dashboard" },
    { title: t("navigation.social"), link: "/dashboard/settings/social" },
  ];

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <Heading
            title={t("settings.social.title")}
            description={t("settings.social.description")}
          />
        </div>
        <SocialSettingsForm values={settings} />
      </div>
    </PageContainer>
  );
}
