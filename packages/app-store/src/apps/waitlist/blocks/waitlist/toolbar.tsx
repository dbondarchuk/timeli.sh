import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { WaitlistProps } from "./schema";
import { waitlistShortcuts } from "./shortcuts";

export const WaitlistToolbar = (props: ConfigurationProps<WaitlistProps>) => (
  <ShortcutsToolbar
    shortcuts={waitlistShortcuts}
    data={props.data}
    setData={props.setData}
  />
);
