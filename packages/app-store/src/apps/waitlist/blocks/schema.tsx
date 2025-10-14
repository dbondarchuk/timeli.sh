import { EditorDocumentBlocksDictionary } from "@vivid/builder";
import { WaitlistConfiguration } from "./waitlist/configuration";
import { WaitlistEditor } from "./waitlist/editor";
import { WaitlistPropsDefaults, WaitlistPropsSchema } from "./waitlist/schema";
import { WaitlistToolbar } from "./waitlist/toolbar";

import { AllKeys, BuilderKeys } from "@vivid/i18n";
import { CalendarClock, CalendarFold } from "lucide-react";
import {
  WaitlistAdminKeys,
  WaitlistAdminNamespace,
} from "../translations/types";
import { BookingWithWaitlistConfiguration } from "./booking-with-waitlist/configuration";
import { BookingWithWaitlistEditor } from "./booking-with-waitlist/editor";
import {
  BookingWithWaitlistPropsDefaults,
  BookingWithWaitlistPropsSchema,
} from "./booking-with-waitlist/schema";
import { BookingWithWaitlistToolbar } from "./booking-with-waitlist/toolbar";

export const WaitlistBlocksSchema = {
  Waitlist: WaitlistPropsSchema,
  BookingWithWaitlist: BookingWithWaitlistPropsSchema,
};

export const WaitlistBlocksAllowedInFooter = {
  Waitlist: false,
  BookingWithWaitlist: false,
};

export const WaitlistEditors: EditorDocumentBlocksDictionary<
  typeof WaitlistBlocksSchema
> = {
  Waitlist: {
    displayName:
      "app_waitlist_admin.block.waitlist.displayName" satisfies AllKeys<
        WaitlistAdminNamespace,
        WaitlistAdminKeys
      >,
    icon: <CalendarClock />,
    Editor: WaitlistEditor,
    Configuration: WaitlistConfiguration,
    Toolbar: WaitlistToolbar,
    defaultValue: WaitlistPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.booking" satisfies AllKeys<
      "builder",
      BuilderKeys
    >,
  },
  BookingWithWaitlist: {
    displayName:
      "app_waitlist_admin.block.bookingWithWaitlist.displayName" satisfies AllKeys<
        WaitlistAdminNamespace,
        WaitlistAdminKeys
      >,
    icon: <CalendarFold />,
    Editor: BookingWithWaitlistEditor,
    Configuration: BookingWithWaitlistConfiguration,
    Toolbar: BookingWithWaitlistToolbar,
    defaultValue: BookingWithWaitlistPropsDefaults,
    category: "builder.pageBuilder.blocks.categories.booking" satisfies AllKeys<
      "builder",
      BuilderKeys
    >,
  },
};

export const WaitlistBlocks = Object.fromEntries(
  Object.entries(WaitlistBlocksSchema).map(([key, schema]) => [
    key,
    {
      schema,
      editor: WaitlistEditors[key as keyof typeof WaitlistBlocksSchema],
      allowedInFooter:
        WaitlistBlocksAllowedInFooter[key as keyof typeof WaitlistBlocksSchema],
    },
  ]),
);
