import { zObjectId } from "@timelish/types";
import * as z from "zod";
import { MyCabinetAdminAllKeys } from "./translations/types";

export const myCabinetConfigurationSchema = z
  .object({
    otpEmailTemplateId: zObjectId(
      "app_my-cabinet_admin.validation.otpEmailTemplateId.required" satisfies MyCabinetAdminAllKeys,
    ),
    allowPhoneLogin: z.boolean().optional(),
    otpTextTemplateId: zObjectId().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.allowPhoneLogin && !value.otpTextTemplateId) {
      ctx.addIssue({
        code: "custom",
        path: ["otpTextTemplateId"],
        message:
          "app_my-cabinet_admin.validation.otpTextTemplateId.required_when_phone_enabled" satisfies MyCabinetAdminAllKeys,
      });
    }
  });

export type MyCabinetConfiguration = z.infer<typeof myCabinetConfigurationSchema>;
