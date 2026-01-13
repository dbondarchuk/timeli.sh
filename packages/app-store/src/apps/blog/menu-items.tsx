import { AppMenuItem } from "@timelish/types";
import { FileText } from "lucide-react";
import { BlogEditPage } from "./pages/edit";
import { BlogPage } from "./pages/main";
import { BlogNewPage } from "./pages/new";
import {
  BlogAdminAllKeys,
  BlogAdminKeys,
  BlogAdminNamespace,
} from "./translations/types";

const blogBreadcrumb: {
  title: BlogAdminAllKeys;
  link: string;
} = {
  title: "app_blog_admin.app.pages.main.label",
  link: "/dashboard/blog",
};

export const BlogMenuItems: AppMenuItem<BlogAdminNamespace, BlogAdminKeys>[] = [
  {
    href: "blog",
    id: "blog",
    group: "website",
    order: 100,
    notScrollable: true,
    label: "app_blog_admin.app.pages.main.label" satisfies BlogAdminAllKeys,
    icon: <FileText />,
    Page: (props) => <BlogPage {...props} />,
    pageBreadcrumbs: [blogBreadcrumb],
    pageTitle: "app_blog_admin.app.pages.main.title" satisfies BlogAdminAllKeys,
    pageDescription:
      "app_blog_admin.app.pages.main.description" satisfies BlogAdminAllKeys,
  },
  {
    href: "blog/new",
    parent: "blog",
    id: "blog-new",
    isHidden: true,
    hideHeading: true,
    label: "app_blog_admin.app.pages.new.label" satisfies BlogAdminAllKeys,
    icon: <FileText />,
    Page: (props) => <BlogNewPage appId={props.appId} />,
    pageBreadcrumbs: [
      blogBreadcrumb,
      {
        title: "app_blog_admin.app.pages.new.label" satisfies BlogAdminAllKeys,
        link: "/dashboard/blog/new",
      },
    ],
    pageTitle: "app_blog_admin.app.pages.new.title" satisfies BlogAdminAllKeys,
    pageDescription:
      "app_blog_admin.app.pages.new.description" satisfies BlogAdminAllKeys,
  },
  {
    href: "blog/edit",
    parent: "blog",
    id: "blog-edit",
    isHidden: true,
    hideHeading: true,
    label: "app_blog_admin.app.pages.edit.label" satisfies BlogAdminAllKeys,
    icon: <FileText />,
    Page: (props) => <BlogEditPage appId={props.appId} />,
    pageBreadcrumbs: [
      blogBreadcrumb,
      {
        title: "app_blog_admin.app.pages.edit.label" satisfies BlogAdminAllKeys,
        link: "/dashboard/blog/edit",
      },
    ],
    pageTitle: "app_blog_admin.app.pages.edit.title" satisfies BlogAdminAllKeys,
    pageDescription:
      "app_blog_admin.app.pages.edit.description" satisfies BlogAdminAllKeys,
  },
];
