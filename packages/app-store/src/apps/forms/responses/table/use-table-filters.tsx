"use client";

import { useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import { searchParams } from "./search-params";

export function useResponsesTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    searchParams.search
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault(""),
  );

  const [formIdFilter, setFormIdFilter] = useQueryState(
    "formId",
    searchParams.formId.withOptions({ shallow: false }),
  );

  const [customerIdFilter, setCustomerIdFilter] = useQueryState(
    "customerId",
    searchParams.customerId.withOptions({ shallow: false }),
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
    setFormIdFilter(null);
    setCustomerIdFilter(null);
    setStartValue(null);
    setEndValue(null);
    setPage(1);
  }, [
    setSearchQuery,
    setFormIdFilter,
    setCustomerIdFilter,
    setStartValue,
    setEndValue,
    setPage,
  ]);

  const isAnyFilterActive = useMemo(() => {
    return (
      !!searchQuery ||
      !!formIdFilter?.length ||
      !!customerIdFilter?.length ||
      !!start ||
      !!end
    );
  }, [searchQuery, formIdFilter, customerIdFilter, start, end]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
    formIdFilter,
    setFormIdFilter,
    customerIdFilter,
    setCustomerIdFilter,
    start,
    setStartValue,
    end,
    setEndValue,
  };
}
