import { renderUserEmailTemplate } from "@timelish/email-builder/static";
import { Language } from "@timelish/i18n";
import { template } from "@timelish/utils";
import { UserEmailTemplates } from ".";
import { EmailTemplateKey } from "./types";

export const getEmailTemplate = async (
  type: EmailTemplateKey,
  language: Language,
  adminUrl: string,
  args: Record<string, any>,
  formId: string,
) => {
  const templateContent =
    UserEmailTemplates[language]?.[type] ?? UserEmailTemplates.en[type];

  const subjectTemplate = templateContent.subject;
  const subject = template(subjectTemplate, args);

  const buttonTexts =
    UserEmailTemplates[language]?.buttonTexts ??
    UserEmailTemplates.en.buttonTexts;

  const checkboxText =
    UserEmailTemplates[language]?.checkboxText ??
    UserEmailTemplates.en.checkboxText;

  const description = await renderUserEmailTemplate(
    {
      ...templateContent,
      bottomButtons: [
        {
          text: buttonTexts.viewResponse,
          url: `${adminUrl}/dashboard/forms/responses/edit?id=${formId}`,
        },
        {
          text: buttonTexts.viewAllResponses,
          url: `${adminUrl}/dashboard/forms/responses?formId=${formId}`,
        },
      ],
    },
    { ...args, checkboxText },
  );

  return {
    template: description,
    subject,
  };
};
