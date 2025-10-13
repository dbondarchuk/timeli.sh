import type { AllKeys, I18nNamespaces } from "@vivid/i18n";
import type { Extandable } from "@vivid/types";
import type { ReactElement, ReactNode } from "react";

export type AppScope = Extandable<
  | "calendar-read"
  | "calendar-write"
  | "mail-send"
  | "text-message-send"
  | "text-message-respond"
  | "appointment-hook"
  | "customer-hook"
  | "payment-hook"
  | "assets-storage"
  | "scheduled"
  | "schedule"
  | "dashboard-tab"
  | "payment"
  | "ui-components"
>;

export type AppSetupProps = {
  onSuccess: () => void;
  onError: (
    error: string | { key: string; args?: Record<string, any> },
  ) => void;
  appId?: string;
};

export type ComplexAppPageProps = {
  appId: string;
};

export type AppLogoProps = {
  className?: string;
};

type BaseApp<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = {
  name: string;
  displayName: AllKeys<T, CustomKeys>;
  category: (AllKeys<T, CustomKeys> | AllKeys<"apps">)[];
  scope: AppScope[];
  description: {
    text: AllKeys<T, CustomKeys>;
    images?: string[];
  };
  Logo: (props: AppLogoProps) => ReactNode;
  isFeatured?: boolean;
};

export type AppMenuItem<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = {
  parent?: string;
  order?: number;
  id: string;
  label: AllKeys<T, CustomKeys>;
  href: string;
  icon: ReactElement;
  Page: (props: ComplexAppPageProps) => ReactNode;
  pageBreadcrumbs?: {
    link: string;
    title: AllKeys<T, CustomKeys>;
  }[];
  notScrollable?: boolean;
  isHidden?: boolean;
  pageTitle?: AllKeys<T, CustomKeys>;
  pageDescription?: AllKeys<T, CustomKeys>;
};

export type OAuthApp<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = BaseApp<T, CustomKeys> & {
  type: "oauth";
  SetUp: (props: AppSetupProps) => ReactNode;
  dontAllowMultiple?: false;
  isHidden?: false;
};

export type BasicApp<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = BaseApp<T, CustomKeys> & {
  type: "basic";
  SetUp: (props: AppSetupProps) => ReactNode;
  dontAllowMultiple?: boolean;
  isHidden?: boolean;
};

export type ComplexApp<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = BaseApp<T, CustomKeys> & {
  type: "complex";
  dontAllowMultiple: true;
  settingsHref?: string;
  isHidden?: boolean;
};

export type SystemApp<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = BaseApp<T, CustomKeys> & {
  type: "system";
  dontAllowMultiple: true;
  isHidden?: true;
};

export type App<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> =
  | OAuthApp<T, CustomKeys>
  | BasicApp<T, CustomKeys>
  | ComplexApp<T, CustomKeys>
  | SystemApp<T, CustomKeys>;
