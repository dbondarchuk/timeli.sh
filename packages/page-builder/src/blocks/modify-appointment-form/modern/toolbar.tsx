import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { ModifyAppointmentFormProps } from "./schema";
import { modifyAppointmentFormShortcuts } from "./shortcuts";

export const ModifyAppointmentFormToolbar = (
  props: ConfigurationProps<ModifyAppointmentFormProps>,
) => (
  <ShortcutsToolbar
    shortcuts={modifyAppointmentFormShortcuts}
    data={props.data}
    setData={props.setData}
  />
);
