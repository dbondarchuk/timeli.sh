import { ServicesContainer } from "@vivid/services";
import { DataTable } from "@vivid/ui-admin";
import { columns } from "./columns";
import { searchParams, searchParamsCache } from "./search-params";

export const DiscountsTable: React.FC = async () => {
  const page = searchParamsCache.get("page");
  const search = searchParamsCache.get("search") || undefined;
  const start = searchParamsCache.get("start") || undefined;
  const end = searchParamsCache.get("end") || undefined;
  const limit = searchParamsCache.get("limit");
  const type = searchParamsCache.get("type");
  const enabled = searchParamsCache.get("enabled");
  const sort = searchParamsCache.get("sort");

  const offset = (page - 1) * limit;

  const res = await ServicesContainer.ServicesService().getDiscounts({
    type,
    enabled,
    range: { start, end },
    offset,
    limit,
    search,
    sort,
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
