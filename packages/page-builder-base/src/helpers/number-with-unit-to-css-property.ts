import { NumberValueWithUnit } from "../style/zod";

export const numberWithUnitToCssProperty = (
  value?: NumberValueWithUnit | null,
) => {
  if (!value) return undefined;
  return `${value.value}${value.unit}`;
};
