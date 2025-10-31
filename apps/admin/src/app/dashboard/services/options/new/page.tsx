import { getServicesContainer } from "@/app/utils";
import PageContainer from "@/components/admin/layout/page-container";
import { OptionForm } from "@/components/admin/services/options/form";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { AppointmentOptionUpdateModel } from "@vivid/types";
import { Breadcrumbs, Heading } from "@vivid/ui";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

type Props = PageProps<"/dashboard/services/options/new">;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("services.options.new"),
  };
}

export default async function NewOptionPage(props: Props) {
  const logger = getLoggerFactory("AdminPages")("new-service-option");
  const t = await getI18nAsync("admin");
  const { from: fromParam } = await props.searchParams;
  const from = fromParam as string;

  logger.debug(
    {
      fromOptionId: from,
    },
    "Loading new service option page",
  );

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/dashboard" },
    { title: t("navigation.services"), link: "/dashboard/services" },
    {
      title: t("navigation.options"),
      link: "/dashboard/services/options",
    },
    {
      title: t("services.options.new"),
      link: "/dashboard/services/options/new",
    },
  ];

  let initialData: AppointmentOptionUpdateModel | undefined = undefined;
  if (from) {
    const servicesContainer = await getServicesContainer();
    const result = await servicesContainer.servicesService.getOption(from);
    if (!result) {
      logger.warn(
        { fromOptionId: from },
        "Source option not found for copying",
      );
      notFound();
    }

    const { _id, updatedAt, ...option } = result;
    initialData = option;

    logger.debug(
      {
        fromOptionId: from,
        optionName: result.name,
      },
      "Using source option as template",
    );
  }

  logger.debug(
    {
      fromOptionId: from,
      hasInitialData: !!initialData,
    },
    "New service option page loaded",
  );

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <Heading
            title={t("services.options.newTitle")}
            description={t("services.options.newDescription")}
          />
        </div>
        <OptionForm initialData={initialData} />
      </div>
    </PageContainer>
  );
}
