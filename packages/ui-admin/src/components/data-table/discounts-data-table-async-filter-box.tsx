"use client";

import React from "react";

import { useI18n } from "@vivid/i18n";
import { Discount, WithTotal } from "@vivid/types";
import {
  Skeleton,
  toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vivid/ui";
import {
  AsyncFilterBoxOption,
  AsyncFilterBoxProps,
  DataTableAsyncFilterBox,
} from "./data-table-async-filter-box";

const DiscountShortLabel: React.FC<{
  discount: Discount;
}> = ({ discount }) => {
  return (
    <div className="flex flex-col gap-2 shrink overflow-hidden text-nowrap">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>{discount.name}</TooltipTrigger>
          <TooltipContent>{discount.name}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="text-sm italic">
        (-{discount.type === "amount" && "$"}
        {discount.value}
        {discount.type === "percentage" && "%"})
      </span>
    </div>
  );
};

const DiscountLoader: React.FC<{}> = ({}) => {
  return (
    <div className="flex flex-col gap-2 overflow-hidden text-nowrap pl-6">
      <Skeleton className="w-40 h-5" />
      <Skeleton className="w-36 h-4" />
    </div>
  );
};

export const DiscountsDataTableAsyncFilterBox: React.FC<
  Omit<AsyncFilterBoxProps, "fetchItems" | "title" | "filterKey" | "loader"> & {
    title?: AsyncFilterBoxProps["title"];
    filterKey?: AsyncFilterBoxProps["filterKey"];
  }
> = ({ title: propsTitle, filterKey = "discountId", ...rest }) => {
  const t = useI18n("admin");
  const title = propsTitle ?? t("appointments.table.columns.discount");

  const getDiscounts = async (page: number, search?: string) => {
    const limit = 10;
    let url = `/admin/api/discounts?page=${page}&limit=${limit}`;
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
        `Request to fetch disconts failed: ${response.status}; ${text}`,
      );

      return {
        items: [],
        hasMore: false,
      };
    }

    const res = (await response.json()) as WithTotal<Discount>;

    return {
      items: res.items.map((discount) => ({
        label: <DiscountShortLabel discount={discount} />,
        shortLabel: discount.name,
        value: discount._id,
      })) satisfies AsyncFilterBoxOption[],
      hasMore: page * limit < res.total,
    };
  };

  return (
    <DataTableAsyncFilterBox
      title={title}
      filterKey={filterKey}
      fetchItems={getDiscounts}
      {...rest}
      loader={<DiscountLoader />}
    />
  );
};
