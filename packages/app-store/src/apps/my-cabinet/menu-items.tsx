import { AppMenuItem } from "@timelish/types";
import { UserRound } from "lucide-react";
import { MyCabinetAppSetup } from "./setup";
import {
  MyCabinetAdminAllKeys,
  MyCabinetAdminKeys,
  MyCabinetAdminNamespace,
} from "./translations/types";

export const MyCabinetMenuItems: AppMenuItem<
  MyCabinetAdminNamespace,
  MyCabinetAdminKeys
>[] = [
  {
    href: "settings/my-cabinet",
    parent: "settings",
    id: "settings-my-cabinet",
    label:
      "app_my-cabinet_admin.navigation.title" satisfies MyCabinetAdminAllKeys,
    icon: <UserRound />,
    Page: (props) => <MyCabinetAppSetup appId={props.appId} />,
  },
];
