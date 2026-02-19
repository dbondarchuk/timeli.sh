import type {
  AllStylesSchemas,
  DefaultCSSProperties,
} from "@timelish/page-builder-base/style";
import type { LinkProps } from "./schema";

export const getDefaults = (
  { props, style }: LinkProps,
  isEditor?: boolean,
): DefaultCSSProperties<AllStylesSchemas> => {
  return {};
};
