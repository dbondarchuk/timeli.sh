import { NavItemGroup } from "@timelish/types";
import {
  ArrowDownToLine,
  BadgeDollarSign,
  Blocks,
  BookUser,
  Boxes,
  Brush,
  CalendarClock,
  CalendarFold,
  CalendarRange,
  Code2,
  Cog,
  Globe,
  Grid2X2Plus,
  HandPlatter,
  Instagram,
  LayoutDashboard,
  LayoutTemplate,
  MailSearch,
  Paintbrush,
  PanelBottom,
  PanelTop,
  Paperclip,
  Send,
  Settings,
  Store,
  TextCursorInput,
} from "lucide-react";

export const navItems: NavItemGroup[] = [
  {
    id: "overview",
    title: "admin.navigation.overview",
    children: [
      {
        id: "dashboard",
        title: "admin.navigation.dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard />,
        label: "admin.navigation.dashboard",
      },
    ],
  },
  {
    id: "appointments",
    title: "admin.navigation.appointments",
    children: [
      {
        id: "appointments",
        title: "admin.navigation.appointments",
        href: "/dashboard/appointments",
        icon: <CalendarFold />,
        label: "admin.navigation.appointments",
      },
      {
        id: "schedule",
        title: "admin.navigation.schedule",
        icon: <CalendarRange />,
        items: [
          {
            id: "schedule-base",
            title: "admin.navigation.defaultSchedule",
            href: "/dashboard/settings/schedule",
            label: "admin.navigation.defaultSchedule",
            icon: <CalendarRange />,
          },
        ],
      },
      {
        id: "services",
        title: "admin.navigation.services",
        icon: <HandPlatter />,
        items: [
          {
            id: "services-fields",
            title: "admin.navigation.fields",
            href: "/dashboard/services/fields",
            label: "admin.navigation.fields",
            icon: <TextCursorInput />,
          },
          {
            id: "services-addons",
            title: "admin.navigation.addons",
            href: "/dashboard/services/addons",
            label: "admin.navigation.addons",
            icon: <Grid2X2Plus />,
          },
          {
            id: "services-options",
            title: "admin.navigation.options",
            href: "/dashboard/services/options",
            label: "admin.navigation.options",
            icon: <HandPlatter />,
          },
          {
            id: "discounts",
            title: "admin.navigation.discounts",
            href: "/dashboard/services/discounts",
            label: "admin.navigation.discounts",
            icon: <BadgeDollarSign />,
          },
        ],
      },
    ],
  },
  {
    id: "customers",
    title: "admin.navigation.customers",
    children: [
      {
        id: "customers",
        title: "admin.navigation.customers",
        href: "/dashboard/customers",
        icon: <BookUser />,
        label: "admin.navigation.customers",
      },
    ],
  },
  {
    id: "website",
    title: "admin.navigation.website",
    children: [
      {
        id: "pages",
        title: "admin.navigation.pages",
        href: "/dashboard/pages",
        icon: <Globe />,
        label: "admin.navigation.pages",
      },
      {
        id: "assets",
        title: "admin.navigation.assets",
        href: "/dashboard/assets",
        icon: <Paperclip />,
        label: "admin.navigation.assets",
      },

      {
        id: "appearance",
        title: "admin.navigation.appearance",
        icon: <Paintbrush />,
        items: [
          {
            id: "appearance-styling",
            title: "admin.navigation.styling",
            href: "/dashboard/appearence/styling",
            icon: <Brush />,
            label: "admin.navigation.styling",
          },
          {
            id: "appearence-scripts",
            title: "admin.navigation.scripts",
            href: "/dashboard/appearence/scripts",
            icon: <Code2 />,
            label: "admin.navigation.scripts",
          },
          {
            id: "appearance-page-headers",
            title: "admin.navigation.pageHeaders",
            href: "/dashboard/pages/headers",
            icon: <PanelTop />,
            label: "admin.navigation.pageHeaders",
          },
          {
            id: "appearance-page-footers",
            title: "admin.navigation.pageFooters",
            href: "/dashboard/pages/footers",
            icon: <PanelBottom />,
            label: "admin.navigation.pageFooters",
          },
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "admin.navigation.settings",
    children: [
      {
        id: "settings",
        title: "admin.navigation.settings",
        icon: <Settings />,
        items: [
          {
            id: "settings-general",
            title: "admin.navigation.general",
            href: "/dashboard/settings/general",
            icon: <Cog />,
            label: "admin.navigation.general",
          },
          {
            id: "settings-social",
            title: "admin.navigation.social",
            href: "/dashboard/settings/social",
            icon: <Instagram />,
            label: "admin.navigation.social",
          },
          {
            id: "settings-appointments",
            title: "admin.navigation.appointments",
            href: "/dashboard/settings/appointments",
            icon: <CalendarClock />,
            label: "admin.navigation.appointments",
          },
        ],
      },

      {
        id: "communications",
        icon: <Send />,
        title: "admin.navigation.communications",
        items: [
          {
            id: "templates",
            title: "admin.navigation.templates",
            href: "/dashboard/templates",
            icon: <LayoutTemplate />,
            label: "admin.navigation.templates",
          },
          {
            id: "communications-logs",
            title: "admin.navigation.logs",
            href: "/dashboard/communication-logs",
            icon: <MailSearch />,
            label: "admin.navigation.communicationLogs",
          },
        ],
      },
      {
        id: "apps",
        title: "admin.navigation.apps",
        icon: <Blocks />,
        label: "admin.navigation.apps",
        items: [
          {
            id: "apps-installed",
            title: "admin.navigation.installedApps",
            href: "/dashboard/apps",
            icon: <ArrowDownToLine />,
            label: "admin.navigation.installedApps",
          },
          {
            id: "apps-store",
            title: "admin.navigation.store",
            href: "/dashboard/apps/store",
            icon: <Store />,
            label: "admin.navigation.store",
          },
          {
            id: "apps-default",
            title: "admin.navigation.defaultApps",
            href: "/dashboard/apps/default",
            icon: <Boxes />,
            label: "admin.navigation.defaultApps",
          },
        ],
      },
    ],
  },
];

// export const navItems: NavItemWithOptionalChildren[] = [

// ];
