import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { BlogPostContentProps } from "./schema";

export const BlogPostContentToolbar = (
  props: ConfigurationProps<BlogPostContentProps>,
) => <ShortcutsToolbar shortcuts={[]} data={props.data} setData={props.setData} />;

