import * as z from "zod";
import { zStyles } from "../../style-inputs/helpers/zod";

export const HeadingPropsSchema = z.object({
  props: z
    .object({
      text: z.string().optional().nullable(),
      level: z.enum(["h1", "h2", "h3"]).optional().nullable(),
    })
    .optional()
    .nullable(),
  style: zStyles,
});

export type HeadingProps = z.infer<typeof HeadingPropsSchema>;

export const HeadingPropsDefaults = {
  props: {
    level: "h2",
    text: "Hello friend",
  },
  style: {
    padding: { top: 16, bottom: 16, left: 24, right: 24 },
    textAlign: "center",
    fontWeight: "bold",
  },
} as const satisfies HeadingProps;
