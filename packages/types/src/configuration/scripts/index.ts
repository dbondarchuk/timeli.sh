import * as z from "zod";
import { resourceSchema } from "../resources";

export const scriptsConfigurationSchema = z.object({
  header: z.array(resourceSchema).optional(),
  footer: z.array(resourceSchema).optional(),
});

export type ScriptsConfiguration = z.infer<typeof scriptsConfigurationSchema>;
