import { BaseReaderBlockProps } from "@vivid/builder";
import { Prettify } from "@vivid/types";
import { icons } from "lucide-react";
import * as z from "zod";
import { zStyles } from "./styles";

const [firstIcon, ...restIcons] = Object.keys(icons);
const iconsEnum = z.enum([firstIcon, ...restIcons]);

export const IconPropsSchema = z.object({
  props: z
    .object({
      icon: iconsEnum.optional().nullable(),
    })
    .optional()
    .nullable(),
  style: zStyles,
});

export type IconProps = Prettify<z.infer<typeof IconPropsSchema>>;
export type IconReaderProps = BaseReaderBlockProps<any> & IconProps;

export const IconPropsDefaults = {
  props: {
    icon: "Star",
  },
  style: {
    display: [
      {
        value: "inline-block",
      },
    ],
    width: [
      {
        value: { value: 1, unit: "rem" },
      },
    ],
    height: [
      {
        value: { value: 1, unit: "rem" },
      },
    ],
  },
} as const satisfies IconProps;
