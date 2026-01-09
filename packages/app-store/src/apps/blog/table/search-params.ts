import { baseSearchParams } from "@timelish/api-sdk";
import { createSerializer } from "nuqs";

export const searchParams = {
  ...baseSearchParams,
  sort: baseSearchParams.sort.withDefault([
    {
      id: "publicationDate",
      desc: true,
    },
  ]),
};

export const serialize = createSerializer(searchParams);
