"use client";

import React from "react";

import { useI18n } from "@vivid/i18n";
import { AppointmentOption, WithTotal } from "@vivid/types";
import { Skeleton, toast } from "@vivid/ui";
import { durationToTime } from "@vivid/utils";
import {
  AsyncFilterBoxOption,
  AsyncFilterBoxProps,
  DataTableAsyncFilterBox,
} from "./data-table-async-filter-box";

const OptionShortLabel: React.FC<{
  option: AppointmentOption;
}> = ({ option }) => {
  const time = option.duration ? durationToTime(option.duration) : null;
  const t = useI18n("admin");
  const timeString = time ? t("common.timeDuration", time) : t("common.custom");
  return (
    <div className="flex flex-row items-center gap-2 shrink overflow-hidden text-nowrap">
      <div className="flex gap-0.5 flex-col w-full">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {option.name}
        </span>
        <span className="text-xs italic">{timeString}</span>
      </div>
    </div>
  );
};

const OptionLoader: React.FC<{}> = ({}) => {
  return (
    <div className="flex flex-row items-center gap-2 overflow-hidden text-nowrap pl-6">
      <div className="flex gap-0.5 flex-col">
        <Skeleton className="w-40 h-5" />
        <Skeleton className="w-36 h-4" />
      </div>
    </div>
  );
};

export const OptionsDataTableAsyncFilterBox: React.FC<
  Omit<AsyncFilterBoxProps, "fetchItems" | "title" | "filterKey" | "loader"> & {
    title?: AsyncFilterBoxProps["title"];
    filterKey?: AsyncFilterBoxProps["filterKey"];
  }
> = ({ title: propsTitle, filterKey = "optionId", ...rest }) => {
  const t = useI18n("admin");
  const title = propsTitle ?? t("appointments.table.columns.option");

  const getOptions = async (page: number, search?: string) => {
    const limit = 10;
    let url = `/admin/api/services/options?page=${page}&limit=${limit}`;
    if (rest.filterValue) {
      url += `&priorityId=${rest.filterValue.map((id) => encodeURIComponent(id)).join(",")}`;
    }

    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "default",
    });

    if (response.status >= 400) {
      toast.error(t("common.toasts.error"));
      const text = await response.text();
      console.error(
        `Request to fetch options failed: ${response.status}; ${text}`,
      );

      return {
        items: [],
        hasMore: false,
      };
    }

    const res = (await response.json()) as WithTotal<AppointmentOption>;

    return {
      items: res.items.map((option) => ({
        label: <OptionShortLabel option={option} />,
        shortLabel: option.name,
        value: option._id,
      })) satisfies AsyncFilterBoxOption[],
      hasMore: page * limit < res.total,
    };
  };

  return (
    <DataTableAsyncFilterBox
      title={title}
      filterKey={filterKey}
      fetchItems={getOptions}
      {...rest}
      loader={<OptionLoader />}
    />
  );
};
