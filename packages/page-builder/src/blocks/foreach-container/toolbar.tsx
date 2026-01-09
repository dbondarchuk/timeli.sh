import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { containerShortcuts } from "../container/shortcuts";
import { ForeachContainerProps } from "./schema";

export const ForeachContainerToolbar = (
  props: ConfigurationProps<ForeachContainerProps>,
) => (
  <ShortcutsToolbar
    shortcuts={containerShortcuts}
    data={props.data}
    setData={props.setData}
  />
);
