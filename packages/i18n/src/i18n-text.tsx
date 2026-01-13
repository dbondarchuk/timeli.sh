"use client";
import { useI18n } from "./client";
import { richTextArgs } from "./rich-text-args";
import { AllKeys, I18nKey, I18nNamespaces } from "./types";

export const I18nText = ({ text }: { text: AllKeys }) => {
  const t = useI18n();
  return t(text);
};

export const I18nRichText = <T extends I18nNamespaces>({
  namespace,
  text,
  args,
}: {
  namespace?: T;
  text: I18nKey<T>;
  args?: Record<string, any>;
}) => {
  const t = useI18n(namespace);

  return t.rich(text, { ...richTextArgs, ...args });
};
