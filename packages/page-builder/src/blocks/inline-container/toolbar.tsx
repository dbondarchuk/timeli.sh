import { ConfigurationProps } from "@vivid/builder";
import { ShortcutsToolbar } from "@vivid/page-builder-base";
import { InlineContainerProps } from "./schema";
import { inlineContainerShortcuts } from "./shortcuts";

export const InlineContainerToolbar = (
  props: ConfigurationProps<InlineContainerProps>,
) => (
  <ShortcutsToolbar
    shortcuts={inlineContainerShortcuts}
    data={props.data}
    setData={props.setData}
  />
);
