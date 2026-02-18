import { EmailTemplates } from "../types";

const notifyFormResponseText = `
Нова відповідь надійшла для форми **{{form.name}}**.

Надіслано: {{response.createdAtFormatted}}

{{#customer}}
Клієнт: [{{name}}]({{ adminUrl }}/dashboard/customers/{{_id}})
{{/customer}}

{{#response.url}}
URL: [{{.}}]({{.}})
{{/response.url}}

{{#response.ip}}
IP: {{.}}
{{/response.ip}}

{{#response.userAgent}}
Браузер/версія: {{.}}
{{/response.userAgent}}

**Відповіді:**

{{#response.answers}}
- **{{label}}:** {{valueFormatted}}
{{/response.answers}}
`;

export const UkEmailTemplates: EmailTemplates = {
  "user-notify-form-response": {
    title: "Нова відповідь на форму",
    text: notifyFormResponseText,
    subject: "Нова відповідь на форму: {{form.name}}",
  },
  buttonTexts: {
    viewAllResponses: "Переглянути всі відповіді",
    viewResponse: "Переглянути відповідь",
  },
  checkboxText: {
    yes: "Так",
    no: "Ні",
  },
};
