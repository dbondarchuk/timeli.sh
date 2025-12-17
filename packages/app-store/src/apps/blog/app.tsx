import { App } from "@timelish/types";
import { FileText } from "lucide-react";
import { BLOG_APP_NAME } from "./const";
import { BlogAdminKeys } from "./translations/types";

export const BlogApp: App<"app_blog_admin", BlogAdminKeys> = {
  name: BLOG_APP_NAME,
  displayName: "app_blog_admin.app.displayName",
  category: ["apps.categories.content"],
  scope: ["dashboard-tab", "ui-components"],
  type: "complex",
  Logo: ({ className }) => <FileText className={className} />,
  isFeatured: true,
  isHidden: false,
  dontAllowMultiple: true,
  description: {
    text: "app_blog_admin.app.description",
  },
  settingsHref: "blog",
};

