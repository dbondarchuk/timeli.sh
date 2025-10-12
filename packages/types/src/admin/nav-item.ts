import type { AllKeys } from "@vivid/i18n";
import type { ReactElement } from "react";

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
}

export interface NavItemWithChildren extends NavItem {
  items: NavItem[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItem[];
}

export interface NavItemGroup {
  title: AllKeys;
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
