import { AppMenuItem } from "@timelish/types";
import { BellRing } from "lucide-react";
import { EditScheduledNotificationPage } from "./edit-page";
import { NewScheduledNotificationPage } from "./new-page";
import { ScheduledNotificationsPage } from "./page";
import {
  ScheduledNotificationsAdminAllKeys,
  ScheduledNotificationsAdminKeys,
  ScheduledNotificationsAdminNamespace,
} from "./translations/types";

const scheduledNotificationBreadcrumb = {
  title:
    "app_scheduled-notifications_admin.navigation.main.title" as ScheduledNotificationsAdminAllKeys,
  link: "/dashboard/communications/scheduled-notifications",
};

export const ScheduledNotificationsMenuItems: AppMenuItem<
  ScheduledNotificationsAdminNamespace,
  ScheduledNotificationsAdminKeys
>[] = [
  {
    href: "communications/scheduled-notifications",
    parent: "communications",
    id: "communications-scheduled-notifications",
    order: 100,
    notScrollable: true,
    label: "app_scheduled-notifications_admin.navigation.main.title",
    icon: <BellRing />,
    Page: (props) => <ScheduledNotificationsPage appId={props.appId} />,
    pageBreadcrumbs: [scheduledNotificationBreadcrumb],
    pageTitle: "app_scheduled-notifications_admin.navigation.main.title",
    pageDescription:
      "app_scheduled-notifications_admin.navigation.main.description",
  },
  {
    href: "communications/scheduled-notifications/new",
    parent: "communications",
    id: "communications-scheduled-notifications-new",
    isHidden: true,
    label: "app_scheduled-notifications_admin.navigation.main.title",
    icon: <BellRing />,
    Page: (props) => <NewScheduledNotificationPage appId={props.appId} />,
    pageBreadcrumbs: [
      scheduledNotificationBreadcrumb,
      {
        title: "app_scheduled-notifications_admin.navigation.new.title",
        link: "/dashboard/communications/scheduled-notifications/new",
      },
    ],
    pageTitle: "app_scheduled-notifications_admin.navigation.new.title",
    pageDescription:
      "app_scheduled-notifications_admin.navigation.new.description",
  },
  {
    href: "communications/scheduled-notifications/edit",
    parent: "communications",
    id: "communications-scheduled-notifications-new",
    isHidden: true,
    label: "app_scheduled-notifications_admin.navigation.main.title",
    icon: <BellRing />,
    Page: (props) => <EditScheduledNotificationPage appId={props.appId} />,
    pageBreadcrumbs: [
      scheduledNotificationBreadcrumb,
      {
        title: "app_scheduled-notifications_admin.navigation.edit.title",
        link: "/dashboard/communications/scheduled-notifications/edit",
      },
    ],
    pageTitle: "app_scheduled-notifications_admin.navigation.edit.title",
    pageDescription:
      "app_scheduled-notifications_admin.navigation.edit.description",
  },
];
