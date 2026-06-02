"use client";

import { useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import { searchParams } from "./search-params";

export function useCommentsTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    searchParams.search
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault(""),
  );

  const [postIdFilter, setPostIdFilter] = useQueryState(
    "postId",
    searchParams.postId.withOptions({ shallow: false }),
  );

  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    searchParams.status.withOptions({ shallow: false }),
  );

  const [start, setStartValue] = useQueryState(
    "start",
    searchParams.start.withOptions({ shallow: false }),
  );

  const [end, setEndValue] = useQueryState(
    "end",
    searchParams.end.withOptions({ shallow: false }),
  );

  const [page, setPage] = useQueryState("page", searchParams.page);

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setPostIdFilter(null);
    setStatusFilter(null);
    setStartValue(null);
    setEndValue(null);
    setPage(1);
  }, [
    setSearchQuery,
    setPostIdFilter,
    setStatusFilter,
    setStartValue,
    setEndValue,
    setPage,
  ]);

  const isAnyFilterActive = useMemo(() => {
    return (
      !!searchQuery ||
      !!postIdFilter?.length ||
      !!statusFilter?.length ||
      !!start ||
      !!end
    );
  }, [searchQuery, postIdFilter, statusFilter, start, end]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
    postIdFilter,
    setPostIdFilter,
    statusFilter,
    setStatusFilter,
    start,
    setStartValue,
    end,
    setEndValue,
  };
}
