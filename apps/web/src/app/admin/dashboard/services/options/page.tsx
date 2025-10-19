import PageContainer from "@/components/admin/layout/page-container";
import {
  searchParamsCache,
  serialize,
} from "@/components/admin/services/options/table/search-params";
import { OptionsTable } from "@/components/admin/services/options/table/table";
import { OptionsTableAction } from "@/components/admin/services/options/table/table-action";
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
    title: t("services.options.title"),
  };
}

export default async function OptionsPage(props: Params) {
  const logger = getLoggerFactory("AdminPages")("options");
  const t = await getI18nAsync("admin");

  logger.debug("Loading options page");
  const searchParams = await props.searchParams;
  const parsed = searchParamsCache.parse(searchParams);

  const key = serialize({ ...parsed });

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/admin/dashboard" },
    { title: t("navigation.services"), link: "/admin/dashboard/services" },
    {
      title: t("navigation.options"),
      link: "/admin/dashboard/services/options",
    },
  ];

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center justify-between">
            <Heading
              title={t("services.options.title")}
              description={t("services.options.description")}
            />

            <Link
              button
              href={"/admin/dashboard/services/options/new"}
              variant="default"
            >
              <Plus className="mr-2 h-4 w-4" /> {t("services.options.addNew")}
            </Link>
          </div>
          {/* <Separator /> */}
        </div>
        <OptionsTableAction />
        <Suspense
          key={key}
          fallback={<DataTableSkeleton columnCount={4} rowCount={10} />}
        >
          <OptionsTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
