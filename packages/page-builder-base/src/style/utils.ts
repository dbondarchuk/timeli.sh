import { z } from "zod";
import { ALL_STYLES, allStyles, AllStylesNames } from "./styles";
import { BaseStyleDictionary, StyleDictionary, StyleSupport } from "./types";
import {
  FourSideValues,
  NumberValueWithUnit,
  NumberValueWithUnitOrKeyword,
  zBreakpoint,
  zStateWithTarget,
} from "./zod";

// Helper function to check if a style is allowed for a block
export function isStyleAllowed(
  styleName: AllStylesNames,
  support?: StyleSupport,
): boolean {
  if (!support) return true;

  if (support.blockedStyles?.includes(styleName)) {
    return false;
  }

  if (support.allowedStyles && support.allowedStyles.length > 0) {
    return support.allowedStyles.includes(styleName);
  }

  return true;
}

export function filterStyleDefinitions<
  T extends StyleSupport,
  FinalKeys extends AllStylesNames = T["allowedStyles"] extends AllStylesNames[]
    ? Exclude<
        T["allowedStyles"][number],
        T["blockedStyles"] extends AllStylesNames[]
          ? T["blockedStyles"][number]
          : never
      >
    : Exclude<
        AllStylesNames,
        T["blockedStyles"] extends AllStylesNames[]
          ? T["blockedStyles"][number]
          : never
      >,
>(support: T): Pick<typeof ALL_STYLES, FinalKeys> {
  let keys: AllStylesNames[] = allStyles.map((s) => s.name as AllStylesNames);

  if (support.allowedStyles) {
    keys = keys.filter((k) => support.allowedStyles!.includes(k));
  }

  if (support.blockedStyles) {
    keys = keys.filter((k) => !support.blockedStyles!.includes(k));
  }

  const result = Object.fromEntries(
    keys.map((k) => [k, allStyles.find((s) => s.name === k)!]),
  ) as Pick<typeof ALL_STYLES, FinalKeys>;

  return result;
}

// Main function to build styles schema
export function getStylesSchema<T extends BaseStyleDictionary>(
  styleDefinitions: StyleDictionary<T>,
) {
  const baseSchema = Object.values(styleDefinitions).reduce((map, style) => {
    // map[style.name] = z.object({
    //   value: style.schema.optional().nullable(),
    //   variants: z.array(
    //     z.object({
    //       value: style.schema,
    //       breakpoint: zBreakpoint.optional().nullable(),
    //       state: zState.optional().nullable(),
    //     })
    //   ),
    // });
    map[style.name] = z
      .array(
        z.object({
          value: style.schema,
          breakpoint: z.array(zBreakpoint).optional().nullable(),
          state: z.array(zStateWithTarget).optional().nullable(),
        }),
      )
      .optional()
      .nullable();

    return map;
  }, {}) as {
    [key in keyof T]: z.ZodOptional<
      z.ZodNullable<
        z.ZodArray<
          z.ZodObject<{
            breakpoint: z.ZodOptional<
              z.ZodNullable<z.ZodArray<typeof zBreakpoint>>
            >;
            state: z.ZodOptional<
              z.ZodNullable<z.ZodArray<typeof zStateWithTarget>>
            >;
            value: T[key];
          }>
        >
      >
    >;
  };

  return z.object(baseSchema).optional().nullable();
}

export const renderRawNumberWithUnitCss = (value: NumberValueWithUnit) => {
  if (!value) return null;
  return `${value.value}${value.unit}`;
};
export const renderRawNumberWithUnitOrKeywordCss = <T extends string>(
  value: NumberValueWithUnitOrKeyword<T> | null | undefined,
): string => {
  if (value === null || typeof value === "undefined") {
    return "inherit";
  }

  if (typeof value === "object" && value !== null) {
    return renderRawNumberWithUnitCss(value) ?? "inherit";
  }

  return value;
};

export const renderFourSideValuesCss = (
  value: FourSideValues,
  prefix?: string,
) => {
  return Object.entries(value)
    .filter(([_, val]) => !!val)
    .map(([key, val]) => {
      return `${prefix ? `${prefix}-` : ""}${key}: ${renderRawNumberWithUnitOrKeywordCss(val)};`;
    })
    .join("\n");
};
