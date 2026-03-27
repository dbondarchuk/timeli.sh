import { Language } from "@timelish/i18n";
import type { ObjectId } from "mongodb";

export type UserRole = "owner" | "admin" | "staff" | "viewer";

export type User = {
  _id: ObjectId;
  email: string;
  name: string;
  organizationId: string; // Link user to organization
  role: UserRole;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  language: Language;
  image?: string | null;
  bio?: string | null;
  phone: string;
};
