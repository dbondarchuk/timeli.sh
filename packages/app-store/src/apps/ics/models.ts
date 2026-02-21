import * as z from "zod";
import { IcsAdminAllKeys } from "./translations/types";

export const icsLinkCalendarSourceSchema = z.object({
  link: z
    .url("app_ics_admin.validation.invalidUrl" satisfies IcsAdminAllKeys)
    .max(4096, "app_ics_admin.validation.invalidUrl" satisfies IcsAdminAllKeys),
});

export type IcsLinkCalendarSource = z.infer<typeof icsLinkCalendarSourceSchema>;
