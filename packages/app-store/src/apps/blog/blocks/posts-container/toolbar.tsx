import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { BlogPostsContainerProps } from "./schema";
import { containerShortcuts } from "../shortcuts";

export const BlogPostsContainerToolbar = (props: ConfigurationProps<BlogPostsContainerProps>) => (
  <ShortcutsToolbar
    shortcuts={containerShortcuts}
    data={props.data}
    setData={props.setData}
  />
);

