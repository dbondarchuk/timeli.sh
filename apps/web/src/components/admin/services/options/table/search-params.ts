import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsString,
} from "nuqs/server";

import { baseSearchParams } from "@vivid/ui-admin";

export const searchParams = {
  ...baseSearchParams,
  sort: baseSearchParams.sort.withDefault([
    {
      id: "updatedAt",
      desc: true,
    },
  ]),
  priorityId: parseAsArrayOf(parseAsString),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
