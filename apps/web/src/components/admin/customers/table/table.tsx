import {
  customersSearchParams,
  customersSearchParamsCache,
} from "@vivid/api-sdk";
import { ServicesContainer } from "@vivid/services";
import { DataTable } from "@vivid/ui-admin";
import { columns } from "./columns";

export const CustomersTable: React.FC = async () => {
  const page = customersSearchParamsCache.get("page");
  const search = customersSearchParamsCache.get("search") || undefined;
  const limit = customersSearchParamsCache.get("limit");
  const sort = customersSearchParamsCache.get("sort");

  const offset = (page - 1) * limit;

  const res = await ServicesContainer.CustomersService().getCustomers({
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
      sortSchemaDefault={customersSearchParams.sort.defaultValue}
    />
  );
};
