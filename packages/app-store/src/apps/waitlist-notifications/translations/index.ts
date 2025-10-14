export const WaitlistNotificationsTranslations = {
  admin: async (locale: string) => {
    switch (locale) {
      case "uk":
        return (await import("./uk/admin.json")).default;
      case "en":
      default:
        return (await import("./en/admin.json")).default;
    }
  },
};
