import { AppointmentsTableColumnsCount } from "@/components/admin/appointments/table/columns";
import { AppointmentsTable } from "@/components/admin/appointments/table/table";
import { AppointmentsTableAction } from "@/components/admin/appointments/table/table-action";
import PageContainer from "@/components/admin/layout/page-container";
import {
  appointmentsSearchParamsCache,
  serializeAppointmentsSearchParams,
} from "@timelish/api-sdk";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import { Breadcrumbs, Heading, Link } from "@timelish/ui";
import { DataTableSkeleton } from "@timelish/ui-admin";
import { CalendarClock } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";

type Params = PageProps<"/dashboard/appointments">;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("navigation.appointments"),
  };
}

export default async function AppointmentsPage(props: Params) {
  const logger = getLoggerFactory("AdminPages")("appointments");
  const t = await getI18nAsync("admin");
  const searchParams = await props.searchParams;
  const parsed = appointmentsSearchParamsCache.parse(searchParams);
  const key = serializeAppointmentsSearchParams({ ...parsed });

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/dashboard" },
    {
      title: t("navigation.appointments"),
      link: "/dashboard/appointments",
    },
  ];

  logger.debug(
    {
      searchParams: parsed,
      key,
    },
    "Loading appointments page",
  );

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-2 justify-between">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="flex items-center justify-between">
              <Heading title={t("appointments.title")} />

              <Link
                button
                href={"/dashboard/appointments/new"}
                variant="default"
              >
                <CalendarClock className="mr-2 h-4 w-4" />{" "}
                <span className="max-md:hidden">
                  {t("appointments.scheduleAppointment")}
                </span>
                <span className="md:hidden">{t("appointments.addNew")}</span>
              </Link>
            </div>
          </div>
        </div>
        <AppointmentsTableAction showCustomerFilter />
        <Suspense
          key={key}
          fallback={
            <DataTableSkeleton
              columnCount={AppointmentsTableColumnsCount}
              rowCount={10}
            />
          }
        >
          <AppointmentsTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
