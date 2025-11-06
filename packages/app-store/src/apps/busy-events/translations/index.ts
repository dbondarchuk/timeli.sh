const knownLocales = ["en", "uk"];
export const BusyEventsTranslations = {
  admin: async (locale: string) => {
    if (!knownLocales.includes(locale)) {
      return (await import(`./en/admin.json`)).default;
    }
    return (await import(`./${locale}/admin.json`)).default;
  },
  public: async (locale: string) => {
    if (!knownLocales.includes(locale)) {
      return (await import(`./en/public.json`)).default;
    }
    return (await import(`./${locale}/public.json`)).default;
  },
};
