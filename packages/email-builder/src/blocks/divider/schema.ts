import * as z from "zod";
import {
  zColor,
  zColorNullable,
  zPadding,
} from "../../style-inputs/helpers/zod";

export const DividerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: zColorNullable,
      padding: zPadding,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      lineColor: zColor,
      lineHeight: z.coerce
        .number<number>()
        .int("Should be the integer value")
        .positive()
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
});

export type DividerProps = z.infer<typeof DividerPropsSchema>;

export const DividerPropsDefaults = {
  props: {
    lineHeight: 1,
    lineColor: "#333333",
  },
  style: { padding: { top: 16, right: 0, bottom: 16, left: 0 } },
};
