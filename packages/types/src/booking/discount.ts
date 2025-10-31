import * as z from "zod";
import { WithCompanyId, WithDatabaseId } from "../database";
import { asOptinalNumberField, zUniqueArray } from "../utils";
import { Prettify } from "../utils/helpers";

export const fixedAmountDiscountType = "amount";
export const percentageDiscountType = "percentage";

export const discountTypes = [
  fixedAmountDiscountType,
  percentageDiscountType,
] as const;

export const discountSchema = z
  .object({
    name: z.string().min(2, "discount.name.required"),
    enabled: z.coerce.boolean<boolean>(),
    startDate: z.coerce.date<Date>().optional(),
    endDate: z.coerce.date<Date>().optional(),
    appointmentStartDate: z.coerce.date<Date>().optional(),
    appointmentEndDate: z.coerce.date<Date>().optional(),
    maxUsage: asOptinalNumberField(
      z.coerce
        .number<number>({ error: "discount.maxUsage.min" })
        .int("discount.maxUsage.min")
        .min(1, "discount.maxUsage.min"),
    ),
    maxUsagePerCustomer: asOptinalNumberField(
      z.coerce
        .number<number>({ error: "discount.maxUsagePerCustomer.min" })
        .int("discount.maxUsagePerCustomer.min")
        .min(1, "discount.maxUsagePerCustomer.min"),
    ),
    type: z.enum(discountTypes),
    limitTo: z
      .array(
        z.object({
          addons: z
            .array(
              z.object({
                ids: zUniqueArray(
                  z.array(
                    z.object({
                      id: z.string().min(1, "discount.limitTo.addons.required"),
                    }),
                  ),
                  // .min(1, "discount.limitTo.addons.min"),
                  (addon) => addon.id,
                  "discount.limitTo.addons.unique",
                ),
              }),
            )
            .optional(),
          options: zUniqueArray(
            z.array(
              z.object({
                id: z.string().min(1, "discount.limitTo.options.required"),
              }),
            ),
            (option) => option.id,
            "discount.limitTo.options.unique",
          ).optional(),
        }),
      )
      .optional(),
    value: z.coerce
      .number<number>({ error: "discount.value.required" })
      .int("discount.value.required"),
    codes: zUniqueArray(
      z
        .array(z.string().min(3, "discount.codes.minLength"))
        .min(1, "discount.codes.min")
        .max(10, "discount.codes.max"),
      (code) => code,
      "discount.codes.unique",
    ),
  })
  .superRefine((arg, ctx) => {
    if (arg.startDate && arg.endDate && arg.endDate < arg.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "discount.endDate.min",
      });
    }
    if (arg.type === "percentage" && arg.value > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "discount.value.max",
      });
    }
  });

export type DiscountUpdateModel = z.infer<typeof discountSchema>;
export type Discount = Prettify<
  WithCompanyId<
    WithDatabaseId<DiscountUpdateModel> & {
      updatedAt: Date;
    }
  >
>;

export type DiscountType = Discount["type"];

export const getDiscountSchemaWithUniqueCheck = (
  uniqueNameAndCodeCheckFn: (
    name: string,
    codes: string[],
  ) => Promise<{
    name: boolean;
    code: Record<string, boolean>;
  }>,
  nameMessage: string,
  codeMessage: string,
) => {
  return discountSchema.superRefine(async (arg, ctx) => {
    const isUnique = await uniqueNameAndCodeCheckFn(arg.name, arg.codes);

    if (!isUnique.name) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: nameMessage,
      });
    }

    for (const [code, valid] of Object.entries(isUnique.code)) {
      const index = arg.codes.indexOf(code);
      if (valid || index < 0) continue;

      ctx.addIssue({
        code: "custom",
        path: [`codes.${index}`],
        message: codeMessage,
      });
    }
  });
};

export const applyDiscountRequestSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  optionId: z.string().min(1, "discount.applyRequest.optionId.required"),
  dateTime: z.coerce.date<Date>({
    error: "discount.applyRequest.dateTime.required",
  }),
  addons: zUniqueArray(
    z.array(z.string().min(1, "discount.applyRequest.addons.required")),
    (id) => id,
    "discount.applyRequest.addons.unique",
  ).optional(),
  code: z.string().min(1, "discount.applyRequest.code.required"),
});

export type ApplyDiscountRequest = z.infer<typeof applyDiscountRequestSchema>;
export type ApplyCustomerDiscountRequest = Prettify<
  Omit<ApplyDiscountRequest, "name" | "email" | "phone"> & {
    customerId?: string;
  }
>;

export type ApplyDiscountResponse = {
  code: string;
  value: number;
  type: DiscountType;
};
