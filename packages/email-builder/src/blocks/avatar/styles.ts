import React from "react";
import { getPadding } from "../../style-inputs/helpers/styles";
import { AvatarProps } from "./schema";

export const getBorderRadius = (
  shape: "circle" | "square" | "rounded",
  size: number,
): number | undefined => {
  switch (shape) {
    case "rounded":
      return size * 0.125;
    case "circle":
      return size;
    case "square":
    default:
      return undefined;
  }
};

export const getStyles = ({ style }: AvatarProps): React.CSSProperties => ({
  textAlign: style?.textAlign ?? undefined,
  padding: getPadding(style?.padding),
});
