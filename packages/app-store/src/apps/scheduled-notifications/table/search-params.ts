import {
  createSerializer,
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";

import { baseSearchParams } from "@vivid/api-sdk";
import { communicationChannels } from "@vivid/types";
import { scheduledNotificationTypes } from "../models";

export const searchParams = {
  ...baseSearchParams,
  channel: parseAsArrayOf(
    parseAsStringEnum(communicationChannels.flat()),
  ).withDefault(communicationChannels.flat()),
  type: parseAsArrayOf(
    parseAsStringEnum(scheduledNotificationTypes.flat()),
  ).withDefault(scheduledNotificationTypes.flat()),
  sort: baseSearchParams.sort.withDefault([
    {
      id: "updatedAt",
      desc: true,
    },
  ]),
  ts: parseAsString,
};

export const serialize = createSerializer(searchParams);
