import {
  createSerializer,
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";

import { baseSearchParams } from "@vivid/api-sdk";
import { communicationChannels } from "@vivid/types";

export const searchParams = {
  ...baseSearchParams,
  channel: parseAsArrayOf(
    parseAsStringEnum(communicationChannels.flat()),
  ).withDefault(communicationChannels.flat()),
  sort: baseSearchParams.sort.withDefault([
    {
      id: "updatedAt",
      desc: true,
    },
  ]),
  ts: parseAsString,
};

export const serialize = createSerializer(searchParams);
