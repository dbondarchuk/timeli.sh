import * as z from "zod";
import { WithCompanyId, WithDatabaseId } from "../database";
import { zPhone, zUniqueArray } from "../utils";
import { Prettify } from "../utils/helpers";
export const isPaymentRequiredForCustomerTypes = [
  "inherit",
  "always",
  "never",
] as const;

const isPaymentRequiredForCustomerSchema = z.enum(
  isPaymentRequiredForCustomerTypes,
);

export const customerSchema = z
  .object({
    name: z.string().min(1, "customer.name.required"),
    email: z.email("customer.email.required"),
    phone: zPhone,
    dateOfBirth: z.coerce.date<Date>().optional(),
    avatar: z.string().optional(),
    note: z.string().optional(),
    knownNames: zUniqueArray(
      z.array(z.string().min(1, "customer.name.required")),
      (s) => s,
      "customer.knownNames.unique",
    ),
    knownEmails: zUniqueArray(
      z.array(z.email({ error: "customer.email.required" })),
      (s) => s,
      "customer.knownEmails.unique",
    ),
    knownPhones: zUniqueArray(
      z.array(zPhone),
      (s) => s,
      "customer.knownPhones.unique",
    ),
    dontAllowBookings: z.coerce.boolean<boolean>().optional(),
  })
  .and(
    z
      .object({
        requireDeposit: isPaymentRequiredForCustomerSchema.exclude(["always"], {
          error: "customer.requireDeposit.required",
        }),
      })
      .or(
        z.object({
          requireDeposit: isPaymentRequiredForCustomerSchema.extract(
            ["always"],
            {
              error: "customer.requireDeposit.required",
            },
          ),
          depositPercentage: z.coerce
            .number<number>({ error: "customer.depositPercentage.required" })
            .int("customer.depositPercentage.integer")
            .min(10, "customer.depositPercentage.min")
            .max(100, "customer.depositPercentage.max"),
        }),
      ),
  );

export const getCustomerSchemaWithUniqueCheck = (
  uniqueEmailOrPhoneCheckFn: (
    emails: string[],
    phone: string[],
  ) => Promise<{ email: boolean; phone: boolean }>,
  emailMessage: string,
  phoneMessage: string,
) => {
  return customerSchema.superRefine(async (args, ctx) => {
    const isUnique = await uniqueEmailOrPhoneCheckFn(
      [args.email, ...(args.knownEmails || [])],
      [args.phone, ...(args.knownPhones || [])],
    );
    if (!isUnique.email) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: emailMessage,
      });
    }

    if (!isUnique.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: phoneMessage,
      });
    }
  });
};

export type CustomerUpdateModel = z.infer<typeof customerSchema>;
export type Customer = Prettify<
  WithCompanyId<WithDatabaseId<CustomerUpdateModel>>
>;
