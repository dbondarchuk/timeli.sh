import {
  createLoader,
  createSearchParamsCache,
  createSerializer,
  createStandardSchemaV1,
  inferParserType,
  parseAsInteger,
} from "nuqs/server";

export const availabilitySearchParams = {
  duration: parseAsInteger,
};

export const availabilitySearchParamsCache = createSearchParamsCache(
  availabilitySearchParams,
);

export const serializeAvailabilitySearchParams = createSerializer(
  availabilitySearchParams,
);

export const availabilitySearchParamsLoader = createLoader(
  availabilitySearchParams,
);

export const availabilitySearchParamsSchema = createStandardSchemaV1(
  availabilitySearchParams,
);

export type AvailabilitySearchParams = inferParserType<
  typeof availabilitySearchParams
>;
