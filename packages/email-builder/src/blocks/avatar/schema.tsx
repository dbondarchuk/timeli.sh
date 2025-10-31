import * as z from "zod";
import { zPadding, zTextAlign } from "../../style-inputs/helpers/zod";

export const shape = z.enum(["circle", "square", "rounded"]);
export type AvatarShape = z.infer<typeof shape>;

export const AvatarPropsSchema = z.object({
  style: z
    .object({
      textAlign: zTextAlign,
      padding: zPadding,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      size: z.coerce
        .number<number>()
        .gt(0)
        .int("emailBuilder.blocks.avatar.validation.size")
        .optional()
        .nullable(),
      shape: shape.optional().nullable(),
      imageUrl: z.string().optional().nullable(),
      alt: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type AvatarProps = z.infer<typeof AvatarPropsSchema>;

export const AvatarPropsDefaults = {
  props: {
    size: 64,
    imageUrl: "https://ui-avatars.com/api/?size=128",
    alt: "",
    shape: "circle",
  },
  style: {
    padding: { top: 16, bottom: 16, left: 24, right: 24 },
    textAlign: "left",
  },
} as const satisfies AvatarProps;
