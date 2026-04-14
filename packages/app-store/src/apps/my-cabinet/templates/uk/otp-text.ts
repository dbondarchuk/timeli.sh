import { TemplatesTemplate } from "@timelish/types";

export const myCabinetOtpTextTemplate: TemplatesTemplate = {
  name: "OTP SMS для Мого кабінету",
  type: "text-message",
  value:
    "{{config.name}}: ваш код підтвердження - {{otp}}. Дійсний 5 хвилин. Не передавайте код нікому.",
};
