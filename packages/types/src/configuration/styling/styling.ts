import * as z from "zod";

import { zUniqueArray } from "../../utils";
import { resourceSchema } from "../resources";

// export const allFonts = {
//   items: [
//     {
//       family: "Inter",
//       variants: ["400", "500", "600", "700"],
//       subsets: ["latin"],
//       category: "sans-serif",
//     },
//   ],
// };
import allFonts from "./fonts.json";

export const fontsNames = allFonts.items.map((font) => font.family);

const [firstFont, ...restFonts] = fontsNames;

export const fontName = z.enum([firstFont, ...restFonts], {
  error: "configuration.styling.fonts.unknown",
});

export const fontsOptions = allFonts.items.reduce(
  (acc, font) => {
    acc[font.family] = {
      variants: font.variants,
      subsets: font.subsets,
      category: font.category,
    };
    return acc;
  },
  {} as Record<
    string,
    { variants: string[]; subsets: string[]; category: string }
  >,
);

export const colors = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
] as const;

export const colorsLabels: Record<(typeof colors)[number], string> = {
  background: "Background",
  foreground: "Text",
  card: "Card",
  "card-foreground": "Card text",
  popover: "Popover",
  "popover-foreground": "Popover text",
  primary: "Primary",
  "primary-foreground": "Primary text",
  secondary: "Secondary",
  "secondary-foreground": "Secondary text",
  muted: "Muted",
  "muted-foreground": "Muted text",
  accent: "Accent",
  "accent-foreground": "Accent text",
  destructive: "Destructive",
  "destructive-foreground": "Destructive text",
};

export const colorsEnum = z.enum(colors, {
  error: "configuration.styling.colors.invalid",
});

export const colorOverrideSchema = z.object({
  type: colorsEnum,
  value: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    error: "configuration.styling.colors.value.invalid",
  }),
});

export type ColorOverrideSchema = z.infer<typeof colorOverrideSchema>;

export const stylingConfigurationSchema = z.object({
  colors: zUniqueArray(
    colorOverrideSchema.array(),
    (item) => item.type,
    "configuration.styling.colors.unique",
  ).optional(),
  fonts: z
    .object({
      primary: fontName.optional(),
      secondary: fontName.optional(),
      tertiary: fontName.optional(),
    })
    .optional(),
  css: z.array(resourceSchema).optional(),
});

export type StylingConfiguration = z.infer<typeof stylingConfigurationSchema>;
