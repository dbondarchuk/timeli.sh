import {
  discountsSearchParams,
  discountsSearchParamsCache,
} from "@vivid/api-sdk";
import { ServicesContainer } from "@vivid/services";
import { DataTable } from "@vivid/ui-admin";
import { columns } from "./columns";

export const DiscountsTable: React.FC = async () => {
  const page = discountsSearchParamsCache.get("page");
  const search = discountsSearchParamsCache.get("search") || undefined;
  const start = discountsSearchParamsCache.get("start") || undefined;
  const end = discountsSearchParamsCache.get("end") || undefined;
  const limit = discountsSearchParamsCache.get("limit");
  const type = discountsSearchParamsCache.get("type");
  const enabled = discountsSearchParamsCache.get("enabled");
  const sort = discountsSearchParamsCache.get("sort");

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
      sortSchemaDefault={discountsSearchParams.sort.defaultValue}
    />
  );
};
