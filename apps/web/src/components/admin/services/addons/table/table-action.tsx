"use client";

import {
  DataTableResetFilter,
  DataTableSearch,
  useSelectedRowsStore,
} from "@vivid/ui-admin";
import { DeleteSelectedAddonsButton } from "./delete-selected";
import { useAddonsTableFilters } from "./use-table-filters";

export function AddonsTableAction() {
  const {
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
  } = useAddonsTableFilters();
  const { rowSelection } = useSelectedRowsStore();

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
      <div className="flex flex-wrap items-center gap-4">
        <DeleteSelectedAddonsButton selected={rowSelection} />
      </div>
    </div>
  );
}
