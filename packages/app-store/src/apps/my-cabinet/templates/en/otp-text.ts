import { TemplatesTemplate } from "@timelish/types";

export const myCabinetOtpTextTemplate: TemplatesTemplate = {
  name: "My Cabinet OTP Text",
  type: "text-message",
  value:
    "{{config.name}}: your verification code is {{otp}}. Valid for 5 minutes. Do not share this code with anyone.",
};
