import {
  Field,
  FieldFileData,
  FieldOptionsData,
  FieldType,
  WithLabelFieldData,
  zNonEmptyString,
  zRequiredString,
} from "@timelish/types";
import { Control } from "react-hook-form";
import { z, ZodSchema } from "zod";
import { CheckboxField } from "./checkbox-field";
import { EmailField } from "./email";
import { FileField } from "./file";
import { MultiLineField } from "./multi-line";
import { NameField } from "./name";
import { OneLineField } from "./one-line";
import { PhoneField } from "./phone";
import { SelectField } from "./select";

export const fieldsSchemaMap: Record<FieldType, (field: Field) => ZodSchema> = {
  name: (field: Field) => zNonEmptyString("name_required_error", 2),

  email: (field: Field) => z.email("invalid_email_error"),
  phone: (field: Field) =>
    zRequiredString(field.required, "phone_required_error").refine(
      (s) => !s?.includes("_"),
      "invalid_phone_error",
    ),
  oneLine: (field: Field) =>
    zRequiredString(field.required, "field_required_error"),
  multiLine: (field: Field) =>
    zRequiredString(field.required, "field_required_error"),
  checkbox: (field: Field) =>
    z
      .boolean()
      .default(false)
      .refine(
        (arg) => (field.required ? !!arg : true),
        "checkbox_required_error",
      ),
  select: (field: Field) => {
    const [firstOption, ...restOptions] = (
      field as unknown as Field<FieldOptionsData>
    ).data.options.map((x) => x.option);

    return z
      .enum([firstOption, ...restOptions], { message: "field_required_error" })
      .refine((arg) => (field.required ? !!arg : true), "field_required_error");
  },
  file: (field: Field) => {
    return z
      .custom((f) => typeof f === "undefined" || f instanceof File, {
        message: "file_type_error",
      })
      .refine((file) => !field.required || !!file, "file_required_error")
      .refine(
        (file) => {
          if (field.required && !file) return false;

          const maxSizeMb = (field.data as unknown as FieldFileData)?.maxSizeMb;
          return (
            !maxSizeMb || !file || (file as File).size < maxSizeMb * 1024 * 1024
          );
        },
        {
          message: "file_max_size_error",

          params: {
            maxSizeMb: (field.data as unknown as FieldFileData).maxSizeMb,
          },
        },
      );
  },
};

export const fieldSchemaMapper = (field: Field) => {
  let schema: z.ZodType = fieldsSchemaMap[field.type](field);
  if (!field.required) schema = schema.optional();

  return schema;
};

export type FieldComponentMapFn = (
  field: Field<any>,
  control: Control,
  disabled?: boolean,
) => React.ReactNode;

export const fieldsComponentMap: (
  namespace?: string,
) => Record<FieldType, FieldComponentMapFn> = (namespace) => ({
  name: (field, control, disabled) => (
    <NameField
      control={control}
      {...field}
      disabled={disabled}
      namespace={namespace}
    />
  ),
  email: (field, control, disabled) => (
    <EmailField
      control={control}
      {...field}
      disabled={disabled}
      namespace={namespace}
    />
  ),
  phone: (field, control, disabled) => (
    <PhoneField
      control={control}
      disabled={disabled}
      {...(field as Field<WithLabelFieldData>)}
      namespace={namespace}
    />
  ),
  oneLine: (field, control, disabled) => (
    <OneLineField
      control={control}
      disabled={disabled}
      {...(field as Field<WithLabelFieldData>)}
      namespace={namespace}
    />
  ),
  multiLine: (field, control, disabled) => (
    <MultiLineField
      control={control}
      disabled={disabled}
      {...(field as Field<WithLabelFieldData>)}
      namespace={namespace}
    />
  ),
  checkbox: (field, control, disabled) => (
    <CheckboxField
      control={control}
      disabled={disabled}
      {...(field as Field<WithLabelFieldData>)}
      namespace={namespace}
    />
  ),
  select: (field, control, disabled) => (
    <SelectField
      control={control}
      disabled={disabled}
      {...(field as Field<WithLabelFieldData & FieldOptionsData>)}
      namespace={namespace}
    />
  ),
  file: (field, control, disabled) => (
    <FileField
      control={control}
      disabled={disabled}
      {...(field as Field<WithLabelFieldData & FieldFileData>)}
      namespace={namespace}
    />
  ),
});
