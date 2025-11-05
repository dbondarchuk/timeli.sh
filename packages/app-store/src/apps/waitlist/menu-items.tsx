import { AppMenuItem } from "@timelish/types";
import { CalendarClock } from "lucide-react";
import { WaitlistDismissPage } from "./pages/dismiss";
import { WaitlistPage } from "./pages/main";
import { WaitlistNewAppointmentPage } from "./pages/new-appointment";
import {
  WaitlistAdminAllKeys,
  WaitlistAdminKeys,
  WaitlistAdminNamespace,
} from "./translations/types";

const waitlistBreadcrumb: {
  title: WaitlistAdminAllKeys;
  link: string;
} = {
  title: "app_waitlist_admin.app.pages.main.label",
  link: "/dashboard/waitlist",
};

export const WaitlistMenuItems: AppMenuItem<
  WaitlistAdminNamespace,
  WaitlistAdminKeys
>[] = [
  {
    href: "waitlist",
    parent: "appointments",
    id: "appointments-waitlist",
    order: 100,
    notScrollable: true,
    label: "app_waitlist_admin.app.pages.main.label",
    icon: <CalendarClock />,
    Page: (props) => <WaitlistPage {...props} />,
    pageBreadcrumbs: [waitlistBreadcrumb],
    pageTitle: "app_waitlist_admin.app.pages.main.title",
    pageDescription: "app_waitlist_admin.app.pages.main.description",
  },
  {
    href: "waitlist/dismiss",
    parent: "waitlist",
    id: "waitlist-dismiss",
    isHidden: true,
    label: "app_waitlist_admin.app.pages.main.label",
    icon: <CalendarClock />,
    Page: (props) => <WaitlistDismissPage {...props} />,
    pageBreadcrumbs: [waitlistBreadcrumb],
    pageTitle: "app_waitlist_admin.app.pages.main.title",
    pageDescription: "app_waitlist_admin.app.pages.main.description",
  },
  {
    href: "waitlist/appointment/new",
    parent: "waitlist",
    id: "waitlist-appointment-new",
    isHidden: true,
    label: "app_waitlist_admin.app.pages.main.label",
    icon: <CalendarClock />,
    Page: (props) => <WaitlistNewAppointmentPage {...props} />,
    pageBreadcrumbs: [waitlistBreadcrumb],
    pageTitle: "app_waitlist_admin.app.pages.main.title",
    pageDescription: "app_waitlist_admin.app.pages.main.description",
  },
];
