import { EditorDocumentBlocksDictionary } from "@vivid/builder";
import { WaitlistBlocksSchema } from "./schema";
import { WaitlistConfiguration } from "./waitlist/configuration";
import { WaitlistEditor } from "./waitlist/editor";
import { WaitlistPropsDefaults } from "./waitlist/schema";
import { WaitlistToolbar } from "./waitlist/toolbar";

import { AllKeys, BuilderKeys } from "@vivid/i18n";
import { CalendarClock } from "lucide-react";
import {
  WaitlistAdminKeys,
  WaitlistAdminNamespace,
} from "../translations/types";

export const WaitlistEditors: EditorDocumentBlocksDictionary<
  typeof WaitlistBlocksSchema
> = {
  Waitlist: {
    displayName: "app_waitlist_admin.block.displayName" satisfies AllKeys<
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
};
