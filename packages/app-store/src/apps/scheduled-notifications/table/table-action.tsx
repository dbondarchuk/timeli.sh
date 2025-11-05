"use client";

import { useI18n } from "@timelish/i18n";
import { communicationChannels } from "@timelish/types";
import {
  Button,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@timelish/ui";
import {
  DataTableFilterBox,
  DataTableResetFilter,
  DataTableSearch,
  useSelectedRowsStore,
} from "@timelish/ui-admin";
import { Plus, Settings2 } from "lucide-react";
import React from "react";
import { scheduledNotificationTypes } from "../models";
import {
  ScheduledNotificationsAdminKeys,
  ScheduledNotificationsAdminNamespace,
  scheduledNotificationsAdminNamespace,
} from "../translations/types";
import { DeleteSelectedScheduledNotificationsButton } from "./delete-selected";
import { useScheduledNotificationsTableFilters } from "./use-table-filters";

export const ScheduledNotificationsTableAction: React.FC<{ appId: string }> = ({
  appId,
}) => {
  const t = useI18n<
    ScheduledNotificationsAdminNamespace,
    ScheduledNotificationsAdminKeys
  >(scheduledNotificationsAdminNamespace);
  const tUi = useI18n("ui");
  const tAdmin = useI18n("admin");

  const {
    channelFilter,
    setChannelFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
  } = useScheduledNotificationsTableFilters();
  const { rowSelection } = useSelectedRowsStore();

  const additionalFilters = (
    <>
      <DataTableFilterBox
        filterKey="channel"
        title={t("table.columns.channel")}
        options={communicationChannels.map((value) => ({
          value,
          label: tAdmin(`common.labels.channel.${value}`),
        }))}
        setFilterValue={setChannelFilter as any}
        filterValue={channelFilter}
      />
      <DataTableFilterBox
        filterKey="type"
        title={t("table.columns.type")}
        options={scheduledNotificationTypes.map((value) => ({
          value,
          label: t(`triggers.${value}`),
        }))}
        setFilterValue={setTypeFilter as any}
        filterValue={typeFilter}
      />
    </>
  );

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
      <div className="flex flex-wrap items-center gap-4 max-md:justify-between">
        <DeleteSelectedScheduledNotificationsButton
          selected={rowSelection}
          appId={appId}
        />
        <Link
          button
          variant="primary"
          href="/dashboard/communications/scheduled-notifications/new"
        >
          <Plus size={16} />{" "}
          <span className="max-md:hidden">{t("table.actions.add")}</span>
        </Link>
      </div>
    </div>
  );
};
