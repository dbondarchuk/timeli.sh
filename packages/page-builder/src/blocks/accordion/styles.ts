import { type AccordionProps } from "./schema";

import { ALL_STYLES, getStylesSchema } from "@vivid/page-builder-base/style";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);

export const getDefaults = (
  { props, style }: AccordionProps,
  isEditor?: boolean,
) => ({});
