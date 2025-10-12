import {
  createSearchParamsCache,
  createSerializer,
  parseAsJson,
  parseAsString,
} from "nuqs/server";

export const searchParams = {
  from: parseAsString,
  customer: parseAsString,
  fromValue: parseAsJson((value) => value),
  data: parseAsJson((value) => value),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
