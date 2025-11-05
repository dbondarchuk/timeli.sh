import * as z from "zod";
import { zStylesBase } from "../../style-inputs/helpers/zod";

export const ImagePropsSchema = z.object({
  style: zStylesBase
    .pick({ padding: true, backgroundColor: true, textAlign: true })
    .optional()
    .nullable(),
  props: z
    .object({
      width: z
        .number()
        .positive("emailBuilder.blocks.image.validation.width")
        .optional()
        .nullable(),
      height: z
        .number()
        .positive("emailBuilder.blocks.image.validation.height")
        .optional()
        .nullable(),
      x: z
        .number()
        .min(0, "emailBuilder.blocks.image.validation.x")
        .max(100, "emailBuilder.blocks.image.validation.x")
        .optional()
        .nullable(),
      y: z
        .number()
        .min(0, "emailBuilder.blocks.image.validation.y")
        .max(100, "emailBuilder.blocks.image.validation.y")
        .optional()
        .nullable(),
      url: z.string().optional().nullable(),
      alt: z.string().optional().nullable(),
      linkHref: z.string().optional().nullable(),
      contentAlignment: z
        .enum(["top", "middle", "bottom"])
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
});

export type ImageProps = z.infer<typeof ImagePropsSchema>;

export const ImagePropsDefaults = {
  props: {
    url: "/assets/placeholder/400x200.jpg",
    alt: "Sample image",
    contentAlignment: "middle",
    linkHref: null,
    x: 50,
    y: 50,
  },
  style: {
    padding: { top: 16, bottom: 16, left: 24, right: 24 },
    textAlign: "center",
  },
} satisfies ImageProps;
