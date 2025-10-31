import {
  ALL_STYLES,
  AllStylesSchemas,
  getStylesSchema,
} from "@vivid/page-builder-base/style";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);
export type YouTubeVideoStylesSchema = AllStylesSchemas;
