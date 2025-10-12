import { type VideoProps } from "./schema";

import {
  ALL_STYLES,
  AllStylesSchemas,
  DefaultCSSProperties,
  getStylesSchema,
} from "@vivid/page-builder-base/style";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);
export type VideoStylesSchema = AllStylesSchemas;

export const getDefaults = (
  { props, style }: VideoProps,
  isEditor?: boolean,
): DefaultCSSProperties<VideoStylesSchema> => ({
  display: "inline-block",
  maxWidth: {
    value: 100,
    unit: "%",
  },
});
