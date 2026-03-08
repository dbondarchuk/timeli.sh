"use client";

import { useI18n } from "@timelish/i18n";
import { DataTableAsyncFilterBox } from "@timelish/ui-admin";
import React, { useCallback } from "react";
import { getDesigns } from "../../actions";
import {
  GiftCardStudioAdminKeys,
  GiftCardStudioAdminNamespace,
  giftCardStudioAdminNamespace,
} from "../../translations/types";

export const DesignsDataTableAsyncFilterBox: React.FC<{
  appId: string;
  filterKey: string;
  filterValue: string[];
  setFilterValue: (v: string[] | null) => void;
}> = ({ appId, filterKey, filterValue, setFilterValue }) => {
  const t = useI18n<GiftCardStudioAdminNamespace, GiftCardStudioAdminKeys>(
    giftCardStudioAdminNamespace,
  );
  const fetchItems = useCallback(
    async (page: number, search?: string) => {
      const limit = 10;
      const res = await getDesigns(appId, {
        limit,
        offset: (page - 1) * limit,
        isPublic: [true, false],
        search,
      });
      return {
        items: (res.items ?? []).map((d) => ({
          value: d._id,
          label: d.name,
          shortLabel: d.name,
        })),
        hasMore: res.total > page * limit,
      };
    },
    [appId],
  );

  return (
    <DataTableAsyncFilterBox
      filterKey={filterKey}
      title={t("purchases.table.filters.design")}
      fetchItems={fetchItems}
      setFilterValue={async (v) => {
        const next = typeof v === "function" ? v(filterValue) : v;
        setFilterValue(next);
        return new URLSearchParams();
      }}
      filterValue={filterValue}
    />
  );
};
