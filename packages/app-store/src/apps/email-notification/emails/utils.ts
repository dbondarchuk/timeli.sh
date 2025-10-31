import { renderUserEmailTemplate } from "@vivid/email-builder/static";
import { Language } from "@vivid/i18n";
import { Appointment } from "@vivid/types";
import { AppointmentStatusToICalMethodMap, template } from "@vivid/utils";
import { UserEmailTemplates } from ".";

export const getEmailTemplate = async (
  status:
    | keyof typeof AppointmentStatusToICalMethodMap
    | "auto-confirmed"
    | "cancelledByCustomer"
    | "rescheduledByCustomer",
  language: Language,
  url: string,
  appointment: Appointment,
  args: Record<string, any>,
) => {
  const templateContent =
    UserEmailTemplates[language]?.[status] ?? UserEmailTemplates["en"][status];

  const subjectTemplate =
    UserEmailTemplates[language]?.subject ?? UserEmailTemplates["en"].subject;

  const buttonTexts =
    UserEmailTemplates[language]?.buttonTexts ??
    UserEmailTemplates["en"].buttonTexts;

  const eventTitleTemplate =
    UserEmailTemplates[language]?.eventTitle ??
    UserEmailTemplates["en"].eventTitle;

  const eventTitle = template(eventTitleTemplate, args);
  const subject = template(subjectTemplate, args);

  const description = await renderUserEmailTemplate(
    {
      ...templateContent,
      topButtons: [
        {
          text: buttonTexts.viewAppointment,
          url: `${url}/dashboard/appointments/${appointment._id}`,
        },
      ],
      bottomButtons: [
        appointment.status != "declined"
          ? {
              text: buttonTexts.decline,
              url: `${url}/dashboard/appointments/${appointment._id}/decline`,
              backgroundColor: "#FF0000",
            }
          : undefined,
        appointment.status === "pending"
          ? {
              text: buttonTexts.confirm,
              url: `${url}/dashboard/appointments/${appointment._id}/confirm`,
              backgroundColor: "#0008FF",
            }
          : undefined,
      ],
    },
    args,
  );

  return {
    template: description,
    subject,
    eventTitle,
  };
};
