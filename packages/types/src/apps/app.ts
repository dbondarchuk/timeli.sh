import type { AllKeys, I18nNamespaces } from "@timelish/i18n";
import type { ReactElement, ReactNode } from "react";
import type { Extandable } from "../utils/helpers";

export type AppScope = Extandable<
  | "calendar-read"
  | "calendar-write"
  | "mail-send"
  | "text-message-send"
  | "text-message-respond"
  | "appointment-hook"
  | "event-hook"
  | "customer-hook"
  | "payment-hook"
  // | "assets-storage"
  | "scheduled"
  | "schedule"
  | "dashboard-tab"
  | "customer-tab"
  | "payment"
  | "ui-components"
  | "availability-provider"
  | "meeting-url-provider"
  | "dashboard-notifier"
>;

export type AppSetupProps = {
  onSuccess: (doNotCloseDialog?: boolean) => void;
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
  };
  Logo: (props: AppLogoProps) => ReactNode;
  isFeatured?: boolean;
};

export type AppMenuItem<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = {
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
  hideHeading?: boolean;
  pageTitle?: AllKeys<T, CustomKeys>;
  pageDescription?: AllKeys<T, CustomKeys>;
} & (
  | {
      group: "overview" | "appointments" | "website" | "customers" | "settings";
      parent?: undefined;
    }
  | {
      group?: undefined;
      parent: string;
    }
);

export type OAuthApp<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = BaseApp<T, CustomKeys> & {
  type: "oauth";
  dontAllowMultiple?: false;
  isHidden?: false;
};

export type BasicApp<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = BaseApp<T, CustomKeys> & {
  type: "basic";
  dontAllowMultiple?: boolean;
  isHidden?: boolean;
};

export type BasicAppSetup = (props: AppSetupProps) => ReactNode;
export type ComplexAppSetup = (props: ComplexAppPageProps) => ReactNode;

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
