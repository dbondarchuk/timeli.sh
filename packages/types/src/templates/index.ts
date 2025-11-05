import * as z from "zod";
import { communicationChannels } from "../communication";
import { WithCompanyId, WithDatabaseId } from "../database";
import { Prettify, zNonEmptyString } from "../utils";

export const templateSchema = z.object({
  name: zNonEmptyString("template.name.required", 3),
  type: z.enum(communicationChannels, { message: "template.type.invalid" }),
  value: z.any(),
});

export const getTemplateSchemaWithUniqueCheck = (
  uniqueNameCheckFn: (name: string, id?: string) => Promise<boolean> | boolean,
  message: string,
) => {
  return z.object({
    ...templateSchema.shape,
    name: templateSchema.shape.name.refine(uniqueNameCheckFn, { message }),
  });
};

export type TemplateUpdateModel = z.infer<typeof templateSchema>;
export type Template = Prettify<
  WithCompanyId<WithDatabaseId<TemplateUpdateModel>> & {
    updatedAt: Date;
  }
>;

export type TemplateListModel = Omit<Template, "value">;
