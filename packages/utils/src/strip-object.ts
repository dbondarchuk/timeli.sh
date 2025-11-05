import * as z from "zod";

export const stripObject = <T extends Record<string, any>>(
  data: T,
  schema: z.ZodType,
): T => {
  const parsed = schema.safeParse(data);
  if (parsed.success) return data;

  for (const issue of parsed.error.issues) {
    if (issue.code === z.ZodIssueCode.unrecognized_keys) {
      for (const key of issue.keys) {
        delete data[key];
      }
    }
  }

  return data;
};
