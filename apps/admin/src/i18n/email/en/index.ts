import { EmailTemplate } from "../types";
import { ChangeEmailTemplate } from "./change-email";
import { EmailVerificationTemplate } from "./email-verification";
import { ResetPasswordTemplate } from "./reset-password";

export const enEmailTemplates: EmailTemplate = {
  emailVerification: EmailVerificationTemplate,
  resetPassword: ResetPasswordTemplate,
  changeEmail: ChangeEmailTemplate,
};
