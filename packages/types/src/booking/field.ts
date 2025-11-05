import * as z from "zod";

import { WithCompanyId, WithDatabaseId } from "../database";
import {
  asOptinalNumberField,
  Prettify,
  zNonEmptyString,
  zOptionalOrMinLengthString,
  zUniqueArray,
} from "../utils";
import { fieldTypes } from "./fields";

const fieldTypeEnum = z.enum(fieldTypes, {
  message: "fields.type.invalid",
});

export const defaultFieldDataSchema = z.object({
  label: zNonEmptyString("fields.label.required", 1),
  // description: z.array(z.any()),
  description: zOptionalOrMinLengthString(3, "fields.description.min"),
});

export const selectFieldDataSchema = z.object({
  ...defaultFieldDataSchema.shape,
  options: zUniqueArray(
    z.array(
      z.object({
        option: zNonEmptyString("fields.option.required", 1),
      }),
    ),
    (item) => item.option,
    "fields.option.unique",
  ),
});

export const fileFieldAcceptItemSchema = zNonEmptyString(
  "fields.accept.min",
).regex(
  /(\.[a-zA-Z0-9]+$)|(^(image|video|audio)\/\*$)|(^[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_\.]+$)/,
  "fields.accept.invalid",
);

export const fileFieldDataSchema = z.object({
  ...defaultFieldDataSchema.shape,
  accept: zUniqueArray(z.array(fileFieldAcceptItemSchema), (x) => x).optional(),
  maxSizeMb: asOptinalNumberField(
    z.coerce
      .number<number>()
      .min(1, "fields.maxSizeMb.min")
      .max(100, "fields.maxSizeMb.max"),
  ),
});

export const baseFieldSchema = z.object({
  name: zNonEmptyString("fields.name.required", 2).refine(
    (s) => /^[a-z_][a-z0-9_]+$/i.test(s),
    "fields.name.invalid",
  ),
  required: z.coerce.boolean<boolean>().optional(),
});

export const fieldSchema = z.discriminatedUnion("type", [
  z.object({
    ...baseFieldSchema.shape,
    type: fieldTypeEnum.extract(["select"]),
    data: selectFieldDataSchema,
  }),
  z.object({
    ...baseFieldSchema.shape,
    type: fieldTypeEnum.extract(["file"]),
    data: fileFieldDataSchema,
  }),
  z.object({
    ...baseFieldSchema.shape,
    type: fieldTypeEnum.exclude(["select", "file"]),
    data: defaultFieldDataSchema,
  }),
]);

export const getFieldSchemaWithUniqueCheck = (
  uniqueNameCheckFn: (name: string) => Promise<boolean>,
  message: string,
) => {
  return fieldSchema.superRefine(async (args, ctx) => {
    const isUnique = await uniqueNameCheckFn(args.name);
    if (!isUnique) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message,
      });
    }
  });
};

export type FieldSchema = z.infer<typeof fieldSchema>;

export const fieldsSchema = z.array(fieldSchema).optional();
export type FieldsSchema = z.infer<typeof fieldsSchema>;

export type ServiceFieldUpdateModel = FieldSchema;
export type ServiceField = Prettify<
  WithCompanyId<
    WithDatabaseId<ServiceFieldUpdateModel> & {
      updatedAt: Date;
    }
  >
>;
