import * as z from "zod";
import { zColorNullable, zStyles } from "../../style-inputs/helpers/zod";

export const ButtonPropsSchema = z.object({
  style: zStyles,
  props: z
    .object({
      buttonBackgroundColor: zColorNullable,
      buttonStyle: z
        .enum(["rectangle", "pill", "rounded"])
        .optional()
        .nullable(),
      buttonTextColor: zColorNullable,
      width: z.enum(["auto", "full"]).optional().nullable(),
      size: z
        .enum(["x-small", "small", "large", "medium"])
        .optional()
        .nullable(),
      text: z.string().min(1),
      url: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type ButtonProps = z.infer<typeof ButtonPropsSchema>;

export const ButtonPropsDefaults = {
  props: {
    text: "Button",
    url: "https://vividnail.studio",
    width: "auto",
    size: "medium",
    buttonStyle: "rounded",
    buttonTextColor: "#FFFFFF",
    buttonBackgroundColor: "#999999",
  },
  style: {
    padding: { top: 16, bottom: 16, left: 24, right: 24 },
    fontWeight: "normal",
    fontSize: 16,
    textAlign: "center",
  },
} as const satisfies ButtonProps;
