import { DateTime } from "luxon";
import {
  createSearchParamsCache,
  createSerializer,
  parseAsIsoDateTime,
  parseAsString,
} from "nuqs/server";

export const financialOverviewSearchParams = {
  start: parseAsIsoDateTime.withDefault(
    DateTime.now().startOf("month").toJSDate(),
  ),
  end: parseAsIsoDateTime.withDefault(DateTime.now().endOf("month").toJSDate()),
  timeGrouping: parseAsString.withDefault("day"),
};

export const financialOverviewSearchParamsCache = createSearchParamsCache(
  financialOverviewSearchParams,
);
export const serializeFinancialOverviewSearchParams = createSerializer(
  financialOverviewSearchParams,
);
