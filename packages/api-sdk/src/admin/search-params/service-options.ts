import {
  createLoader,
  createSearchParamsCache,
  createSerializer,
  createStandardSchemaV1,
  inferParserType,
  parseAsArrayOf,
  parseAsString,
} from "nuqs/server";

import { baseSearchParams } from "./base";

export const serviceOptionsSearchParams = {
  ...baseSearchParams,
  sort: baseSearchParams.sort.withDefault([
    {
      id: "updatedAt",
      desc: true,
    },
  ]),
  priorityId: parseAsArrayOf(parseAsString),
};

export const serviceOptionsSearchParamsCache = createSearchParamsCache(
  serviceOptionsSearchParams,
);
export const serviceOptionsSearchParamsSchema = createStandardSchemaV1(
  serviceOptionsSearchParams,
);
export const serviceOptionsSearchParamsSerializer = createSerializer(
  serviceOptionsSearchParams,
);

export const serviceOptionsSearchParamsLoader = createLoader(
  serviceOptionsSearchParams,
);
export type ServiceOptionsSearchParams = Partial<
  inferParserType<typeof serviceOptionsSearchParams>
>;
