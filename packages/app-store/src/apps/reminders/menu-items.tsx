import { AppMenuItem } from "@vivid/types";
import { BellRing } from "lucide-react";
import { EditReminderPage } from "./edit-page";
import { NewReminderPage } from "./new-page";
import { RemindersPage } from "./page";
import {
  RemindersAdminAllKeys,
  RemindersAdminKeys,
  RemindersAdminNamespace,
} from "./translations/types";

const reminderBreadcrumb = {
  title: "app_reminders_admin.navigation.main.title" as RemindersAdminAllKeys,
  link: "/admin/dashboard/communications/reminders",
};

export const remindersMenuItems: AppMenuItem<
  RemindersAdminNamespace,
  RemindersAdminKeys
>[] = [
  {
    href: "communications/reminders",
    parent: "communications",
    id: "communications-reminders",
    order: 100,
    notScrollable: true,
    label: "app_reminders_admin.navigation.main.title",
    icon: <BellRing />,
    Page: (props) => <RemindersPage appId={props.appId} />,
    pageBreadcrumbs: [reminderBreadcrumb],
    pageTitle: "app_reminders_admin.navigation.main.title",
    pageDescription: "app_reminders_admin.navigation.main.description",
  },
  {
    href: "communications/reminders/new",
    parent: "communications",
    id: "communications-reminders-new",
    isHidden: true,
    label: "app_reminders_admin.navigation.main.title",
    icon: <BellRing />,
    Page: (props) => <NewReminderPage appId={props.appId} />,
    pageBreadcrumbs: [
      reminderBreadcrumb,
      {
        title: "app_reminders_admin.navigation.new.title",
        link: "/admin/dashboard/communications/reminders/new",
      },
    ],
    pageTitle: "app_reminders_admin.navigation.new.title",
    pageDescription: "app_reminders_admin.navigation.new.description",
  },
  {
    href: "communications/reminders/edit",
    parent: "communications",
    id: "communications-reminders-new",
    isHidden: true,
    label: "app_reminders_admin.navigation.main.title",
    icon: <BellRing />,
    Page: (props) => <EditReminderPage appId={props.appId} />,
    pageBreadcrumbs: [
      reminderBreadcrumb,
      {
        title: "app_reminders_admin.navigation.edit.title",
        link: "/admin/dashboard/communications/reminders/edit",
      },
    ],
    pageTitle: "app_reminders_admin.navigation.edit.title",
    pageDescription: "app_reminders_admin.navigation.edit.description",
  },
];
