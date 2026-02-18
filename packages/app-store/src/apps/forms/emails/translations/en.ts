import { EmailTemplates } from "../types";

const notifyFormResponseText = `
A new response was submitted for **{{form.name}}**.

Submitted on {{response.createdAtFormatted}}

{{#customer}}
Customer: [{{name}}]({{ adminUrl }}/dashboard/customers/{{_id}})
{{/customer}}

{{#response.url}}
URL: [{{.}}]({{.}})
{{/response.url}}

{{#response.ip}}
IP: {{.}}
{{/response.ip}}

{{#response.userAgent}}
Browser/version: {{.}}
{{/response.userAgent}}


**Answers:**

{{#response.answers}}
- **{{label}}:** {{valueFormatted}}
{{/response.answers}}
`;

export const EnEmailTemplates: EmailTemplates = {
  "user-notify-form-response": {
    title: "New form response",
    text: notifyFormResponseText,
    subject: "New form response: {{form.name}}",
  },
  buttonTexts: {
    viewAllResponses: "View all responses",
    viewResponse: "View response",
  },
  checkboxText: {
    yes: "Yes",
    no: "No",
  },
};
