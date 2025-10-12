export type EmailTemplate = {
  title: string;
  text: string;
  previewText?: string;
};

export type EmailTemplates = {
  [key in "newWaitlistEntry"]: EmailTemplate;
} & {
  subject: string;
  buttonTexts: Record<"createAppointment" | "viewWaitlist" | "dismiss", string>;
};
