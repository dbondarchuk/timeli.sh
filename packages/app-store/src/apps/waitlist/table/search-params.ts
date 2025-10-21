import {
  createSerializer,
  parseAsArrayOf,
  parseAsIsoDateTime,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";

import { DateTime } from "luxon";

import { baseSearchParams } from "@vivid/api-sdk";
import { waitlistStatus } from "../models";

export const searchParams = {
  ...baseSearchParams,
  status: parseAsArrayOf(parseAsStringEnum(waitlistStatus.flat())).withDefault([
    "active",
  ]),
  customer: parseAsArrayOf(parseAsString),
  option: parseAsArrayOf(parseAsString),
  start: parseAsIsoDateTime.withDefault(
    DateTime.now().startOf("day").toJSDate(),
  ),
  end: parseAsIsoDateTime,
  sort: baseSearchParams.sort.withDefault([
    {
      id: "createdAt",
      desc: false,
    },
  ]),
  ts: parseAsString,
};

export const serialize = createSerializer(searchParams);
