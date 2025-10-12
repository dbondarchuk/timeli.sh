import Header from "@/components/admin/layout/header";
import { AppSidebar } from "@/components/admin/layout/sidebar";

import { navItems } from "@/constants/data";
import { AppMenuItems } from "@vivid/app-store/menu-items";
import { ServicesContainer } from "@vivid/services";
import { NavItemGroup } from "@vivid/types";
import {
  BreadcrumbsProvider,
  ConfigProvider,
  SidebarInset,
  SidebarProvider,
} from "@vivid/ui";
import { cookies } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { CookiesProvider } from "../../../components/cookies-provider";
import { PendingAppointmentsToastStream } from "./pending-appointments-toast-stream";

const SIDEBAR_COOKIE_NAME = "admin-sidebar-open";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarDefaultOpen =
    cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === "true";

  const { name, logo } =
    await ServicesContainer.ConfigurationService().getConfiguration("general");

  const groups: NavItemGroup[] = [
    ...navItems.map((x) => ({
      ...x,
      children: [
        ...x.children.map((y) => ({
          ...y,
          items: y.items ? [...y.items] : [],
        })),
      ],
    })),
  ];

  const menuItems = groups.flatMap((group) => group.children);

  const appsWithMenu = await ServicesContainer.ConnectedAppsService().getApps();
  const appsMenus = appsWithMenu
    .map(({ name }) => AppMenuItems[name] || [])
    .filter((menus) => menus && menus.length > 0)
    .flatMap((item) => item);

  appsMenus
    .filter((item) => !item.parent && !item.isHidden)
    .sort(({ order: aOrder = 0 }, { order: bOrder = 0 }) => bOrder - aOrder)
    .forEach(({ Page: _, ...item }) => {
      menuItems.push({
        ...item,
        href: `/admin/dashboard/${item.href}`,
        title: item.label,
      });
    });

  appsMenus
    .filter((item) => !!item.parent && !item.isHidden)
    .sort(({ order: aOrder = 0 }, { order: bOrder = 0 }) => bOrder - aOrder)
    .forEach(({ Page: _, ...item }) => {
      const parent = menuItems.find((parent) => item.parent === parent.id);
      if (!parent) return;

      if (!parent.items?.length) {
        parent.items = [];
        if (!parent.removeIfBecameParent) {
          parent.items.push({
            id: parent.id,
            title: parent.title,
            href: parent.href,
            disabled: parent.disabled,
            external: parent.external,
            icon: parent.icon,
            label: parent.label,
            description: parent.description,
          });
        }
      }

      parent.items.push({
        ...item,
        href: `/admin/dashboard/${item.href}`,
        title: item.label,
      });
    });

  const config =
    await ServicesContainer.ConfigurationService().getConfiguration("general");

  return (
    <div className="flex">
      <ConfigProvider config={config}>
        <SidebarProvider
          defaultOpen={sidebarDefaultOpen}
          cookieName={SIDEBAR_COOKIE_NAME}
        >
          <BreadcrumbsProvider>
            <CookiesProvider>
              <NuqsAdapter>
                <AppSidebar menuItems={groups} name={name} logo={logo} />
                <PendingAppointmentsToastStream />

                <SidebarInset>
                  {/* <main className="w-full flex-1 overflow-hidden"> */}
                  <Header />
                  {children}
                  {/* </main> */}
                </SidebarInset>
              </NuqsAdapter>
            </CookiesProvider>
          </BreadcrumbsProvider>
        </SidebarProvider>
      </ConfigProvider>
    </div>
  );
}
