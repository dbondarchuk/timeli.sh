import { ServicesContainer } from "@vivid/services";
import { DataTable } from "@vivid/ui-admin";
import { columns } from "./columns";
import { searchParams, searchParamsCache } from "./search-params";

export const TemplatesTable: React.FC = async () => {
  const page = searchParamsCache.get("page");
  const search = searchParamsCache.get("search") || undefined;
  const limit = searchParamsCache.get("limit");
  const sort = searchParamsCache.get("sort");
  const type = searchParamsCache.get("type");

  const offset = (page - 1) * limit;

  const res = await ServicesContainer.TemplatesService().getTemplates({
    offset,
    limit,
    search,
    sort,
    type,
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
