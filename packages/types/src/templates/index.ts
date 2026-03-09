import * as z from "zod";
import { communicationChannels } from "../communication";
import { WithCompanyId, WithDatabaseId } from "../database";
import { Prettify, zNonEmptyString } from "../utils";

export const templateSchema = z
  .object({
    name: zNonEmptyString(
      "validation.template.name.required",
      3,
      256,
      "validation.template.name.max",
    ),
  })
  .and(
    z.discriminatedUnion("type", [
      z.object({
        type: z
          .enum(communicationChannels)
          .extract(["email"], { message: "validation.template.type.invalid" }),
        subject: zNonEmptyString(
          "validation.template.value.subject.required",
          1,
          256,
          "validation.template.value.subject.max",
        ),
        value: z.any(),
      }),
      z.object({
        type: z.enum(communicationChannels).extract(["text-message"], {
          message: "validation.template.type.invalid",
        }),
        value: zNonEmptyString(
          "validation.template.textMessage.value.required",
          1,
          500,
          "validation.template.textMessage.value.max",
        ),
      }),
    ]),
  );

export const getTemplateSchemaWithUniqueCheck = (
  uniqueNameCheckFn: (name: string) => Promise<boolean> | boolean,
  message: string,
) => {
  return templateSchema.superRefine(async (args, ctx) => {
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

export type TemplateUpdateModel = z.infer<typeof templateSchema>;
export type Template = Prettify<
  WithCompanyId<WithDatabaseId<TemplateUpdateModel>> & {
    updatedAt: Date;
  }
>;

export type TemplateListModel = Omit<Template, "value">;
