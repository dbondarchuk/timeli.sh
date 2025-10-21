import { AssetsTableColumnsCount } from "@/components/admin/assets/table/columns";
import { AssetsTable } from "@/components/admin/assets/table/table";
import { AssetsTableAction } from "@/components/admin/assets/table/table-action";
import PageContainer from "@/components/admin/layout/page-container";
import {
  assetsSearchParamsCache,
  serializeAssetsSearchParams,
} from "@vivid/api-sdk";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Breadcrumbs, Heading, Link } from "@vivid/ui";
import { DataTableSkeleton } from "@vivid/ui-admin";
import { Upload } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";

type Params = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("assets.title"),
  };
}

export default async function AssetsPage(props: Params) {
  const logger = getLoggerFactory("AdminPages")("assets");
  const t = await getI18nAsync("admin");

  logger.debug("Loading assets page");
  const searchParams = await props.searchParams;
  const parsed = assetsSearchParamsCache.parse(searchParams);
  const key = serializeAssetsSearchParams({ ...parsed });

  const breadcrumbItems = [
    { title: t("assets.dashboard"), link: "/admin/dashboard" },
    { title: t("assets.title"), link: "/admin/dashboard/assets" },
  ];

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center justify-between">
            <Heading title={t("assets.title")} />

            <Link button href={"/admin/dashboard/assets/new"} variant="default">
              <Upload className="mr-2 h-4 w-4" /> {t("assets.addNew")}
            </Link>
          </div>
          {/* <Separator /> */}
        </div>
        <AssetsTableAction showCustomerFilter />
        <Suspense
          key={key}
          fallback={
            <DataTableSkeleton
              columnCount={AssetsTableColumnsCount}
              rowCount={10}
            />
          }
        >
          <AssetsTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
