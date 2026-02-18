"use client";

import { useI18n } from "@timelish/i18n";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@timelish/ui";
import {
  DataTableResetFilter,
  DataTableSearch,
  useSelectedRowsStore,
} from "@timelish/ui-admin";
import { Settings2 } from "lucide-react";
import React from "react";
import {
  BlogAdminKeys,
  BlogAdminNamespace,
  blogAdminNamespace,
} from "../translations/types";
import { DeleteSelectedBlogPostsButton } from "./delete-selected";
import { useBlogTableFilters } from "./use-table-filters";

export const BlogTableAction: React.FC<{ appId: string }> = ({ appId }) => {
  const { rowSelection } = useSelectedRowsStore();
  const {
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
  } = useBlogTableFilters();
  const t = useI18n<BlogAdminNamespace, BlogAdminKeys>(
    blogAdminNamespace,
  );
  const tUi = useI18n("ui");

  return (
    <div className="flex flex-col flex-wrap md:items-center justify-between gap-4 md:flex-row">
      <div className="flex flex-1 md:flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 max-md:justify-between">
        <DeleteSelectedBlogPostsButton
          selected={rowSelection}
          appId={appId}
        />
        <Button asChild>
          <a href="/dashboard/blog/new">{t("table.actions.create")}</a>
        </Button>
      </div>
    </div>
  );
};

