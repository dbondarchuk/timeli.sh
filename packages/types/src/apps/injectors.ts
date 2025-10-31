import { AllKeys, I18nNamespaces } from "@vivid/i18n";
import type { ReactNode } from "react";
import { IConnectedAppProps } from "./connected-app.props";

export type DashboardTabInjectorApp<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = {
  items: [
    {
      order: number;
      href: string;
      label: AllKeys<T, CustomKeys>;
      notificationsCountKey?: string;
      view: (props: {
        props: IConnectedAppProps;
        appId: string;
        searchParams: { [key: string]: string | string[] | undefined };
      }) => ReactNode;
    },
  ];
};
