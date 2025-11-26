"use client";
import { GeneralConfiguration } from "@timelish/types";
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
