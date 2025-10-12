import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { SMTP_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type SmtpAdminKeys = Leaves<typeof admin>;
export const smtpAdminNamespace = `app_${SMTP_APP_NAME}_admin` as const;

export type SmtpAdminNamespace = typeof smtpAdminNamespace;

export type SmtpAdminAllKeys = AllKeys<SmtpAdminNamespace, SmtpAdminKeys>;
