import { getServicesContainer } from "@/app/utils";
import {
  appointmentsSearchParams,
  appointmentsSearchParamsCache,
} from "@timelish/api-sdk";
import { DataTable } from "@timelish/ui-admin";
import { columns } from "./columns";

export const AppointmentsTable: React.FC<{ customerId?: string }> = async ({
  customerId,
}) => {
  const page = appointmentsSearchParamsCache.get("page");
  const search = appointmentsSearchParamsCache.get("search") || undefined;
  const limit = appointmentsSearchParamsCache.get("limit");
  const status = appointmentsSearchParamsCache.get("status");
  const start = appointmentsSearchParamsCache.get("start") || undefined;
  const end = appointmentsSearchParamsCache.get("end") || undefined;
  const sort = appointmentsSearchParamsCache.get("sort");

  const customerIds = appointmentsSearchParamsCache.get("customer");
  const discountIds = appointmentsSearchParamsCache.get("discount");

  const offset = (page - 1) * limit;

  const servicesContainer = await getServicesContainer();
  const res = await servicesContainer.eventsService.getAppointments({
    range: { start, end },
    status,
    offset,
    limit,
    search,
    sort,
    customerId: customerId ?? customerIds ?? undefined,
    discountId: discountIds ?? undefined,
  });

  return (
    <DataTable
      columns={columns}
      data={res.items}
      totalItems={res.total}
      sortSchemaDefault={appointmentsSearchParams.sort.defaultValue}
    />
  );
};
