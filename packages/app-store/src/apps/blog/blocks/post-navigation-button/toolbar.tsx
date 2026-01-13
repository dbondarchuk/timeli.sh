import { ConfigurationProps } from "@timelish/builder";
import { ShortcutsToolbar } from "@timelish/page-builder-base";
import { BlogPostNavigationButtonProps } from "./schema";
import { blogPostNavigationButtonShortcuts } from "./shortcuts";

export const BlogPostNavigationButtonToolbar = (
  props: ConfigurationProps<BlogPostNavigationButtonProps>,
) => {
  return (
    <ShortcutsToolbar
      shortcuts={blogPostNavigationButtonShortcuts}
      data={props.data}
      setData={props.setData}
    />
  );
};
