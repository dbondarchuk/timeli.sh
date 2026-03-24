"use client";

import { useI18n } from "@timelish/i18n";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@timelish/ui";
import {
  CustomersDataTableAsyncFilterBox,
  DataTableFilterBox,
  DataTableRangeBox,
  DataTableResetFilter,
  DataTableSearch,
  OptionsDataTableAsyncFilterBox,
  useSelectedRowsStore,
} from "@timelish/ui-admin";
import { HeaderActionButtonsPortal } from "@timelish/ui-admin-kit";
import { Settings2 } from "lucide-react";
import React from "react";
import { waitlistStatus } from "../models";
import {
  WaitlistAdminKeys,
  WaitlistAdminNamespace,
  waitlistAdminNamespace,
} from "../translations/types";
import { DismissSelectedWaitlistEntriesButton } from "./dismiss-selected";
import { NewEntryDialog } from "./new-entry";
import { SettingsDialog } from "./settings";
import { useWaitlistTableFilters } from "./use-table-filters";

export const WaitlistTableAction: React.FC<{
  appId: string;
  /** When set, customer filter is hidden and table is fixed to this customer (e.g. on customer tab). */
  customerIdLock?: string;
}> = ({ appId, customerIdLock }) => {
  const {
    statusFilter,
    setStatusFilter,
    customerFilter,
    setCustomerFilter,
    optionFilter,
    setOptionFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    start,
    setStartValue,
    end,
    setEndValue,
  } = useWaitlistTableFilters();
  const { rowSelection } = useSelectedRowsStore();
  const t = useI18n<WaitlistAdminNamespace, WaitlistAdminKeys>(
    waitlistAdminNamespace,
  );
  const tUi = useI18n("ui");

  const additionalFilters = (
    <>
      <DataTableFilterBox
        filterKey="status"
        title={t("table.columns.status")}
        options={waitlistStatus.map((status) => ({
          value: status,
          label: t(`statuses.${status}`),
        }))}
        setFilterValue={setStatusFilter as any}
        filterValue={statusFilter}
      />
      {!customerIdLock && (
        <CustomersDataTableAsyncFilterBox
          filterValue={customerFilter}
          setFilterValue={setCustomerFilter}
        />
      )}
      <OptionsDataTableAsyncFilterBox
        filterValue={optionFilter}
        setFilterValue={setOptionFilter}
      />
      <DataTableRangeBox
        startValue={start}
        endValue={end}
        setStartValue={setStartValue}
        setEndValue={setEndValue}
      />
    </>
  );

  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-2">
      <div className="flex flex-1 md:flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
        <Popover>
          <PopoverTrigger
            tooltip={tUi("table.filters")}
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
        <div className="hidden md:flex flex-row gap-4">{additionalFilters}</div>
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 max-md:justify-between">
        <DismissSelectedWaitlistEntriesButton
          selected={rowSelection}
          appId={appId}
        />
        <HeaderActionButtonsPortal>
          <NewEntryDialog appId={appId} customerIdLock={customerIdLock} />
          {!customerIdLock && <SettingsDialog appId={appId} />}
        </HeaderActionButtonsPortal>
      </div>
    </div>
  );
};
