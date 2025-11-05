import { WithId } from "../general";

// export enum FieldType {
//   Name = "name",
//   Email = "email",
//   Phone = "phone",
//   OneLine = "oneLine",
//   MultiLine = "multiLine",
//   Checkbox = "checkbox",
//   Select = "select",
//   File = "file",
// }

export const fieldTypes = [
  "name",
  "email",
  "phone",
  "oneLine",
  "multiLine",
  "checkbox",
  "select",
  "file",
] as const;

export type FieldType = (typeof fieldTypes)[number];

export type WithLabelFieldData = {
  label: string;
  description?: string;
};

export type FieldData<
  TData extends Record<string, any> | undefined = undefined,
> = {
  name: string;
  required?: boolean;
} & (TData extends undefined ? { data?: never } : { data: TData });

export type Field<TData extends Record<string, any> | undefined = undefined> =
  FieldData<TData> & {
    type: FieldType;
  };

export type Fields<TData extends Record<string, any> | undefined = undefined> =
  Field<TData>[];

export type FieldsWithId<
  TData extends Record<string, any> | undefined = undefined,
> = WithId<Field<TData>>[];

export type FieldOptionsData = {
  options: {
    option: string;
  }[];
};

export type FieldFileData = {
  accept?: string[];
  maxSizeMb?: number;
};

export const getFields = (
  fields: Fields<WithLabelFieldData>,
  defaultFieldLabels = false,
): Fields<any> => {
  return [
    {
      name: "name",
      required: true,
      type: "name",
      data: defaultFieldLabels
        ? {
            label: "form_name_label",
          }
        : undefined,
    },
    {
      name: "email",
      required: true,
      type: "email",
      data: defaultFieldLabels
        ? {
            label: "form_email_label",
          }
        : undefined,
    },
    {
      name: "phone",
      required: true,
      type: "phone",
      data: defaultFieldLabels
        ? {
            label: "form_phone_label",
          }
        : undefined,
    },
    ...fields,
  ];
};
