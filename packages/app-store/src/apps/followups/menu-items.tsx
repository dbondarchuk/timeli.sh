import { AppMenuItem } from "@vivid/types";
import { MessageSquareHeart } from "lucide-react";
import { EditFollowUpPage } from "./edit-page";
import { NewFollowUpPage } from "./new-page";
import { FollowUpsPage } from "./page";
import {
  FollowUpsAdminAllKeys,
  FollowUpsAdminKeys,
  FollowUpsAdminNamespace,
} from "./translations/types";

const followUpBreadcrumb: {
  title: FollowUpsAdminAllKeys;
  link: string;
} = {
  title: "app_follow-ups_admin.navigation.main.title",
  link: "/admin/dashboard/communications/follow-ups",
};

export const FollowUpsMenuItems: AppMenuItem<
  FollowUpsAdminNamespace,
  FollowUpsAdminKeys
>[] = [
  {
    href: "communications/follow-ups",
    parent: "communications",
    id: "communications-follow-ups",
    order: 100,
    notScrollable: true,
    label: "app_follow-ups_admin.navigation.main.title",
    icon: <MessageSquareHeart />,
    Page: (props) => <FollowUpsPage appId={props.appId} />,
    pageBreadcrumbs: [followUpBreadcrumb],
    pageTitle: "app_follow-ups_admin.navigation.main.title",
    pageDescription: "app_follow-ups_admin.navigation.main.description",
  },
  {
    href: "communications/follow-ups/new",
    parent: "communications",
    id: "communications-follow-ups-new",
    isHidden: true,
    label: "app_follow-ups_admin.navigation.main.title",
    icon: <MessageSquareHeart />,
    Page: (props) => <NewFollowUpPage appId={props.appId} />,
    pageBreadcrumbs: [
      followUpBreadcrumb,
      {
        title: "app_follow-ups_admin.navigation.new.title",
        link: "/admin/dashboard/communications/follow-ups/new",
      },
    ],
    pageTitle: "app_follow-ups_admin.navigation.new.title",
    pageDescription: "app_follow-ups_admin.navigation.new.description",
  },
  {
    href: "communications/follow-ups/edit",
    parent: "communications",
    id: "communications-follow-ups-new",
    isHidden: true,
    label: "app_follow-ups_admin.navigation.main.title",
    icon: <MessageSquareHeart />,
    Page: (props) => <EditFollowUpPage appId={props.appId} />,
    pageBreadcrumbs: [
      followUpBreadcrumb,
      {
        title: "app_follow-ups_admin.navigation.edit.title",
        link: "/admin/dashboard/communications/follow-ups/edit",
      },
    ],
    pageTitle: "app_follow-ups_admin.navigation.edit.title",
    pageDescription: "app_follow-ups_admin.navigation.edit.description",
  },
];
