import type { CSSProperties } from "react";
import { getFontFamily, getPadding } from "../../style-inputs/helpers/styles";
import { type OnlineMeetingProps } from "./schema";

export const getStyles = ({
  props,
  style,
}: OnlineMeetingProps): CSSProperties => ({
  color: style?.color ?? undefined,
  backgroundColor: style?.backgroundColor ?? undefined,
  fontFamily: getFontFamily(style?.fontFamily),
  padding: getPadding(style?.padding),
});

export const getLogoUrl = (props: OnlineMeetingProps["props"]): string => {
  if (props?.logoUrl) {
    return props.logoUrl;
  }

  if (props?.type === "teams") {
    return "{{config.url}}/logos/microsoft_teams.svg";
  }

  if (props?.type === "zoom") {
    return "{{config.url}}/logos/zoom.svg";
  }

  if (props?.type === "google_meet") {
    return "{{config.url}}/logos/google_meet.svg";
  }

  return "{{config.url}}/logos/video_call.svg";
};
