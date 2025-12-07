import { TextBeltConfiguration } from "./types";

export const getTextBeltConfiguration = (): TextBeltConfiguration => {
  return {
    apiKey: process.env.TEXTBELT_API_KEY!,
  };
};
