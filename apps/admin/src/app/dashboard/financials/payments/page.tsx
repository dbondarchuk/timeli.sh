import PageContainer from "@/components/admin/layout/page-container";
import { PaymentsTable } from "@/components/admin/payments/table/table";
import { PaymentsTableAction } from "@/components/admin/payments/table/table-action";
import {
  paymentsSearchParamsCache,
  paymentsSearchParamsSerializer,
} from "@timelish/api-sdk";
import { getI18nAsync } from "@timelish/i18n/server";
import { Breadcrumbs, Heading } from "@timelish/ui";
import { DataTableSkeleton } from "@timelish/ui-admin";
import { Metadata } from "next";
import { Suspense } from "react";

type Params = PageProps<"/dashboard/financials/payments">;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  return {
    title: t("paymentsList.title"),
  };
}

export default async function PaymentsPage(props: Params) {
  const t = await getI18nAsync("admin");
  const searchParams = await props.searchParams;
  const parsed = paymentsSearchParamsCache.parse(searchParams);
  const key = paymentsSearchParamsSerializer({ ...parsed });

  const breadcrumbItems = [
    { title: t("navigation.dashboard"), link: "/dashboard" },
    {
      title: t("navigation.financials"),
      link: "/dashboard/financials/payments",
    },
    {
      title: t("navigation.payments"),
      link: "/dashboard/financials/payments",
    },
  ];

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4">
          <Breadcrumbs items={breadcrumbItems} />
          <Heading
            title={t("paymentsList.title")}
            description={t("paymentsList.description")}
          />
        </div>
        <PaymentsTableAction />
        <Suspense
          key={key}
          fallback={<DataTableSkeleton columnCount={8} rowCount={10} />}
        >
          <PaymentsTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
