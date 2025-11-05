import * as z from "zod";
import { zStylesBase } from "../../style-inputs/helpers/zod";

export const SpacerPropsSchema = z.object({
  style: zStylesBase.pick({ backgroundColor: true }).optional().nullable(),
  props: z
    .object({
      height: z
        .number()
        .gte(0, "emailBuilder.blocks.spacer.validation.height")
        .optional()
        .nullish(),
    })
    .optional()
    .nullable(),
});

export type SpacerProps = z.infer<typeof SpacerPropsSchema>;

export const SpacerPropsDefaults = {
  props: { height: 16 },
} satisfies SpacerProps;
