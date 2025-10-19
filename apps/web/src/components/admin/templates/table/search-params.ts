import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsStringLiteral,
} from "nuqs/server";

import { communicationChannels } from "@vivid/types";
import { baseSearchParams } from "@vivid/ui-admin";

export const searchParams = {
  ...baseSearchParams,
  type: parseAsArrayOf(parseAsStringLiteral(communicationChannels)).withDefault(
    [...communicationChannels],
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
