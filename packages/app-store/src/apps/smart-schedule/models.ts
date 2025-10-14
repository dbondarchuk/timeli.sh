import { asOptionalField } from "@vivid/types";
import { z } from "zod";

export const smartScheduleConfigurationSchema = z.object({
  allowSkipBreak: z.coerce.boolean().optional(),
  preferBackToBack: z.coerce.boolean().optional(),
  allowSmartSlotStarts: z.coerce.boolean().optional(),
  maximizeForOption: asOptionalField(z.string()),
});

export type SmartScheduleConfiguration = z.infer<
  typeof smartScheduleConfigurationSchema
>;
