"use client";

import { ButtonGroup } from "@timelish/ui";
import {
  DataTableResetFilter,
  DataTableSearch,
  useSelectedRowsStore,
} from "@timelish/ui-admin";
import { DeleteSelectedCustomersButton } from "./delete-selected";
import { MergeSelectedCustomersButton } from "./merge-selected";
import { useCustomersTableFilters } from "./use-table-filters";

export function CustomersTableAction() {
  const {
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
  } = useCustomersTableFilters();
  const { rowSelection } = useSelectedRowsStore();

  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-2">
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
        <ButtonGroup>
          <MergeSelectedCustomersButton selected={rowSelection} />
          <DeleteSelectedCustomersButton selected={rowSelection} />
        </ButtonGroup>
      </div>
    </div>
  );
}
