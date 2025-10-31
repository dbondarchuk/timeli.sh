import { renderUserEmailTemplate } from "@vivid/email-builder/static";
import { Language } from "@vivid/i18n";
import { template } from "@vivid/utils";
import { UserEmailTemplates } from ".";
import { EmailTemplateKey } from "./types";

export const getEmailTemplate = async (
  type: EmailTemplateKey,
  language: Language,
  url: string,
  args: Record<string, any>,
  appointmentId?: string,
  customerId?: string,
) => {
  const templateContent =
    UserEmailTemplates[language]?.[type] ?? UserEmailTemplates["en"][type];

  const subjectTemplate = templateContent.subject;

  const buttonTexts =
    UserEmailTemplates[language]?.buttonTexts ??
    UserEmailTemplates["en"].buttonTexts;

  const subject = template(subjectTemplate, args);

  const description = await renderUserEmailTemplate(
    {
      ...templateContent,
      bottomButtons: [
        appointmentId
          ? {
              text: buttonTexts.viewAppointment,
              url: `${url}/dashboard/appointments/${appointmentId}`,
            }
          : undefined,
        customerId
          ? {
              text: buttonTexts.viewCustomer,
              url: `${url}/dashboard/customers/${customerId}`,
            }
          : undefined,
      ],
    },
    args,
  );

  return {
    template: description,
    subject,
  };
};
