import { getServicesContainer } from "@/app/utils";
import PageContainer from "@/components/admin/layout/page-container";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Breadcrumbs, Heading } from "@vivid/ui";
import { Metadata } from "next";
import { AppointmentsSettingsForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("settings.appointments.title"),
  };
}

export default async function Page() {
  const logger = getLoggerFactory("AdminPages")("appointments");
  const t = await getI18nAsync("admin");

  logger.debug("Loading appointments page");
  const servicesContainer = await getServicesContainer();
  const booking =
    await servicesContainer.configurationService.getConfiguration("booking");

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/dashboard" },
    { title: t("navigation.settings"), link: "/dashboard" },
    {
      title: t("navigation.appointments"),
      link: "/dashboard/settings/appointments",
    },
  ];

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <Heading
            title={t("settings.appointments.title")}
            description={t("settings.appointments.description")}
          />
          {/* <Separator /> */}
        </div>
        <AppointmentsSettingsForm values={booking} />
      </div>
    </PageContainer>
  );
}
