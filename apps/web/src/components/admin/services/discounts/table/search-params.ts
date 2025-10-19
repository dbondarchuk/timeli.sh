import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsIsoDateTime,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

import { discountTypes } from "@vivid/types";
import { baseSearchParams } from "@vivid/ui-admin";

export const searchParams = {
  ...baseSearchParams,
  type: parseAsArrayOf(parseAsStringEnum(discountTypes.flat())).withDefault(
    discountTypes.flat(),
  ),
  enabled: parseAsArrayOf(parseAsBoolean).withDefault([true, false]),
  start: parseAsIsoDateTime,
  end: parseAsIsoDateTime,
  priorityId: parseAsArrayOf(parseAsString),
  sort: baseSearchParams.sort.withDefault([
    {
      id: "updatedAt",
      desc: true,
    },
  ]),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
