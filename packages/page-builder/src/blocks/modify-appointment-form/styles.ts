import { ALL_STYLES, getStylesSchema } from "../../style";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);

export const getDefaults = (
  data: { props?: any; style?: any },
  isEditor: boolean,
) => {
  return {};
};
