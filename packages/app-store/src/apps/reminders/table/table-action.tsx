"use client";

import { useI18n } from "@vivid/i18n";
import { communicationChannels } from "@vivid/types";
import {
  Button,
  DataTableFilterBox,
  DataTableResetFilter,
  DataTableSearch,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useSelectedRowsStore,
} from "@vivid/ui";
import { Plus, Settings2 } from "lucide-react";
import React from "react";
import {
  RemindersAdminKeys,
  RemindersAdminNamespace,
  remindersAdminNamespace,
} from "../translations/types";
import { DeleteSelectedRemindersButton } from "./delete-selected";
import { useRemindersTableFilters } from "./use-table-filters";

export const RemindersTableAction: React.FC<{ appId: string }> = ({
  appId,
}) => {
  const t = useI18n<RemindersAdminNamespace, RemindersAdminKeys>(
    remindersAdminNamespace,
  );
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
  } = useRemindersTableFilters();
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
        <DeleteSelectedRemindersButton selected={rowSelection} appId={appId} />
        <Link
          button
          variant="primary"
          href="/admin/dashboard/communications/reminders/new"
        >
          <Plus size={16} />{" "}
          <span className="max-md:hidden">{t("table.actions.add")}</span>
        </Link>
      </div>
    </div>
  );
};
