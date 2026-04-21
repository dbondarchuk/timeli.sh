import { Language } from "@timelish/i18n";
import type { ObjectId } from "mongodb";
import type { CalendarSourcesConfiguration } from "../configuration/booking/calendar-source";

export const USER_ROLES = ["owner", "admin", "staff", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

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
  calendarSources?: CalendarSourcesConfiguration;
};
