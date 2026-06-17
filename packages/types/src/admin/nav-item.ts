import type { AllKeys } from "@timelish/i18n";
import type { ReactElement } from "react";
import type { BillingPlanTier } from "../billing/subscription-plan";

export interface NavItem {
  id: string;
  title: AllKeys;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: ReactElement;
  label?: AllKeys;
  description?: AllKeys;
  removeIfBecameParent?: boolean;
  /** Key matching `DashboardNotificationBadge.key` from the notifications SSE stream. */
  notificationsCountKey?: string;
  /** Lowest subscription tier required to show this item. Defaults to Free. */
  minimumPlanTier?: BillingPlanTier;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItem[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItem[];
}

export interface NavItemGroup {
  id:
    | "overview"
    | "appointments"
    | "financials"
    | "website"
    | "customers"
    | "settings"
    | "other";
  title: AllKeys;
  /** Lowest subscription tier required to show this group. Defaults to Free. */
  minimumPlanTier?: BillingPlanTier;
  children: NavItemWithOptionalChildren[];
}

export interface FooterItem {
  title: AllKeys;
  items: {
    title: AllKeys;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;
