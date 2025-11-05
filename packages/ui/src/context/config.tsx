"use client";
import { GeneralConfiguration } from "@timelish/types";
import { createContext, useContext } from "react";

export const ConfigContext = createContext<{
  config: GeneralConfiguration;
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
});

export const ConfigProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: GeneralConfiguration;
}) => {
  return (
    <ConfigContext.Provider value={{ config }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  return useContext(ConfigContext).config;
};

export const useTimeZone = () => {
  const config = useConfig();
  return config.timeZone;
};
