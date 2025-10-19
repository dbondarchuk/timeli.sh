import { ServicesContainer } from "@vivid/services";
import { DataTable } from "@vivid/ui-admin";
import { columns } from "./columns";
import { searchParams, searchParamsCache } from "./search-params";

export const AssetsTable: React.FC<{ customerId?: string }> = async ({
  customerId,
}) => {
  const page = searchParamsCache.get("page");
  const search = searchParamsCache.get("search") || undefined;
  const limit = searchParamsCache.get("limit");
  const sort = searchParamsCache.get("sort");
  const customerIds = searchParamsCache.get("customer") || undefined;

  const offset = (page - 1) * limit;

  const res = await ServicesContainer.AssetsService().getAssets({
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
