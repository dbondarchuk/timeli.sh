import { NavItemGroup } from "@vivid/types";
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
    title: "admin.navigation.overview",
    children: [
      {
        id: "dashboard",
        title: "admin.navigation.dashboard",
        href: "/admin/dashboard",
        icon: <LayoutDashboard />,
        label: "admin.navigation.dashboard",
      },
    ],
  },
  {
    title: "admin.navigation.appointments",
    children: [
      {
        id: "appointments",
        title: "admin.navigation.appointments",
        href: "/admin/dashboard/appointments",
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
            href: "/admin/dashboard/settings/schedule",
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
            href: "/admin/dashboard/services/fields",
            label: "admin.navigation.fields",
            icon: <TextCursorInput />,
          },
          {
            id: "services-addons",
            title: "admin.navigation.addons",
            href: "/admin/dashboard/services/addons",
            label: "admin.navigation.addons",
            icon: <Grid2X2Plus />,
          },
          {
            id: "services-options",
            title: "admin.navigation.options",
            href: "/admin/dashboard/services/options",
            label: "admin.navigation.options",
            icon: <HandPlatter />,
          },
          {
            id: "discounts",
            title: "admin.navigation.discounts",
            href: "/admin/dashboard/services/discounts",
            label: "admin.navigation.discounts",
            icon: <BadgeDollarSign />,
          },
        ],
      },
    ],
  },
  {
    title: "admin.navigation.customers",
    children: [
      {
        id: "customers",
        title: "admin.navigation.customers",
        href: "/admin/dashboard/customers",
        icon: <BookUser />,
        label: "admin.navigation.customers",
      },
    ],
  },
  {
    title: "admin.navigation.website",
    children: [
      {
        id: "pages",
        title: "admin.navigation.pages",
        href: "/admin/dashboard/pages",
        icon: <Globe />,
        label: "admin.navigation.pages",
      },
      {
        id: "assets",
        title: "admin.navigation.assets",
        href: "/admin/dashboard/assets",
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
            href: "/admin/dashboard/appearence/styling",
            icon: <Brush />,
            label: "admin.navigation.styling",
          },
          {
            id: "appearance-page-headers",
            title: "admin.navigation.pageHeaders",
            href: "/admin/dashboard/pages/headers",
            icon: <PanelTop />,
            label: "admin.navigation.pageHeaders",
          },
          {
            id: "appearance-page-footers",
            title: "admin.navigation.pageFooters",
            href: "/admin/dashboard/pages/footers",
            icon: <PanelBottom />,
            label: "admin.navigation.pageFooters",
          },
        ],
      },
    ],
  },
  {
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
            href: "/admin/dashboard/settings/general",
            icon: <Cog />,
            label: "admin.navigation.general",
          },
          {
            id: "settings-social",
            title: "admin.navigation.social",
            href: "/admin/dashboard/settings/social",
            icon: <Instagram />,
            label: "admin.navigation.social",
          },
          {
            id: "settings-scripts",
            title: "admin.navigation.scripts",
            href: "/admin/dashboard/settings/scripts",
            icon: <Code2 />,
            label: "admin.navigation.scripts",
          },
          {
            id: "settings-appointments",
            title: "admin.navigation.appointments",
            href: "/admin/dashboard/settings/appointments",
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
            href: "/admin/dashboard/templates",
            icon: <LayoutTemplate />,
            label: "admin.navigation.templates",
          },
          {
            id: "communications-logs",
            title: "admin.navigation.logs",
            href: "/admin/dashboard/communication-logs",
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
            href: "/admin/dashboard/apps",
            icon: <ArrowDownToLine />,
            label: "admin.navigation.installedApps",
          },
          {
            id: "apps-store",
            title: "admin.navigation.store",
            href: "/admin/dashboard/apps/store",
            icon: <Store />,
            label: "admin.navigation.store",
          },
          {
            id: "apps-default",
            title: "admin.navigation.defaultApps",
            href: "/admin/dashboard/apps/default",
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
