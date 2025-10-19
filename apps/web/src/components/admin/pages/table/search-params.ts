import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
} from "nuqs/server";

import { baseSearchParams } from "@vivid/ui-admin";

export const searchParams = {
  ...baseSearchParams,
  published: parseAsArrayOf(parseAsBoolean).withDefault([true, false]),
  tags: parseAsArrayOf(parseAsString),
  sort: baseSearchParams.sort.withDefault([
    {
      id: "updatedAt",
      desc: true,
    },
  ]),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
