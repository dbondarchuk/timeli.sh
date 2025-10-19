import {
  createSerializer,
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";

import { communicationChannels } from "@vivid/types";
import { baseSearchParams } from "@vivid/ui-admin";

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
