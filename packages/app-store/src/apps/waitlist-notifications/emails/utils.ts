import { renderUserEmailTemplate } from "@timelish/email-builder/static";
import { Language } from "@timelish/i18n";
import { template } from "@timelish/utils";
import { UserEmailTemplates } from ".";
import { WaitlistEntry } from "../../waitlist/models/waitlist";

export const getEmailTemplate = async (
  status: "newWaitlistEntry",
  language: Language,
  url: string,
  entry: WaitlistEntry,
  args: Record<string, any>,
) => {
  const templateContent =
    UserEmailTemplates[language]?.[status] ?? UserEmailTemplates["en"][status];

  const subjectTemplate = templateContent.title;

  const buttonTexts =
    UserEmailTemplates[language]?.buttonTexts ??
    UserEmailTemplates["en"].buttonTexts;

  const subject = template(subjectTemplate, args);

  const description = await renderUserEmailTemplate(
    {
      ...templateContent,
      topButtons: [
        {
          text: buttonTexts.viewWaitlist,
          url: `${url}/dashboard/waitlist`,
        },
      ],
      bottomButtons: [
        {
          text: buttonTexts.dismiss,
          url: `${url}/dashboard/waitlist/dismiss?id=${entry._id}`,
          backgroundColor: "#ef4444",
        },
        {
          text: buttonTexts.createAppointment,
          url: `${url}/dashboard/waitlist/appointment/new?id=${entry._id}`,
          backgroundColor: "#0066ff",
        },
      ],
    },
    args,
  );

  return {
    template: description,
    subject,
  };
};
