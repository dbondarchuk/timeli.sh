import { useI18n } from "@vivid/i18n";
import { useQueryStates } from "nuqs";
import React from "react";
import { searchParams } from "./search-params";

import { WithTotal } from "@vivid/types";
import { toast, useDebounce } from "@vivid/ui";
import { DataTable, DataTableSkeleton } from "@vivid/ui-admin";
import { getReminders } from "../actions";
import { Reminder } from "../models";
import {
  RemindersAdminKeys,
  RemindersAdminNamespace,
  remindersAdminNamespace,
} from "../translations/types";
import { columns } from "./columns";

export const RemindersTable: React.FC<{ appId: string }> = ({ appId }) => {
  const [query] = useQueryStates(searchParams);
  const t = useI18n<RemindersAdminNamespace, RemindersAdminKeys>(
    remindersAdminNamespace,
  );

  const delayedQuery = useDebounce(query, 100);

  const [loading, setLoading] = React.useState(true);
  const [response, setResponse] = React.useState<WithTotal<Reminder>>({
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

      const res = await getReminders(appId, {
        channel,
        offset,
        limit,
        search,
        sort,
      });

      setResponse(res);
    } catch (e: any) {
      console.error(e);
      toast.error(t("statusText.error_loading_reminders"));
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
