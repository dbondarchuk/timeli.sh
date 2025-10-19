import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsStringEnum,
} from "nuqs/server";

import { fieldTypes } from "@vivid/types";
import { baseSearchParams } from "@vivid/ui-admin";

export const searchParams = {
  ...baseSearchParams,
  type: parseAsArrayOf(parseAsStringEnum(fieldTypes.flat())).withDefault(
    fieldTypes.flat(),
  ),
  sort: baseSearchParams.sort.withDefault([
    {
      id: "updatedAt",
      desc: true,
    },
  ]),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
