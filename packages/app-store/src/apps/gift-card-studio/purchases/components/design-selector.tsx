"use client";

import { useI18n } from "@timelish/i18n";
import { cn, ComboboxAsync, IComboboxItem, Skeleton } from "@timelish/ui";
import React from "react";
import { getDesigns } from "../../actions";
import { DesignListModel } from "../../models";
import {
  GiftCardStudioAdminKeys,
  GiftCardStudioAdminNamespace,
  giftCardStudioAdminNamespace,
} from "../../translations/types";

const DesignLoader: React.FC = () => (
  <div className="flex flex-row items-center gap-2 overflow-hidden text-nowrap pl-6 w-full py-1">
    <Skeleton className="w-5 h-5 rounded" />
    <Skeleton className="min-w-32 max-w-64 w-full h-5" />
  </div>
);

export type DesignSelectorProps = {
  appId: string;
  value: string;
  onItemSelect: (value: string) => void;
  allowClear?: false;
  disabled?: boolean;
  className?: string;
  includeNonPublic?: boolean;
};

export const DesignSelector: React.FC<DesignSelectorProps> = ({
  appId,
  value,
  onItemSelect,
  disabled,
  className,
  includeNonPublic = false,
}) => {
  const t = useI18n<GiftCardStudioAdminNamespace, GiftCardStudioAdminKeys>(
    giftCardStudioAdminNamespace,
  );

  const fetchDesigns = React.useCallback(
    async (page: number, search?: string) => {
      const limit = 15;
      const offset = (page - 1) * limit;
      const result = await getDesigns(appId, {
        limit,
        offset,
        search: search?.trim() || undefined,
        priorityIds: value ? [value] : undefined,
        isPublic: includeNonPublic ? [true, false] : [true],
      });

      const items: IComboboxItem[] = (result.items ?? []).map(
        (d: DesignListModel) => ({
          value: d._id,
          label: d.name,
          shortLabel: d.name,
        }),
      );

      const total = result.total ?? 0;
      const hasMore = offset + items.length < total;

      return { items, hasMore };
    },
    [appId, value],
  );

  return (
    <ComboboxAsync
      value={value}
      onChange={(value) => onItemSelect(value ?? "")}
      disabled={disabled}
      className={cn("flex font-normal text-base max-w-full min-w-0", className)}
      placeholder={t("purchases.manualForm.designPlaceholder")}
      fetchItems={fetchDesigns}
      loader={<DesignLoader />}
      allowClear={false}
    />
  );
};
