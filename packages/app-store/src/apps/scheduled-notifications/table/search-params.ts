import {
  createSerializer,
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";

import { baseSearchParams } from "@timelish/api-sdk";
import { communicationChannels } from "@timelish/types";
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
