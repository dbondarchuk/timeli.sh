import {
  pageHeadersSearchParams,
  pageHeadersSearchParamsCache,
} from "@vivid/api-sdk";
import { ServicesContainer } from "@vivid/services";
import { DataTable } from "@vivid/ui-admin";
import { columns } from "./columns";

export const PageHeadersTable: React.FC = async () => {
  const page = pageHeadersSearchParamsCache.get("page");
  const search = pageHeadersSearchParamsCache.get("search") || undefined;
  const limit = pageHeadersSearchParamsCache.get("limit");
  const sort = pageHeadersSearchParamsCache.get("sort");

  const offset = (page - 1) * limit;

  const res = await ServicesContainer.PagesService().getPageHeaders({
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
      sortSchemaDefault={pageHeadersSearchParams.sort.defaultValue}
    />
  );
};
