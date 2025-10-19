import { useQueryStates } from "nuqs";
import React from "react";
import { searchParams } from "./search-params";

import { useI18n } from "@vivid/i18n";
import { WithTotal } from "@vivid/types";
import { toast, useDebounce } from "@vivid/ui";
import { DataTable, DataTableSkeleton } from "@vivid/ui-admin";
import { getFollowUps } from "../actions";
import { FollowUp } from "../models";
import {
  FollowUpsAdminKeys,
  FollowUpsAdminNamespace,
  followUpsAdminNamespace,
} from "../translations/types";
import { columns } from "./columns";

export const FollowUpsTable: React.FC<{ appId: string }> = ({ appId }) => {
  const t = useI18n<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
    followUpsAdminNamespace,
  );
  const [query] = useQueryStates(searchParams);

  const delayedQuery = useDebounce(query, 100);

  const [loading, setLoading] = React.useState(true);
  const [response, setResponse] = React.useState<WithTotal<FollowUp>>({
    items: [],
    total: 0,
  });

  const fn = async (query: typeof delayedQuery) => {
    setLoading(true);

    try {
      const page = query.page;
      const search = query.search || undefined;
      const limit = query.limit;
      const channel = query.channel;
      const sort = query.sort;

      const offset = (page - 1) * limit;

      const res = await getFollowUps(appId, {
        channel,
        offset,
        limit,
        search,
        sort,
      });

      setResponse(res);
    } catch (e: any) {
      console.error(e);
      toast.error(t("statusText.error_loading_follow_ups"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fn(delayedQuery);
  }, [delayedQuery]);

  return loading ? (
    <DataTableSkeleton rowCount={10} columnCount={columns.length} />
  ) : (
    <DataTable
      columns={columns}
      data={response.items}
      totalItems={response.total}
      sortSchemaDefault={searchParams.sort.defaultValue}
    />
  );
};
