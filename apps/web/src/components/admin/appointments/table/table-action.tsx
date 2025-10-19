"use client";

import { useI18n } from "@vivid/i18n";
import { appointmentStatuses } from "@vivid/types";
import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@vivid/ui";
import {
  CustomersDataTableAsyncFilterBox,
  DataTableFilterBox,
  DataTableRangeBox,
  DataTableResetFilter,
  DataTableSearch,
  DiscountsDataTableAsyncFilterBox,
} from "@vivid/ui-admin";
import { Settings2 } from "lucide-react";
import React from "react";
import { useAppointmentsTableFilters } from "./use-table-filters";

export const AppointmentsTableAction: React.FC<{
  showCustomerFilter?: boolean;
  className?: string;
}> = ({ showCustomerFilter, className }) => {
  const t = useI18n("admin");
  const {
    statusFilter,
    setStatusFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    start,
    end,
    setStartValue,
    setEndValue,
    customerFilter,
    setCustomerFilter,
    discountFilter,
    setDiscountFilter,
  } = useAppointmentsTableFilters();

  const additionalFilters = (
    <>
      <DataTableFilterBox
        filterKey="status"
        title={t("appointments.table.filters.status")}
        options={appointmentStatuses.map((value) => ({
          value,
          label: t(`appointments.status.${value}`),
        }))}
        setFilterValue={setStatusFilter as any}
        filterValue={statusFilter}
      />
      {showCustomerFilter && (
        <CustomersDataTableAsyncFilterBox
          filterValue={customerFilter}
          setFilterValue={setCustomerFilter}
        />
      )}
      <DiscountsDataTableAsyncFilterBox
        filterValue={discountFilter}
        setFilterValue={setDiscountFilter}
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
        <Popover>
          <PopoverTrigger
            tooltip={t("common.labels.filters")}
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
    </div>
  );
};
