import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { BlogPostsListProps } from "./schema";

export const BlogPostsListToolbar = (
  props: ConfigurationProps<BlogPostsListProps>,
) => <ShortcutsToolbar shortcuts={[]} data={props.data} setData={props.setData} />;

