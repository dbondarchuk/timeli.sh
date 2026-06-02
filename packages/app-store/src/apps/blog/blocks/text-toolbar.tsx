import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { blogTextShortcuts } from "./text-shortcuts";

export const BlogTextToolbar = <T extends { style?: unknown }>(
  props: ConfigurationProps<T>,
) => (
  <ShortcutsToolbar
    shortcuts={blogTextShortcuts}
    data={props.data}
    setData={props.setData}
  />
);
