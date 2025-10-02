import { EmailTemplates } from "../types";

const getText = (customText: string) => `
Привіт {{config.name}},

${customText}

Запитаний {{ requestedAt.full }}

Клієнт: [{{ customer.name }}]({{ config.url }}/admin/dashboard/customers/{{customerId}})

Ім'я: {{ fields.name }}

Email: {{ fields.email }}

Телефон: {{ fields.phone }}

{{#restFields}}

{{label}} ({{name}}): {{ value }}

{{/restFields}} {{#images}}

![{{description}}]({{ config.url }}/assets/{{filename}})

{{filename}}

{{/images}} {{#files}}

Файл: [{{filename}}]({{ config.url }}/assets/{{filename}})

{{/files}}

Обрана опція: {{ option.name }}

Обрані додатки:

{{#addons}}
1. {{name}}
{{/addons}}
{{^addons}}
- Жодного
{{/addons}}

Час: {{ dateTime.full}}

Тривалість: {{#duration.hours}}{{.}} год {{/duration.hours}}{{#duration.minutes}}{{.}} хв{{/duration.minutes}}

{{#discount}}

Промокод: {{code}} (-\${{discountAmountFormatted}}) ([{{name}}]({{ config.url }}/admin/dashboard/services/discounts/{{id}}))

{{/discount}} {{#totalPriceFormatted}}

Ціна: \${{.}}

{{/totalPriceFormatted}} 

{{#totalAmountLeft}}

Платежі:

{{#payments}}
 1. {{#appName}}{{.}}{{/appName}}{{^appName}}{{#isOnline}}Онлайн{{/isOnline}}{{#isCash}}Готівка{{/isCash}}{{#isInPersonCard}}Картка{{/isInPersonCard}}{{/appName}} ({{#isTips}}Чаєві{{/isTips}}{{#isOther}}Інше{{/isOther}}{{#isDeposit}}Депозит{{/isDeposit}}{{#isRescheduleFee}}Плата за перенос{{/isRescheduleFee}}{{#isCancellationFee}}Плата за відміну{{/isCancellationFee}}{{#isPayment}}Платіж{{/isPayment}}) {{paidAt.full}}: \${{amountFormatted}} {{#totalRefundedFormatted}} (-\${{totalRefundedFormatted}} повернено, \${{amountLeftFormatted}} залишилок) {{/totalRefundedFormatted}}
{{/payments}}
{{^payments}}
- Жодного
{{/payments}}

Зараз сплачено: \${{totalAmountLeftFormatted}}
{{/totalAmountLeft}}
{{#totalAmountLeftToPay}}
Залишок до сплати: \${{totalAmountLeftToPayFormatted}}
{{/totalAmountLeftToPay}}
`;

export const UkEmailTemplates: EmailTemplates = {
  confirmed: {
    title: "Запис на {{option.name}} був підтверджений.",
    text: getText("Запис був підтверджений вами."),
  },
  declined: {
    title: "Запис на {{option.name}} був відхилений.",
    text: getText("Запис був відхилений вами."),
  },
  cancelledByCustomer: {
    title: "Запис на {{option.name}} був скасований.",
    text: getText("Запис був скасований клієнтом."),
  },
  rescheduledByCustomer: {
    title: "Запис на {{option.name}} був перенесений.",
    text: getText(
      "Запис на {{option.name}} від {{fields.name}} був перенесений клієнтом на {{dateTime.full}}, тривалість {{#duration.hours}}{{.}} год {{/duration.hours}}{{#duration.minutes}}{{.}} хв{{/duration.minutes}}",
    ),
  },
  rescheduled: {
    title: "Запис був перенесений на {{dateTime.full}}",
    text: getText(
      "Запис на {{option.name}} від {{fields.name}} був перенесений на {{dateTime.full}}, тривалість {{#duration.hours}}{{.}} год {{/duration.hours}}{{#duration.minutes}}{{.}} хв{{/duration.minutes}}",
    ),
  },
  "auto-confirmed": {
    title: "Запис на {{option.name}} був запитаний і автоматично підтверджений",
    text: getText(
      "Новий запис був запитаний на веб-сайті і автоматично підтверджений.",
    ),
  },
  pending: {
    title: "Запит на запис для {{option.name}}",
    text: getText(
      "Новий запис був запитаний на веб-сайті для {{option.name}}.",
    ),
  },
  subject: "{{fields.name}} на {{option.name}} на {{dateTime.full}}",
  eventTitle: "{{fields.name}} на {{option.name}}",
  buttonTexts: {
    viewAppointment: "Переглянути запис",
    decline: "Відхилити",
    confirm: "Підтвердити",
  },
};
