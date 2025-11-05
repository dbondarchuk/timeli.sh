import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { TextProps } from "./schema";
import { textShortcuts } from "./shortcuts";

export const TextToolbar = (props: ConfigurationProps<TextProps>) => (
  <ShortcutsToolbar
    shortcuts={textShortcuts}
    data={props.data}
    setData={props.setData}
  />
);
