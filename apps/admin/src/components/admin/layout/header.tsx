import { getWebsiteUrl } from "@/app/utils";
import { getI18nAsync } from "@vivid/i18n/server";
import { Link, Separator, SidebarTrigger } from "@vivid/ui";
import { Globe2 } from "lucide-react";
import { BreadcrumbsRender } from "./breadcrumbs";
import ThemeToggle from "./theme-toggle/theme-toggle";

export default async function Header({}: {}) {
  const t = await getI18nAsync("admin");
  const websiteUrl = await getWebsiteUrl();

  return (
    <header className="sticky inset-x-0 top-0 w-full">
      <nav className="flex items-center justify-between px-4 lg:px-8 py-2">
        {/* <div className={cn("block lg:!hidden")}>
          <AppSidebarTrigger />
        </div> */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-3 h-7 w-7" iconSize={18} />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <BreadcrumbsRender />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={websiteUrl}
            target="_blank"
            button
            variant="default"
            className="inline-flex items-center gap-1"
          >
            <Globe2 size={16} />{" "}
            <span className="hidden md:inline">
              {t("navigation.viewWebsite")}
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
