import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsIsoDateTime,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

import { appointmentStatuses } from "@vivid/types";
import { baseSearchParams } from "@vivid/ui-admin";

export const searchParams = {
  ...baseSearchParams,
  start: parseAsIsoDateTime,
  end: parseAsIsoDateTime,
  status: parseAsArrayOf(parseAsStringLiteral(appointmentStatuses)).withDefault(
    ["confirmed", "pending"],
  ),
  customer: parseAsArrayOf(parseAsString),
  discount: parseAsArrayOf(parseAsString),
  sort: baseSearchParams.sort.withDefault([
    {
      id: "createdAt",
      desc: true,
    },
  ]),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
