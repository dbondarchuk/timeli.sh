import { BaseReaderBlockProps } from "@vivid/builder";
import { Prettify } from "@vivid/types";
import z from "zod";

export const RedirectPropsSchema = z.object({
  props: z
    .object({
      url: z.string().min(1, "pageBuilder.blocks.redirect.errors.url"),
      permanent: z.boolean().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type RedirectProps = Prettify<z.infer<typeof RedirectPropsSchema>>;
export type RedirectReaderProps = BaseReaderBlockProps<any> & RedirectProps;

export const RedirectDefaultUrl = "/";

export const RedirectPropsDefaults = () =>
  ({
    props: {
      url: RedirectDefaultUrl,
      permanent: false,
    },
  }) as const satisfies RedirectProps;
