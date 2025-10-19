import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsString,
} from "nuqs/server";

import { baseSearchParams } from "@vivid/ui-admin";

export const searchParams = {
  ...baseSearchParams,
  priorityId: parseAsArrayOf(parseAsString),
  sort: baseSearchParams.sort.withDefault([
    {
      id: "lastAppointment.dateTime",
      desc: true,
    },
  ]),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
