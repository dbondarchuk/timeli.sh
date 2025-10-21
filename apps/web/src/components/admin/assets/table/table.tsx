import { assetsSearchParams, assetsSearchParamsCache } from "@vivid/api-sdk";
import { ServicesContainer } from "@vivid/services";
import { DataTable } from "@vivid/ui-admin";
import { columns } from "./columns";

export const AssetsTable: React.FC<{ customerId?: string }> = async ({
  customerId,
}) => {
  const page = assetsSearchParamsCache.get("page");
  const search = assetsSearchParamsCache.get("search") || undefined;
  const limit = assetsSearchParamsCache.get("limit");
  const sort = assetsSearchParamsCache.get("sort");
  const customerIds = assetsSearchParamsCache.get("customerId") || undefined;

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
      sortSchemaDefault={assetsSearchParams.sort.defaultValue}
    />
  );
};
