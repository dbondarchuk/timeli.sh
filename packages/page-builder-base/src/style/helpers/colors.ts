import { colors, colorsLabels } from "@vivid/types";
import { ValueLabel } from "./types";

export const COLOR_NAMES = colors;

export const COLORS: Record<(typeof COLOR_NAMES)[number], ValueLabel> =
  COLOR_NAMES.reduce(
    (map, color) => ({
      ...map,
      [color]: {
        label: colorsLabels[color],
        value: `var(--value-${color}-color)`,
      },
    }),
    {} as Record<(typeof COLOR_NAMES)[number], ValueLabel>,
  );

export const COLORS_LIST = [
  ...Object.entries(COLORS).map(([key, value]) => ({
    key,
    ...value,
  })),
  {
    key: "transparent",
    label: "pageBuilder.styles.colors.transparent",
    value: "transparent",
  },
];

export const getColorStyle = (
  color: string | undefined | null,
  opacityVar?: string | null | undefined,
) =>
  color
    ? color === "transparent"
      ? "transparent"
      : `hsl(${color}${opacityVar ? `/var(${opacityVar},1)` : ""})`
    : undefined;
