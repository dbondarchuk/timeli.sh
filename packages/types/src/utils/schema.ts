import * as z from "zod";

export const zEmail = z.email("validation.common.email.invalid");
export const zPhone = z
  .string("validation.common.phone.required")
  .min(1, "validation.common.phone.required")
  .refine((s) => !s?.includes("_"), "validation.common.phone.invalid");

export type ErrorMessageWithParams = {
  message: string;
  params?: Record<string, any>;
};
export type ErrorMessage = string | ErrorMessageWithParams;
export const zErrorMessageWithParams = (
  message: string,
  params?: Record<string, any>,
) => JSON.stringify({ message, params });

export function zUniqueArray<ArrSchema extends z.ZodArray, UniqueVal>(
  schema: ArrSchema,
  uniqueBy: (item: z.infer<ArrSchema>[number]) => UniqueVal,
  errorMessage?: string,
) {
  return schema.superRefine((items, ctx) => {
    const seen = new Set<UniqueVal>();
    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      const val = uniqueBy(item);
      if (seen.has(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMessage || `Unique property validation failed`,
          path: [index],
        });
      } else {
        seen.add(val);
      }
    }
  }) as unknown as ArrSchema;
}

export function isPlainObject(
  value: unknown,
): value is Record<string | number | symbol, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

export function zStrictRecord<
  K extends z.ZodType<string | number | symbol, string | number | symbol>,
  V extends z.ZodType<any, any>,
>(zKey: K, zValue: V) {
  return z.custom<Record<z.infer<K>, z.infer<V>>>((input: unknown) => {
    return (
      isPlainObject(input) &&
      Object.entries(input).every(
        ([key, value]) =>
          zKey.safeParse(key).success && zValue.safeParse(value).success,
      )
    );
  }, "zodStrictRecord: error");
}

export function zOptionalOrMinLengthString(
  minLength: number,
  minLengthErrorMessage?: string,
) {
  return z
    .union([
      z
        .string(minLengthErrorMessage)
        .min(minLength, { message: minLengthErrorMessage }),
      z.string().length(0),
    ])
    .transform((e) => (e === "" ? undefined : e))
    .optional();
}

export function zOptionalOrMinMaxLengthString(
  min: { length: number; message?: string },
  max: { length: number; message?: string },
) {
  return z
    .union([
      z
        .string(min.message)
        .min(min.length, min.message)
        .max(max.length, max.message),
      z.string().length(0),
    ])
    .transform((e) => (e === "" ? undefined : e))
    .optional();
}

export const zNonEmptyString = (message?: string, minLength: number = 1) =>
  z
    .string(message)
    .min(
      minLength,
      message ?? `String must be at least ${minLength} characters long`,
    );

export const zRequiredString = (
  required?: boolean,
  message?: string,
  minLength: number = 1,
) =>
  required ? zNonEmptyString(message, minLength) : asOptionalField(z.string());

const emptyStringToUndefined = z.literal("").transform(() => undefined);

export function asOptionalField<T extends z.ZodType>(schema: T) {
  return schema.optional().or(emptyStringToUndefined);
}

export function asOptinalNumberField<T extends z.ZodNumber>(schema: T) {
  return z.preprocess(
    (arg) => (arg === "" ? undefined : arg),
    schema.optional(),
  ) as unknown as z.ZodOptional<T>;
}
