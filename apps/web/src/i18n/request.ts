import { AppsTranslations } from "@vivid/app-store/translations";
import { getConfig } from "@vivid/i18n/request";
import { ServicesContainer } from "@vivid/services";
import { headers } from "next/headers";

const config = getConfig(
  async (baseLocale: string | undefined) => {
    const headersList = await headers();

    const isAdminPath = headersList.get("x-is-admin-path") === "true";

    let locale =
      baseLocale ||
      headersList.get("x-locale") ||
      (
        await ServicesContainer.ConfigurationService().getConfiguration(
          "general",
        )
      ).language ||
      "en";

    const pathname = headersList.get("x-pathname");
    if (pathname && !isAdminPath) {
      const trimmedPathname = pathname.replace(/^\//, "");
      const page =
        await ServicesContainer.PagesService().getPageBySlug(trimmedPathname);

      if (page?.language) {
        locale = page.language;
      }
    }

    return { locale, includeAdmin: isAdminPath };
  },
  async () => {
    const installedApps = Array.from(
      new Set(
        (await ServicesContainer.ConnectedAppsService().getApps()).map(
          (app) => app.name,
        ),
      ),
    );

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
        const promises = installedApps
          .filter((app) => AppsTranslations[app]?.admin)
          .map(async (app) => [
            `app_${app}_admin`,
            await AppsTranslations[app]?.admin?.(locale),
          ]);

        const entries = await Promise.all(promises);
        return Object.fromEntries(entries);
      },
    };

    return messages;
  },
);

export default config;
