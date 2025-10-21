import { AppointmentsTableColumnsCount } from "@/components/admin/appointments/table/columns";
import { AppointmentsTable } from "@/components/admin/appointments/table/table";
import { AppointmentsTableAction } from "@/components/admin/appointments/table/table-action";
import { CommunicationLogsTableAction } from "@/components/admin/communication-logs/table/table-action";
import { CustomerForm } from "@/components/admin/customers/form";
import PageContainer from "@/components/admin/layout/page-container";
import {
  appointmentsSearchParamsCache,
  assetsSearchParamsCache,
  communicationLogsSearchParamsCache,
  serializeAppointmentsSearchParams,
  serializeAssetsSearchParams,
  serializeCommunicationLogsSearchParams,
} from "@vivid/api-sdk";
import { getI18nAsync } from "@vivid/i18n/server";
import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import {
  Breadcrumbs,
  Heading,
  Link,
  Tabs,
  TabsContent,
  TabsLinkTrigger,
  TabsList,
} from "@vivid/ui";
import { DataTableSkeleton } from "@vivid/ui-admin";
import {
  RecentCommunications,
  SendCommunicationButton,
} from "@vivid/ui-admin-kit";
import { CalendarClock } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import {
  CustomerFiles,
  CustomerFilesTableAction,
  CustomerFileUpload,
} from "./files";

type Props = {
  params: Promise<{ id: string; tab: string }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const detailsTab = "details";
const appointmentsTab = "appointments";
const filesTab = "files";
const communicationsTab = "communications";

const tabs = [
  detailsTab,
  appointmentsTab,
  filesTab,
  communicationsTab,
] as const;

const scrollableTabs = [detailsTab, communicationsTab, filesTab];

type Tab = (typeof tabs)[number];

const getCustomer = cache(async (id: string) => {
  return await ServicesContainer.CustomersService().getCustomer(id);
});

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = await getI18nAsync("admin");
  const { id } = await props.params;
  const customer = await getCustomer(id);
  return {
    title: `${customer?.name} | ${t("customers.title")}`,
  };
}

export default async function CustomerPage(props: Props) {
  const logger = getLoggerFactory("AdminPages")("customer-detail");
  const t = await getI18nAsync("admin");
  const params = await props.params;
  const path = `/admin/dashboard/customers/${params.id}`;

  const activeTab = params.tab as Tab;
  if (!tabs.includes(activeTab)) {
    logger.warn(
      {
        customerId: params.id,
        invalidTab: params.tab,
        validTabs: tabs,
      },
      "Invalid tab requested",
    );
    notFound();
  }

  const searchParams = await props.searchParams;

  let key: string = "";
  if (activeTab === appointmentsTab) {
    const parsed = appointmentsSearchParamsCache.parse(searchParams);
    key = serializeAppointmentsSearchParams({ ...parsed });
  } else if (activeTab === filesTab) {
    const parsed = assetsSearchParamsCache.parse(searchParams);
    key = serializeAssetsSearchParams({ ...parsed });
  } else if (activeTab === communicationsTab) {
    const parsed = communicationLogsSearchParamsCache.parse(searchParams);
    key = serializeCommunicationLogsSearchParams({ ...parsed });
  }

  if (searchParams.key) {
    key = searchParams.key as string;
  }

  logger.debug(
    {
      customerId: params.id,
      activeTab,
      key,
    },
    "Loading customer detail page",
  );

  const customer = await getCustomer(params.id);

  if (!customer) {
    logger.warn({ customerId: params.id }, "Customer not found");
    return notFound();
  }

  logger.debug(
    {
      customerId: params.id,
      customerName: customer.name,
      customerEmail: customer.email,
      activeTab,
    },
    "Customer detail page loaded",
  );

  const tabTitle: Record<Tab, string> = {
    [detailsTab]: t("customers.details"),
    [appointmentsTab]: t("customers.appointments"),
    [filesTab]: t("customers.files"),
    [communicationsTab]: t("customers.communications"),
  };

  const breadcrumbItems = [
    { title: t("assets.dashboard"), link: "/admin/dashboard" },
    { title: t("customers.title"), link: "/admin/dashboard/customers" },
    {
      title: customer.name,
      link: `/admin/dashboard/customers/${params.id}`,
    },
  ];

  return (
    <PageContainer scrollable={scrollableTabs.includes(activeTab)}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <Heading
            title={customer.name}
            description={t("customers.manageCustomer")}
          />

          {/* <Separator /> */}
        </div>
        <div className="flex flex-col gap-4 flex-1">
          <Tabs value={activeTab} className="flex-1 flex flex-col gap-4">
            <TabsList className="w-full [&>a]:flex-1 bg-card border flex-wrap h-auto">
              {tabs.map((t) => (
                <TabsLinkTrigger value={t} usePath={path} key={t}>
                  {tabTitle[t]}
                </TabsLinkTrigger>
              ))}
            </TabsList>
            <TabsContent value={detailsTab}>
              {activeTab === detailsTab && (
                <CustomerForm initialData={customer} />
              )}
            </TabsContent>
            {activeTab === appointmentsTab && (
              <TabsContent
                value={appointmentsTab}
                className="flex flex-1 flex-col gap-4"
              >
                <div className="flex flex-col md:flex-row gap-2 w-full">
                  <AppointmentsTableAction className="flex-1" />
                  <Link
                    button
                    href={`/admin/dashboard/appointments/new?customer=${params.id}`}
                    variant="default"
                  >
                    <CalendarClock className="mr-2 h-4 w-4" />{" "}
                    <span className="max-md:hidden">
                      {t("customers.scheduleAppointment")}
                    </span>
                    <span className="md:hidden">
                      {t("customers.addNewShort")}
                    </span>
                  </Link>
                </div>
                <Suspense
                  key={key}
                  fallback={
                    <DataTableSkeleton
                      columnCount={AppointmentsTableColumnsCount}
                      rowCount={10}
                    />
                  }
                >
                  <AppointmentsTable customerId={params.id} />
                </Suspense>
              </TabsContent>
            )}
            {activeTab === filesTab && (
              <TabsContent
                value={filesTab}
                className="flex flex-1 flex-col gap-4"
              >
                <div className="flex flex-col md:flex-row gap-2 w-full">
                  <CustomerFilesTableAction />
                  <CustomerFileUpload customerId={params.id} />
                </div>
                <Suspense
                  key={key}
                  fallback={
                    <DataTableSkeleton columnCount={10} rowCount={10} />
                  }
                >
                  <CustomerFiles
                    customerId={params.id}
                    search={serializeAssetsSearchParams({
                      search: assetsSearchParamsCache.get("search"),
                    })}
                  />
                </Suspense>
              </TabsContent>
            )}
            {activeTab === communicationsTab && (
              <TabsContent
                value={communicationsTab}
                className="flex flex-1 flex-col gap-4"
              >
                <div className="flex flex-col md:flex-row gap-2 w-full">
                  <CommunicationLogsTableAction className="flex-1" />
                  <SendCommunicationButton customerId={params.id} />
                </div>
                <Suspense
                  key={key}
                  fallback={
                    <DataTableSkeleton columnCount={10} rowCount={10} />
                  }
                >
                  <RecentCommunications customerId={params.id} />
                </Suspense>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
