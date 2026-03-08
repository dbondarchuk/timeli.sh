"use client";

import { useI18n } from "@timelish/i18n";
import { useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import {
  GiftCardStudioAdminKeys,
  GiftCardStudioAdminNamespace,
  giftCardStudioAdminNamespace,
} from "../../translations/types";
import { searchParams } from "./search-params";

export function useDesignsTableFilters() {
  const t = useI18n<
    GiftCardStudioAdminNamespace,
    GiftCardStudioAdminKeys
  >(giftCardStudioAdminNamespace);

  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    searchParams.search
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault(""),
  );
  const [page, setPage] = useQueryState("page", searchParams.page);
  const [isPublicFilter, setIsPublicFilter] = useQueryState(
    "isPublic",
    searchParams.isPublic.withOptions({ shallow: false }),
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setIsPublicFilter(null);
    setPage(1);
  }, [setSearchQuery, setIsPublicFilter, setPage]);

  const isAnyFilterActive = useMemo(() => {
    const defaultPublic = searchParams.isPublic.defaultValue;
    return (
      !!searchQuery ||
      JSON.stringify(isPublicFilter ?? defaultPublic) !==
        JSON.stringify(defaultPublic)
    );
  }, [searchQuery, isPublicFilter]);

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: true, label: t("designs.table.filters.published") },
      { value: false, label: t("designs.table.filters.draft") },
    ],
    [t],
  );

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
    isPublicFilter: isPublicFilter ?? searchParams.isPublic.defaultValue,
    setIsPublicFilter,
    STATUS_OPTIONS,
  };
}
