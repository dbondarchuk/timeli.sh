import {
  localeNamespaceLoaders,
  resolveMessageLocale,
} from "./locale-namespace-loaders.generated";

export const GiftCardStudioTranslations = {
  admin: async (locale: string) => {
    const l = resolveMessageLocale(locale);
    const { namespaceLoaders } = await localeNamespaceLoaders[l]();
    return (await namespaceLoaders.admin()).default;
  },
  public: async (locale: string) => {
    const l = resolveMessageLocale(locale);
    const { namespaceLoaders } = await localeNamespaceLoaders[l]();
    return (await namespaceLoaders.public()).default;
  },
};
