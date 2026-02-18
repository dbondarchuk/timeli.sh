import * as z from "zod";
import {
  formSchemaBase,
  GetFormResponsesQuery,
  GetFormsQuery,
  updateFormResponseSchema,
} from "./form";

export const getFormResponseByIdActionSchema = z.object({
  id: z.string().min(1),
});

export type GetFormResponseByIdAction = z.infer<
  typeof getFormResponseByIdActionSchema
>;
export const GetFormResponseByIdActionType =
  "forms-get-form-response-by-id" as const;

export const updateFormResponseActionSchema = z.object({
  id: z.string().min(1),
  update: updateFormResponseSchema,
});

export type UpdateFormResponseAction = z.infer<
  typeof updateFormResponseActionSchema
>;
export const UpdateFormResponseActionType =
  "forms-update-form-response" as const;

export const deleteFormResponseActionSchema = z.object({
  id: z.string().min(1),
});

export type DeleteFormResponseAction = z.infer<
  typeof deleteFormResponseActionSchema
>;
export const DeleteFormResponseActionType =
  "forms-delete-form-response" as const;

export const deleteSelectedFormResponsesActionSchema = z.object({
  ids: z.array(z.string().min(1)),
});

export type DeleteSelectedFormResponsesAction = z.infer<
  typeof deleteSelectedFormResponsesActionSchema
>;
export const DeleteSelectedFormResponsesActionType =
  "forms-delete-selected-form-responses" as const;

export const createFormActionSchema = z.object({
  form: formSchemaBase,
});

export type CreateFormAction = z.infer<typeof createFormActionSchema>;
export const CreateFormActionType = "forms-create-form" as const;

export const updateFormActionSchema = z.object({
  id: z.string(),
  form: formSchemaBase,
});

export type UpdateFormAction = z.infer<typeof updateFormActionSchema>;
export const UpdateFormActionType = "forms-update-form" as const;

export const deleteFormActionSchema = z.object({
  id: z.string().min(1),
});

export type DeleteFormAction = z.infer<typeof deleteFormActionSchema>;
export const DeleteFormActionType = "forms-delete-form" as const;

export const deleteSelectedFormsActionSchema = z.object({
  ids: z.array(z.string().min(1)),
});

export type DeleteSelectedFormsAction = z.infer<
  typeof deleteSelectedFormsActionSchema
>;
export const DeleteSelectedFormsActionType =
  "forms-delete-selected-forms" as const;

export const setFormArchivedActionSchema = z.object({
  id: z.string().min(1),
  isArchived: z.boolean(),
});

export type SetFormArchivedAction = z.infer<typeof setFormArchivedActionSchema>;
export const SetFormArchivedActionType =
  "forms-set-form-archived" as const;

export const setFormsArchivedActionSchema = z.object({
  ids: z.array(z.string().min(1)),
  isArchived: z.boolean(),
});

export type SetFormsArchivedAction = z.infer<
  typeof setFormsArchivedActionSchema
>;
export const SetFormsArchivedActionType =
  "forms-set-forms-archived" as const;

export const getFormsActionSchema = z.object({
  query: z.custom<GetFormsQuery>(),
});

export type GetFormsAction = z.infer<typeof getFormsActionSchema>;
export const GetFormsActionType = "forms-get-forms" as const;

export const getFormByIdActionSchema = z.object({
  id: z.string(),
});

export type GetFormByIdAction = z.infer<typeof getFormByIdActionSchema>;
export const GetFormByIdActionType = "forms-get-form" as const;

export const getFormResponsesActionSchema = z.object({
  query: z.custom<GetFormResponsesQuery>(),
});

export type GetFormResponsesAction = z.infer<
  typeof getFormResponsesActionSchema
>;
export const GetFormResponsesActionType = "forms-get-responses" as const;

export const checkFormNameUniqueActionSchema = z.object({
  name: z.string(),
  id: z.string().optional(),
});

export type CheckFormNameUniqueAction = z.infer<
  typeof checkFormNameUniqueActionSchema
>;
export const CheckFormNameUniqueActionType = "forms-check-name-unique" as const;

export const createFormResponseActionSchema = z.object({
  formId: z.string().min(1),
  update: updateFormResponseSchema,
});

export type CreateFormResponseAction = z.infer<
  typeof createFormResponseActionSchema
>;
export const CreateFormResponseActionType = "forms-create-response" as const;

export const reassignFormResponsesActionSchema = z.object({
  ids: z.array(z.string().min(1)),
  customerId: z.string().nullable(),
});

export type ReassignFormResponsesAction = z.infer<
  typeof reassignFormResponsesActionSchema
>;
export const ReassignFormResponsesActionType =
  "forms-reassign-form-responses" as const;

export type RequestAction =
  | ({ type: typeof CreateFormActionType } & CreateFormAction)
  | ({ type: typeof UpdateFormActionType } & UpdateFormAction)
  | ({ type: typeof DeleteFormActionType } & DeleteFormAction)
  | ({ type: typeof GetFormsActionType } & GetFormsAction)
  | ({ type: typeof GetFormByIdActionType } & GetFormByIdAction)
  | ({ type: typeof GetFormResponsesActionType } & GetFormResponsesAction)
  | ({ type: typeof CreateFormResponseActionType } & CreateFormResponseAction)
  | ({ type: typeof GetFormResponseByIdActionType } & GetFormResponseByIdAction)
  | ({ type: typeof UpdateFormResponseActionType } & UpdateFormResponseAction)
  | ({ type: typeof DeleteFormResponseActionType } & DeleteFormResponseAction)
  | ({
      type: typeof DeleteSelectedFormsActionType;
    } & DeleteSelectedFormsAction)
  | ({
      type: typeof DeleteSelectedFormResponsesActionType;
    } & DeleteSelectedFormResponsesAction)
  | ({
      type: typeof ReassignFormResponsesActionType;
    } & ReassignFormResponsesAction)
  | ({ type: typeof SetFormArchivedActionType } & SetFormArchivedAction)
  | ({ type: typeof SetFormsArchivedActionType } & SetFormsArchivedAction)
  | ({
      type: typeof CheckFormNameUniqueActionType;
    } & CheckFormNameUniqueAction);
