import { CustomersTableColumnLength } from "@/components/admin/customers/table/columns";
import { CustomersTable } from "@/components/admin/customers/table/table";
import { CustomersTableAction } from "@/components/admin/customers/table/table-action";
import PageContainer from "@/components/admin/layout/page-container";
import {
  customersSearchParamsCache,
  customersSearchParamsSerializer,
} from "@vivid/api-sdk";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { Breadcrumbs, Heading, Link } from "@vivid/ui";
import { DataTableSkeleton } from "@vivid/ui-admin";
import { Plus } from "lucide-react";
import { Metadata } from "next/types";
import { Suspense } from "react";

type Params = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("customers.title"),
  };
}

export default async function CustomersPage(props: Params) {
  const logger = getLoggerFactory("AdminPages")("customers");
  const t = await getI18nAsync("admin");
  const searchParams = await props.searchParams;
  const parsed = customersSearchParamsCache.parse(searchParams);
  const key = customersSearchParamsSerializer({ ...parsed });

  logger.debug(
    {
      searchParams: parsed,
      key,
    },
    "Loading customers page",
  );

  const breadcrumbItems = [
    { title: t("assets.dashboard"), link: "/admin/dashboard" },
    { title: t("customers.title"), link: "/admin/dashboard/customers" },
  ];

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center justify-between">
            <Heading
              title={t("customers.title")}
              description={t("customers.manageCustomers")}
            />

            <Link
              button
              href={"/admin/dashboard/customers/new"}
              variant="default"
            >
              <Plus className="mr-2 h-4 w-4" /> {t("customers.addNew")}
            </Link>
          </div>
          {/* <Separator /> */}
        </div>
        <CustomersTableAction />
        <Suspense
          key={key}
          fallback={
            <DataTableSkeleton
              columnCount={CustomersTableColumnLength}
              rowCount={10}
            />
          }
        >
          <CustomersTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
