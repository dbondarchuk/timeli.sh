import PageContainer from "@/components/admin/layout/page-container";
import { PageFootersTableColumnsCount } from "@/components/admin/pages/footers/table/columns";
import { PageFootersTable } from "@/components/admin/pages/footers/table/table";
import { PageFootersTableAction } from "@/components/admin/pages/footers/table/table-action";
import {
  pageFootersSearchParamsCache,
  pageFootersSearchParamsSerializer,
} from "@vivid/api-sdk";
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
    title: t("pages.footers.title"),
  };
}

export default async function PageFootersPage(props: Params) {
  const logger = getLoggerFactory("AdminPages")("footers");
  const t = await getI18nAsync("admin");

  logger.debug("Loading page footers page");
  const searchParams = await props.searchParams;
  const parsed = pageFootersSearchParamsCache.parse(searchParams);

  const key = pageFootersSearchParamsSerializer({ ...parsed });

  const breadcrumbItems = [
    { title: t("assets.dashboard"), link: "/admin/dashboard" },
    { title: t("pages.title"), link: "/admin/dashboard/pages" },
    { title: t("pages.footers.title"), link: "/admin/dashboard/pages/footers" },
  ];

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center justify-between">
            <Heading
              title={t("pages.footers.title")}
              description={t("pages.footers.managePageFooters")}
            />

            <Link
              button
              href={"/admin/dashboard/pages/footers/new"}
              variant="default"
            >
              <Plus className="mr-2 h-4 w-4" /> {t("pages.footers.addNew")}
            </Link>
          </div>
        </div>
        <PageFootersTableAction />
        <Suspense
          key={key}
          fallback={
            <DataTableSkeleton
              columnCount={PageFootersTableColumnsCount}
              rowCount={10}
            />
          }
        >
          <PageFootersTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
