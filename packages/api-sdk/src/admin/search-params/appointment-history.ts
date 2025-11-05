import {
  createLoader,
  createSearchParamsCache,
  createSerializer,
  createStandardSchemaV1,
  type inferParserType,
} from "nuqs/server";

import { baseSearchParams } from "./base";

export const appointmentHistorySearchParams = {
  ...baseSearchParams,
  sort: baseSearchParams.sort.withDefault([
    {
      id: "dateTime",
      desc: true,
    },
  ]),
};

export const appointmentHistorySearchParamsLoader = createLoader(
  appointmentHistorySearchParams,
);

export const appointmentHistorySearchParamsSchema = createStandardSchemaV1(
  appointmentHistorySearchParams,
);

export type AppointmentHistorySearchParams = Partial<
  inferParserType<typeof appointmentHistorySearchParams>
>;

export const appointmentHistorySearchParamsCache = createSearchParamsCache(
  appointmentHistorySearchParams,
);

export const serializeAppointmentHistorySearchParams = createSerializer(
  appointmentHistorySearchParams,
);
