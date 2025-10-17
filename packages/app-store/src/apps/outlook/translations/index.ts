const knownLocales = ["en", "uk"];
export const OutlookTranslations = {
  admin: async (locale: string) => {
    if (!knownLocales.includes(locale)) {
      return (await import(`./en/admin.json`)).default;
    }
    return (await import(`./${locale}/admin.json`)).default;
  },
  overrides: async (locale: string) => {
    if (!knownLocales.includes(locale)) {
      return (await import(`./en/overrides.json`)).default;
    }
    return (await import(`./${locale}/overrides.json`)).default;
  },
};
