import PageContainer from "@/components/admin/layout/page-container";
import { DiscountsTableColumnsCount } from "@/components/admin/services/discounts/table/columns";
import { DiscountsTable } from "@/components/admin/services/discounts/table/table";
import { DiscountsTableAction } from "@/components/admin/services/discounts/table/table-action";
import {
  discountsSearchParamsCache,
  discountsSearchParamsSerializer,
} from "@timelish/api-sdk";
import { getI18nAsync } from "@timelish/i18n/server";
import { getLoggerFactory } from "@timelish/logger";
import { Breadcrumbs, Heading, Link } from "@timelish/ui";
import { DataTableSkeleton } from "@timelish/ui-admin";
import { Plus } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";

type Params = PageProps<"/dashboard/services/discounts">;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("services.discounts.title"),
  };
}

export default async function DiscountsPage(props: Params) {
  const logger = getLoggerFactory("AdminPages")("discounts");
  const t = await getI18nAsync("admin");

  logger.debug("Loading discounts page");
  const searchParams = await props.searchParams;
  const parsed = discountsSearchParamsCache.parse(searchParams);
  const key = discountsSearchParamsSerializer({ ...parsed });

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/dashboard" },
    { title: t("navigation.services"), link: "/dashboard/services" },
    {
      title: t("navigation.discounts"),
      link: "/dashboard/services/discounts",
    },
  ];

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center justify-between">
            <Heading
              title={t("services.discounts.title")}
              description={t("services.discounts.description")}
            />

            <Link
              button
              href={"/dashboard/services/discounts/new"}
              variant="default"
            >
              <Plus className="mr-2 h-4 w-4" /> {t("services.discounts.addNew")}
            </Link>
          </div>
          {/* <Separator /> */}
        </div>
        <DiscountsTableAction />
        <Suspense
          key={key}
          fallback={
            <DataTableSkeleton
              columnCount={DiscountsTableColumnsCount}
              rowCount={10}
            />
          }
        >
          <DiscountsTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
