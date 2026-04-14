import { TemplateTemplatesList } from "@timelish/types";
import { myCabinetOtpEmailTemplate as otpEmailEn } from "./en/otp-email";
import { myCabinetOtpTextTemplate as otpTextEn } from "./en/otp-text";
import { myCabinetOtpEmailTemplate as otpEmailUk } from "./uk/otp-email";
import { myCabinetOtpTextTemplate as otpTextUk } from "./uk/otp-text";

export const MyCabinetTemplates: TemplateTemplatesList = {
  "my-cabinet-otp-email": {
    en: otpEmailEn,
    uk: otpEmailUk,
  },
  "my-cabinet-otp-text": {
    en: otpTextEn,
    uk: otpTextUk,
  },
};
