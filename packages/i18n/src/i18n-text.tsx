"use client";
import { useI18n } from "./client";
import { AllKeys } from "./types";

export const I18nText = ({ text }: { text: AllKeys }) => {
  const t = useI18n();
  return t(text);
};
