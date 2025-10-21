import {
  pageFootersSearchParams,
  pageFootersSearchParamsCache,
} from "@vivid/api-sdk";
import { ServicesContainer } from "@vivid/services";
import { DataTable } from "@vivid/ui-admin";
import { columns } from "./columns";

export const PageFootersTable: React.FC = async () => {
  const page = pageFootersSearchParamsCache.get("page");
  const search = pageFootersSearchParamsCache.get("search") || undefined;
  const limit = pageFootersSearchParamsCache.get("limit");
  const sort = pageFootersSearchParamsCache.get("sort");

  const offset = (page - 1) * limit;

  const res = await ServicesContainer.PagesService().getPageFooters({
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
      sortSchemaDefault={pageFootersSearchParams.sort.defaultValue}
    />
  );
};
