"use client";

import { useI18n } from "@vivid/i18n";
import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@vivid/ui";
import {
  CustomersDataTableAsyncFilterBox,
  DataTableResetFilter,
  DataTableSearch,
  useSelectedRowsStore,
} from "@vivid/ui-admin";
import { Settings2 } from "lucide-react";
import React from "react";
import { DeleteSelectedAssetsButton } from "./delete-selected-button";
import { useAssetsTableFilters } from "./use-table-filters";

export const AssetsTableAction: React.FC<{
  showCustomerFilter?: boolean;
  className?: string;
  onDelete?: () => void;
}> = ({ showCustomerFilter, className, onDelete }) => {
  const {
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    customerFilter,
    setCustomerFilter,
  } = useAssetsTableFilters();
  const { rowSelection } = useSelectedRowsStore();
  const t = useI18n("admin");

  const additionalFilters = showCustomerFilter ? (
    <>
      {showCustomerFilter && (
        <CustomersDataTableAsyncFilterBox
          filterValue={customerFilter}
          setFilterValue={setCustomerFilter}
        />
      )}
    </>
  ) : null;

  return (
    <div
      className={cn(
        "flex flex-col flex-wrap md:items-center justify-between gap-4 md:flex-row",
        className,
      )}
    >
      <div className="flex flex-1 md:flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
        {additionalFilters && (
          <>
            <Popover>
              <PopoverTrigger
                tooltip={t("assets.table.filters.filters")}
                asChild
                className="md:hidden"
              >
                <Button variant="outline">
                  <Settings2 size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-2">
                {additionalFilters}
              </PopoverContent>
            </Popover>
            <div className="hidden md:flex flex-row gap-4">
              {additionalFilters}
            </div>
          </>
        )}
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <DeleteSelectedAssetsButton
          selected={rowSelection}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};
