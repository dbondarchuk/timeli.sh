import { Language } from "@timelish/i18n";
import { WithDatabaseId } from "../database";

export type UserRole = "owner" | "admin" | "staff" | "viewer";

export type User = WithDatabaseId<{
  email: string;
  name: string;
  passwordHash: string;
  language: Language;
  companyId: string; // Link user to company
  role: UserRole;
  permissions: string[];
  createdAt: Date;
  lastLoginAt?: Date;
}>;
