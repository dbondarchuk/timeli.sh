import * as z from "zod";
import { CarddavAdminAllKeys } from "./translations/types";

export const carddavConfigurationSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
});

export type CarddavConfiguration = z.infer<typeof carddavConfigurationSchema>;

