import {
  localeNamespaceLoaders,
  resolveMessageLocale,
} from "./locale-namespace-loaders.generated";

export const ZoomTranslations = {
  admin: async (locale: string) => {
    const l = resolveMessageLocale(locale);
    const { namespaceLoaders } = await localeNamespaceLoaders[l]();
    return (await namespaceLoaders.admin()).default;
  },
  overrides: async (locale: string) => {
    const l = resolveMessageLocale(locale);
    const { namespaceLoaders } = await localeNamespaceLoaders[l]();
    return (await namespaceLoaders.overrides()).default;
  },
};
