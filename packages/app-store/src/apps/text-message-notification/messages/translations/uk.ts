import { TextMessageNotificationMessage } from "../types";

export const UkTextMessageNotificationMessages: TextMessageNotificationMessage =
  {
    newAppointmentRequested: `Привіт {{config.name}},
{{customer.name}} запитав новий запис для {{option.name}} {{#duration.hours}}{{.}}год {{/duration.hours}}{{#duration.minutes}}{{.}}хв{{/duration.minutes}} на {{dateTime.full}}.{{#totalPriceFormatted}} Загальна ціна \${{.}}.{{/totalPriceFormatted}}{{#totalAmountPaidFormatted}} Сплачено \${{.}}.{{/totalAmountPaidFormatted}}
Відповідайте{{#confirmed}} Y для підтвердження,{{/confirmed}} N для відхилення`,
    unknownAppointment: "Невідомий запис",
    unknownOption:
      "Невідома опція. Відповідайте{{#confirmed}} Y для підтвердження,{{/confirmed}} N для відхилення",
    appointmentConfirmed: `Привіт {{config.name}},
Запис {{customer.name}} для {{option.name}} на {{dateTime.full}} був підтверджений.
Дякуємо`,
    appointmentDeclined: `Привіт {{config.name}},
Запис {{customer.name}} для {{option.name}} на {{dateTime.full}} був відхилений/скасований.
Дякуємо`,
  };
