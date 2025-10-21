import {
  serviceOptionsSearchParams,
  serviceOptionsSearchParamsCache,
} from "@vivid/api-sdk";
import { ServicesContainer } from "@vivid/services";
import { DataTable } from "@vivid/ui-admin";
import { columns } from "./columns";

export const OptionsTable: React.FC = async () => {
  const page = serviceOptionsSearchParamsCache.get("page");
  const search = serviceOptionsSearchParamsCache.get("search") || undefined;
  const limit = serviceOptionsSearchParamsCache.get("limit");
  const sort = serviceOptionsSearchParamsCache.get("sort");

  const offset = (page - 1) * limit;

  const res = await ServicesContainer.ServicesService().getOptions({
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
      sortSchemaDefault={serviceOptionsSearchParams.sort.defaultValue}
    />
  );
};
