import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsIsoDateTime,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

import {
  communicationChannels,
  communicationDirectionSchema,
  communicationParticipantTypeSchema,
} from "@vivid/types";
import { baseSearchParams } from "@vivid/ui-admin";

export const searchParams = {
  ...baseSearchParams,
  start: parseAsIsoDateTime,
  end: parseAsIsoDateTime,
  direction: parseAsArrayOf(
    parseAsStringLiteral(communicationDirectionSchema),
  ).withDefault([...communicationDirectionSchema]),
  participantType: parseAsArrayOf(
    parseAsStringLiteral(communicationParticipantTypeSchema),
  ).withDefault([...communicationParticipantTypeSchema]),
  channel: parseAsArrayOf(
    parseAsStringLiteral(communicationChannels),
  ).withDefault([...communicationChannels]),
  customer: parseAsArrayOf(parseAsString),
  appointment: parseAsString,
  sort: baseSearchParams.sort.withDefault([
    {
      id: "dateTime",
      desc: true,
    },
  ]),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
