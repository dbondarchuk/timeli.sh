import * as z from "zod";
import { IcsAdminAllKeys } from "./translations/types";

export const icsLinkCalendarSourceSchema = z.object({
  link: z
    .string()
    .url("app_ics_admin.validation.invalidUrl" satisfies IcsAdminAllKeys),
});

export type IcsLinkCalendarSource = z.infer<typeof icsLinkCalendarSourceSchema>;
