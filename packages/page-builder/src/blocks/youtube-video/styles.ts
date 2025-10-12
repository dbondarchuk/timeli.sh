import { type YouTubeVideoProps } from "./schema";

import {
  ALL_STYLES,
  AllStylesSchemas,
  DefaultCSSProperties,
  getStylesSchema,
} from "@vivid/page-builder-base/style";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);
export type YouTubeVideoStylesSchema = AllStylesSchemas;

export const getDefaults = (
  { props, style }: YouTubeVideoProps,
  isEditor?: boolean,
): DefaultCSSProperties<YouTubeVideoStylesSchema> => ({
  display: "inline-block",
  maxWidth: {
    value: 100,
    unit: "%",
  },
  position: "relative",
  padding: {
    left: {
      value: 0,
      unit: "px",
    },
    right: {
      value: 0,
      unit: "px",
    },
    top: {
      value: 0,
      unit: "px",
    },
    bottom: {
      value: 56.25,
      unit: "%",
    },
  },
});
