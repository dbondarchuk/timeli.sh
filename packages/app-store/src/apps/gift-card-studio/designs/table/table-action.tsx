"use client";

import { useI18n } from "@timelish/i18n";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@timelish/ui";
import {
  DataTableFilterBox,
  DataTableResetFilter,
  DataTableSearch,
  useSelectedRowsStore,
} from "@timelish/ui-admin";
import { Settings2 } from "lucide-react";
import React from "react";
import {
  GiftCardStudioAdminKeys,
  GiftCardStudioAdminNamespace,
  giftCardStudioAdminNamespace,
} from "../../translations/types";
import { ArchiveSelectedDesignsButton } from "./archive-selected";
import { DeleteSelectedDesignsButton } from "./delete-selected";
import { UnarchiveSelectedDesignsButton } from "./unarchive-selected";
import { useDesignsTableFilters } from "./use-table-filters";

export const DesignsTableAction: React.FC<{ appId: string }> = ({ appId }) => {
  const { rowSelection } = useSelectedRowsStore();
  const {
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    isArchivedFilter,
    setIsArchivedFilter,
    STATUS_OPTIONS,
  } = useDesignsTableFilters();
  const t = useI18n<GiftCardStudioAdminNamespace, GiftCardStudioAdminKeys>(
    giftCardStudioAdminNamespace,
  );

  const additionalFilters = (
    <DataTableFilterBox
      filterKey="isArchived"
      title={t("designs.table.filters.status")}
      options={STATUS_OPTIONS}
      setFilterValue={setIsArchivedFilter}
      filterValue={isArchivedFilter}
    />
  );

  const canDeleteAll = rowSelection.every((d) => (d.purchasesCount ?? 0) === 0);
  const allArchived =
    rowSelection.length > 0 && rowSelection.every((d) => d.isArchived);
  const allActive =
    rowSelection.length > 0 && rowSelection.every((d) => !d.isArchived);

  return (
    <div className="flex flex-col flex-wrap md:items-center justify-between gap-4 md:flex-row">
      <div className="flex flex-1 md:flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Settings2 size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2">
            {additionalFilters}
          </PopoverContent>
        </Popover>
        <div className="hidden md:block">{additionalFilters}</div>
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
        />
      </div>
      <div className="flex flex-wrap max-md:flex-row-reverse items-center gap-4 max-md:justify-between">
        <UnarchiveSelectedDesignsButton
          appId={appId}
          selected={rowSelection}
          disabled={!allArchived}
        />
        <ArchiveSelectedDesignsButton
          appId={appId}
          selected={rowSelection}
          disabled={!allActive}
        />
        <DeleteSelectedDesignsButton
          appId={appId}
          selected={rowSelection}
          disabled={!canDeleteAll}
        />
        <Button asChild>
          <a href="/dashboard/gift-card-studio/new">
            {t("designs.table.actions.create")}
          </a>
        </Button>
      </div>
    </div>
  );
};
