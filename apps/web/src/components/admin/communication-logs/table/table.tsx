import { ServicesContainer } from "@vivid/services";
import { DataTable } from "@vivid/ui-admin";
import { columns } from "./columns";
import { searchParams, searchParamsCache } from "./search-params";

export const CommunicationLogsTable: React.FC<{
  customerId?: string;
}> = async ({ customerId }) => {
  const page = searchParamsCache.get("page");
  const search = searchParamsCache.get("search") || undefined;
  const limit = searchParamsCache.get("limit");
  const direction = searchParamsCache.get("direction");
  const participantType = searchParamsCache.get("participantType");
  const channel = searchParamsCache.get("channel");
  const start = searchParamsCache.get("start") || undefined;
  const end = searchParamsCache.get("end") || undefined;
  const sort = searchParamsCache.get("sort");
  const customerIds = searchParamsCache.get("customer") || undefined;

  const offset = (page - 1) * limit;

  const res =
    await ServicesContainer.CommunicationLogsService().getCommunicationLogs({
      range: { start, end },
      channel,
      direction,
      participantType,
      offset,
      limit,
      search,
      sort,
      customerId: customerId ?? customerIds,
    });

  return (
    <DataTable
      columns={columns}
      data={res.items}
      totalItems={res.total}
      sortSchemaDefault={searchParams.sort.defaultValue}
    />
  );
};
