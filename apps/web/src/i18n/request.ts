import { getServicesContainer } from "@/utils/utils";
import { AppsTranslations } from "@timelish/app-store/translations";
import { getConfig } from "@timelish/i18n/request";
import { headers } from "next/headers";

const config = getConfig(
  async (baseLocale: string | undefined) => {
    const headersList = await headers();

    const isAdminPath = headersList.get("x-is-admin-path") === "true";
    const servicesContainer = await getServicesContainer();

    let locale =
      baseLocale ||
      headersList.get("x-locale") ||
      (await servicesContainer.configurationService.getConfiguration("general"))
        .language ||
      "en";

    const pathname = headersList.get("x-pathname");
    if (pathname && !isAdminPath) {
      const trimmedPathname = pathname.replace(/^\//, "");
      const page =
        await servicesContainer.pagesService.getPageBySlug(trimmedPathname);

      if (page?.language) {
        locale = page.language;
      }
    }

    return { locale, includeAdmin: isAdminPath };
  },
  async () => {
    const servicesContainer = await getServicesContainer();
    const installedApps = Array.from(
      new Set(
        (await servicesContainer.connectedAppsService.getApps()).map(
          (app) => app.name,
        ),
      ),
    );

    const allApps = Object.keys(AppsTranslations);

    const messages = {
      public: async (locale: string) => {
        const promises = installedApps
          .filter((app) => AppsTranslations[app]?.public)
          .map(async (app) => [
            `app_${app}_public`,
            await AppsTranslations[app]?.public?.(locale),
          ]);

        const entries = await Promise.all(promises);
        return Object.fromEntries(entries);
      },
      admin: async (locale: string) => {
        // Include all apps, not just installed apps to display in store / set up forms
        const promises = allApps
          .filter((app) => AppsTranslations[app]?.admin)
          .map(async (app) => [
            `app_${app}_admin`,
            await AppsTranslations[app]?.admin?.(locale),
          ]);

        const entries = await Promise.all(promises);
        return Object.fromEntries(entries);
      },
      overrides: async (locale: string) => {
        const promises = installedApps
          .filter((app) => AppsTranslations[app]?.overrides)
          .map(async (app) => await AppsTranslations[app]?.overrides?.(locale));
        const overrides = await Promise.all(promises);

        return overrides;
      },
    };

    return messages;
  },
);

export default config;
