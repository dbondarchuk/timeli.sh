import { AppMenuItem } from "@timelish/types";
import { CalendarX2 } from "lucide-react";
import { BusyEventsAppSetup } from "./setup";
import {
  BusyEventsAdminKeys,
  BusyEventsAdminNamespace,
} from "./translations/types";

export const BusyEventsMenuItems: AppMenuItem<
  BusyEventsAdminNamespace,
  BusyEventsAdminKeys
>[] = [
  {
    href: "settings/schedule/busy-events",
    parent: "schedule",
    id: "schedule-busy-events",
    label: "app_busy-events_admin.navigation.busyEvents.label",
    pageTitle: "app_busy-events_admin.navigation.busyEvents.title",
    pageDescription: "app_busy-events_admin.navigation.busyEvents.description",
    pageBreadcrumbs: [
      {
        title: "app_busy-events_admin.navigation.busyEvents.label",
        link: "/dashboard/settings/schedule/busy-events",
      },
    ],
    icon: <CalendarX2 />,
    Page: (props) => <BusyEventsAppSetup {...props} />,
  },
];
