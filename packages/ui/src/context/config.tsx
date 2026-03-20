"use client";
import { CurrencySymbolMap, GeneralConfiguration } from "@timelish/types";
import { formatAmountWithCurrency } from "@timelish/utils";
import { createContext, useContext } from "react";

export const ConfigContext = createContext<{
  config: GeneralConfiguration;
  websiteUrl: string;
}>({
  config: {
    name: "",
    title: "",
    description: "",
    keywords: "",
    email: "",
    domain: "",
    language: "en",
    timeZone: "local",
    currency: "USD",
    country: "US",
  },
  websiteUrl: "",
});

export const ConfigProvider = ({
  children,
  config,
  websiteUrl,
}: {
  children: React.ReactNode;
  config: GeneralConfiguration;
  websiteUrl: string;
}) => {
  return (
    <ConfigContext.Provider value={{ config, websiteUrl }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  return useContext(ConfigContext).config;
};

export const useWebsiteUrl = () => {
  return useContext(ConfigContext).websiteUrl;
};

export const useTimeZone = () => {
  const config = useConfig();
  return config.timeZone;
};

export const useCurrency = () => {
  const config = useConfig();
  return config.currency;
};

export const useCurrencySymbol = () => {
  const config = useConfig();
  return CurrencySymbolMap[config.currency];
};

export const useCurrencyFormat = () => {
  const config = useConfig();
  return (amount: number) =>
    formatAmountWithCurrency(amount, config.language, config.currency);
};
