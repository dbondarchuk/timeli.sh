import { ServicesContainer } from "@vivid/services";
import { DataTable } from "@vivid/ui-admin";
import { columns } from "./columns";
import { searchParams, searchParamsCache } from "./search-params";

export const FieldsTable: React.FC = async () => {
  const page = searchParamsCache.get("page");
  const search = searchParamsCache.get("search") || undefined;
  const limit = searchParamsCache.get("limit");
  const type = searchParamsCache.get("type");
  const sort = searchParamsCache.get("sort");

  const offset = (page - 1) * limit;

  const res = await ServicesContainer.ServicesService().getFields(
    {
      type,
      offset,
      limit,
      search,
      sort,
    },
    true,
  );

  return (
    <DataTable
      columns={columns}
      data={res.items}
      totalItems={res.total}
      sortSchemaDefault={searchParams.sort.defaultValue}
    />
  );
};
