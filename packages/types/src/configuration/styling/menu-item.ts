import { z } from "zod";

import { icons } from "lucide-react";

const ButtonSizes = [
  "none",
  "default",
  "xs",
  "sm",
  "md",
  "lg",
  "icon",
] as const;
const ButtonVariants = [
  "default",
  "primary",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
  "link-underline",
  "link-dashed",
] as const;
const LinkSizes = ["sm", "md", "lg"] as const;
const LinkVariants = ["default", "underline", "standalone", "dashed"] as const;
const TextFonts = ["default", "primary", "secondary", "tertiary"] as const;
const TextSizes = ["sm", "md", "lg"] as const;
const TextWeights = [
  "default",
  "light",
  "thin",
  "normal",
  "medium",
  "semibold",
  "bold",
  "extrabold",
  "black",
  "extralight",
] as const;

const [firstIcon, ...restIcons] = Object.keys(icons);
const iconsEnum = z.enum([firstIcon, ...restIcons], {
  required_error: "configuration.styling.menuItem.icon.required",
});

export const menuItemTypes = ["icon", "link", "button", "submenu"] as const;
export const menuItemTypesEnum = z.enum(menuItemTypes);
export type MenuItemType = (typeof menuItemTypes)[number];

const [firstLinkVariant, ...restLinkVariants] = LinkVariants;
const [firstLinkSize, ...restLinkSizes] = LinkSizes;
const [firstButtonVariant, ...restButtonVariants] = ButtonVariants;
const [firstButtonSize, ...restButtonSizes] = ButtonSizes;
const [firstFont, ...restFonts] = TextFonts;
const [firstTextSize, ...restTextSizes] = TextSizes;
const [firstTextWeight, ...restTextWeights] = TextWeights;

export const baseMenuItemSchema = z.object({
  url: z
    .string({ required_error: "common.url.invalid" })
    .min(1, "common.url.invalid"),
  label: z
    .string({ required_error: "configuration.styling.menuItem.label.required" })
    .min(1, "configuration.styling.menuItem.label.required"),
  className: z.string().optional(),
});

export type BaseMenuItem = z.infer<typeof baseMenuItemSchema>;

export const iconMenuItemSchema = baseMenuItemSchema.merge(
  z.object({
    icon: iconsEnum,
    type: menuItemTypesEnum.extract(["icon"]),
  }),
);

export type IconMenuItem = z.infer<typeof iconMenuItemSchema>;

const textStyleSchema = baseMenuItemSchema.merge(
  z.object({
    font: z
      .enum([firstFont, ...restFonts])
      .nullable()
      .optional(),
    fontSize: z
      .enum([firstTextSize, ...restTextSizes])
      .nullable()
      .optional(),
    fontWeight: z
      .enum([firstTextWeight, ...restTextWeights])
      .nullable()
      .optional(),
  }),
);

export type TextStyle = z.infer<typeof textStyleSchema>;

export const linkMenuItemSchema = textStyleSchema.merge(
  z.object({
    prefixIcon: iconsEnum.optional(),
    suffixIcon: iconsEnum.optional(),
    variant: z
      .enum([firstLinkVariant, ...restLinkVariants])
      .nullable()
      .optional(),
    size: z
      .enum([firstLinkSize, ...restLinkSizes])
      .nullable()
      .optional(),
    type: menuItemTypesEnum.extract(["link"]),
  }),
);

export type LinkMenuItem = z.infer<typeof linkMenuItemSchema>;

export const buttonMenuItemSchema = linkMenuItemSchema.merge(
  z.object({
    variant: z
      .enum([firstButtonVariant, ...restButtonVariants])
      .nullable()
      .optional(),
    size: z
      .enum([firstButtonSize, ...restButtonSizes])
      .nullable()
      .optional(),
    type: menuItemTypesEnum.extract(["button"]),
  }),
);

export type ButtonMenuItem = z.infer<typeof buttonMenuItemSchema>;

export const subMenuItemSchema = linkMenuItemSchema;

export type SubMenuItem = z.infer<typeof subMenuItemSchema>;

export const subMenuMenuItemSchema = linkMenuItemSchema
  .omit({ url: true })
  .merge(
    z.object({
      children: subMenuItemSchema
        .array()
        .min(1, "configuration.styling.menuItem.submenu.min"),
      type: menuItemTypesEnum.extract(["submenu"]),
    }),
  );

export type SubMenuMenuItem = z.infer<typeof subMenuMenuItemSchema>;

export const menuItemSchema = z.discriminatedUnion("type", [
  iconMenuItemSchema,
  linkMenuItemSchema,
  buttonMenuItemSchema,
]);

export type MenuItem = z.infer<typeof menuItemSchema>;

export const menuItemWithSubMenuSchema = z.discriminatedUnion("type", [
  ...menuItemSchema.options,
  subMenuMenuItemSchema,
]);

export type MenuItemWithSubMenu = z.infer<typeof menuItemWithSubMenuSchema>;

export const menuItemsSchema = z.array(menuItemSchema);
export type MenuItems = z.infer<typeof menuItemsSchema>;

export const menuItemsWithSubMenuSchema = z.array(menuItemWithSubMenuSchema);
export type MenuItemsWithSubMenus = z.infer<typeof menuItemsWithSubMenuSchema>;
