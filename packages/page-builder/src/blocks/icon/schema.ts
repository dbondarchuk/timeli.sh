import { BaseReaderBlockProps } from "@vivid/builder";
import { Prettify } from "@vivid/types";
import { iconNames } from "@vivid/ui";
import * as z from "zod";
import { zStyles } from "./styles";

const iconsEnum = z.enum(iconNames);

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
    icon: "star",
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
