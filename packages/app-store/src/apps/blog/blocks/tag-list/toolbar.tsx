import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { BlogTagListProps } from "./schema";

export const BlogTagListToolbar = (
  props: ConfigurationProps<BlogTagListProps>,
) => <ShortcutsToolbar shortcuts={[]} data={props.data} setData={props.setData} />;

