import {
  createLoader,
  createSearchParamsCache,
  createSerializer,
  createStandardSchemaV1,
  inferParserType,
  parseAsBoolean,
} from "nuqs/server";

import { baseSearchParams } from "./base";

export const serviceAddonsSearchParams = {
  ...baseSearchParams,
  includeUsage: parseAsBoolean,
  sort: baseSearchParams.sort.withDefault([
    {
      id: "updatedAt",
      desc: true,
    },
  ]),
};

export const serviceAddonsSearchParamsCache = createSearchParamsCache(
  serviceAddonsSearchParams,
);
export const serviceAddonsSearchParamsSchema = createStandardSchemaV1(
  serviceAddonsSearchParams,
);
export const serviceAddonsSearchParamsSerializer = createSerializer(
  serviceAddonsSearchParams,
);

export const serviceAddonsSearchParamsLoader = createLoader(
  serviceAddonsSearchParams,
);
export type ServiceAddonsSearchParams = Partial<
  inferParserType<typeof serviceAddonsSearchParams>
>;
