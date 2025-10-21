import PageContainer from "@/components/admin/layout/page-container";
import { AddonsTable } from "@/components/admin/services/addons/table/table";
import { AddonsTableAction } from "@/components/admin/services/addons/table/table-action";
import {
  serviceAddonsSearchParamsCache,
  serviceAddonsSearchParamsSerializer,
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
    title: t("services.addons.title"),
  };
}

export default async function AddonsPage(props: Params) {
  const logger = getLoggerFactory("AdminPages")("addons");
  const t = await getI18nAsync("admin");

  logger.debug("Loading addons page");
  const searchParams = await props.searchParams;
  const parsed = serviceAddonsSearchParamsCache.parse(searchParams);
  const key = serviceAddonsSearchParamsSerializer({ ...parsed });

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/admin/dashboard" },
    { title: t("navigation.services"), link: "/admin/dashboard/services" },
    { title: t("navigation.addons"), link: "/admin/dashboard/services/addons" },
  ];

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center justify-between">
            <Heading
              title={t("services.addons.title")}
              description={t("services.addons.description")}
            />

            <Link
              button
              href={"/admin/dashboard/services/addons/new"}
              variant="default"
            >
              <Plus className="mr-2 h-4 w-4" /> {t("services.addons.addNew")}
            </Link>
          </div>
          {/* <Separator /> */}
        </div>
        <AddonsTableAction />
        <Suspense
          key={key}
          fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
        >
          <AddonsTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
