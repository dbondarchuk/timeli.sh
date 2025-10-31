import { getServicesContainer } from "@/app/utils";
import PageContainer from "@/components/admin/layout/page-container";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Breadcrumbs, Heading } from "@vivid/ui";
import { DefaultAppsConfigurationForm } from "./form";

export default async function Page() {
  const logger = getLoggerFactory("AdminPages")("default");
  const t = await getI18nAsync("admin");
  const servicesContainer = await getServicesContainer();
  logger.debug("Loading default page");
  const settings =
    await servicesContainer.configurationService.getConfiguration(
      "defaultApps",
    );

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/dashboard" },
    { title: t("navigation.apps"), link: "/dashboard/apps" },
    { title: t("apps.defaultApps"), link: "/dashboard/apps/default" },
  ];

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <Heading
            title={t("apps.defaultApps")}
            description={t("apps.defaultAppsDescription")}
          />
        </div>
        <DefaultAppsConfigurationForm values={settings} />
      </div>
    </PageContainer>
  );
}
