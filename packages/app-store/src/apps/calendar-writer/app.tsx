import { App } from "@vivid/types";
import { CalendarPlus } from "lucide-react";
import { CALENDAR_WRITER_APP_NAME } from "./const";
import { CalendarWriterAppSetup } from "./setup";
import {
  CalendarWriterAdminKeys,
  CalendarWriterAdminNamespace,
} from "./translations/types";

export const CalendarWriterApp: App<
  CalendarWriterAdminNamespace,
  CalendarWriterAdminKeys
> = {
  name: CALENDAR_WRITER_APP_NAME,
  displayName: "app_calendar-writer_admin.app.displayName",
  category: ["apps.categories.notifications"],
  scope: ["appointment-hook"],
  type: "basic",
  Logo: ({ className }) => <CalendarPlus className={className} />,
  SetUp: (props) => <CalendarWriterAppSetup {...props} />,
  isFeatured: false,
  isHidden: false,
  dontAllowMultiple: false,
  description: {
    text: "app_calendar-writer_admin.app.description",
  },
};
