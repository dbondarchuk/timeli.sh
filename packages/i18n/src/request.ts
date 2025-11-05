import { getRequestConfig } from "next-intl/server";
import { mergeObjects } from "./utils";

export const getConfig = (
  getLocale: (
    baseLocale: string | undefined,
  ) => Promise<{ locale: string; includeAdmin: boolean }>,
  getMessages?: () => Promise<{
    public: (locale: string) => Promise<Record<string, Record<string, any>>>;
    admin: (locale: string) => Promise<Record<string, Record<string, any>>>;
    overrides: (locale: string) => Promise<(Record<string, any> | undefined)[]>;
  }>,
) =>
  getRequestConfig(async ({ locale: baseLocale }) => {
    const { locale, includeAdmin } = await getLocale(baseLocale);

    const externalMessages = await getMessages?.();
    const publicMessages = await externalMessages?.public(locale);
    let messages: Record<string, any> = {
      translation: (await import(`./locales/${locale}/translation.json`))
        .default,
      ui: (await import(`./locales/${locale}/ui.json`)).default,
      validation: (await import(`./locales/${locale}/validation.json`)).default,
      ...(publicMessages || {}),
    };

    if (includeAdmin) {
      messages.admin = (await import(`./locales/${locale}/admin.json`)).default;
      messages.builder = (
        await import(`./locales/${locale}/builder.json`)
      ).default;
      messages.apps = (await import(`./locales/${locale}/apps.json`)).default;

      const adminMessages = await externalMessages?.admin(locale);
      messages = {
        ...messages,
        ...(adminMessages || {}),
      };
    }

    const overrideEntries = await externalMessages?.overrides(locale);
    const overrides =
      overrideEntries?.filter(Boolean).reduce(
        (acc, entry) => {
          return mergeObjects(acc as {}, entry ?? {});
        },
        {} as Record<string, any>,
      ) ?? {};

    messages = mergeObjects(messages, overrides);

    return {
      locale,
      onError: (error) => console.error(error),
      getMessageFallback: ({ namespace, key }) => `${namespace}.${key}`,

      messages,
    };
  });
