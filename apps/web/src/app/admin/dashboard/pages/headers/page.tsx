import PageContainer from "@/components/admin/layout/page-container";
import { PageHeadersTableColumnsCount } from "@/components/admin/pages/headers/table/columns";
import {
  searchParamsCache,
  serialize,
} from "@/components/admin/pages/headers/table/search-params";
import { PageHeadersTable } from "@/components/admin/pages/headers/table/table";
import { PageHeadersTableAction } from "@/components/admin/pages/headers/table/table-action";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Breadcrumbs, Heading, Link } from "@vivid/ui";
import { DataTableSkeleton } from "@vivid/ui-admin";
import { Plus } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";

type Params = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("pages.headers.title"),
  };
}

export default async function PageHeadersPage(props: Params) {
  const logger = getLoggerFactory("AdminPages")("headers");
  const t = await getI18nAsync("admin");

  logger.debug("Loading page headers page");
  const searchParams = await props.searchParams;
  const parsed = searchParamsCache.parse(searchParams);

  const key = serialize({ ...parsed });

  const breadcrumbItems = [
    { title: t("assets.dashboard"), link: "/admin/dashboard" },
    { title: t("pages.title"), link: "/admin/dashboard/pages" },
    { title: t("pages.headers.title"), link: "/admin/dashboard/pages/headers" },
  ];

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center justify-between">
            <Heading
              title={t("pages.headers.title")}
              description={t("pages.headers.managePageHeaders")}
            />

            <Link
              button
              href={"/admin/dashboard/pages/headers/new"}
              variant="default"
            >
              <Plus className="mr-2 h-4 w-4" /> {t("pages.headers.addNew")}
            </Link>
          </div>
        </div>
        <PageHeadersTableAction />
        <Suspense
          key={key}
          fallback={
            <DataTableSkeleton
              columnCount={PageHeadersTableColumnsCount}
              rowCount={10}
            />
          }
        >
          <PageHeadersTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
