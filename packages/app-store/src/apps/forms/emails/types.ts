export type EmailTemplate = {
  title: string;
  text: string;
  previewText?: string;
  subject: string;
};

export type EmailTemplateKey = "user-notify-form-response";

export type EmailTemplates = {
  [key in EmailTemplateKey]: EmailTemplate;
} & {
  buttonTexts: Record<"viewAllResponses" | "viewResponse", string>;
  checkboxText: Record<"yes" | "no", string>;
};
