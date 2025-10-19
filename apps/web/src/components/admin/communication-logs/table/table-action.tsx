"use client";

import { useI18n } from "@vivid/i18n";
import {
  communicationChannels,
  communicationDirectionSchema,
  communicationParticipantTypeSchema,
} from "@vivid/types";
import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@vivid/ui";
import {
  CustomersDataTableAsyncFilterBox,
  DataTableFilterBox,
  DataTableRangeBox,
  DataTableResetFilter,
  DataTableSearch,
  useSelectedRowsStore,
} from "@vivid/ui-admin";
import { Settings2 } from "lucide-react";
import React from "react";
import { ClearAllCommunicationLogsButton } from "./clear-all";
import { ClearSelectedCommunicationLogsButton } from "./clear-selected";
import { useCommunicationLogsTableFilters } from "./use-table-filters";

export const CommunicationLogsTableAction: React.FC<{
  allowClearAll?: boolean;
  hideActions?: boolean;
  showCustomerFilter?: boolean;
  showParticipantTypeFilter?: boolean;
  className?: string;
}> = ({
  allowClearAll,
  showCustomerFilter,
  showParticipantTypeFilter,
  hideActions = true,
  className,
}) => {
  const {
    directionFilter,
    channelFilter,
    participantTypeFilter,
    setDirectionFilter,
    setChannelFilter,
    setParticipantTypeFilter,
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
  } = useCommunicationLogsTableFilters();

  const { rowSelection } = useSelectedRowsStore();
  const t = useI18n("admin");

  const additionalFilters = (
    <>
      <DataTableFilterBox
        filterKey="direction"
        title={t("communicationLogs.table.filters.direction")}
        options={communicationDirectionSchema.map((direction) => ({
          value: direction,
          label: t(`common.labels.direction.${direction}`),
        }))}
        setFilterValue={setDirectionFilter as any}
        filterValue={directionFilter}
      />
      <DataTableFilterBox
        filterKey="channel"
        title={t("communicationLogs.table.filters.channel")}
        options={communicationChannels.map((channel) => ({
          value: channel,
          label: t(`common.labels.channel.${channel}`),
        }))}
        setFilterValue={setChannelFilter as any}
        filterValue={channelFilter}
      />
      {showParticipantTypeFilter && (
        <DataTableFilterBox
          filterKey="participantType"
          title={t("communicationLogs.table.filters.participant")}
          options={communicationParticipantTypeSchema.map(
            (participantType) => ({
              value: participantType,
              label: t(`common.labels.participantType.${participantType}`),
            }),
          )}
          setFilterValue={setParticipantTypeFilter as any}
          filterValue={participantTypeFilter}
        />
      )}
      {showCustomerFilter && (
        <CustomersDataTableAsyncFilterBox
          filterValue={customerFilter}
          setFilterValue={setCustomerFilter}
        />
      )}
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
            tooltip={t("communicationLogs.table.filters.filters")}
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
      {!hideActions && (
        <div className="flex flex-wrap items-center gap-4">
          <ClearSelectedCommunicationLogsButton selected={rowSelection} />
          {allowClearAll && <ClearAllCommunicationLogsButton />}
        </div>
      )}
    </div>
  );
};
