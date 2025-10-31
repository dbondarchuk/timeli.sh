"use client";
import { authClient } from "@/app/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@vivid/i18n";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputGroup,
  InputGroupInput,
  InputGroupInputClasses,
  InputGroupSuffixClasses,
  InputSuffix,
  useDebounceCacheFn,
} from "@vivid/ui";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { checkOrganizationSlug } from "./actions";

export const UserSignupForm = ({ publicDomain }: { publicDomain: string }) => {
  const debounceCheckSlug = useDebounceCacheFn(checkOrganizationSlug, 300);

  const formSchema = useMemo(
    () =>
      z
        .object({
          email: z.email({ error: "common.email.invalid" }),
          name: z
            .string({ error: "admin.auth.validation.name.required" })
            .min(1, { error: "admin.auth.validation.name.required" }),
          password: z
            .string({ error: "admin.auth.validation.password.required" })
            .min(8, { error: "admin.auth.validation.password.minLength" }),
          confirmPassword: z.string({
            error: "admin.auth.validation.confirmPassword.required",
          }),
          organizationName: z
            .string({
              error: "admin.auth.validation.organizationName.required",
            })
            .min(1, {
              error: "admin.auth.validation.organizationName.required",
            }),
          organizationSlug: z
            .string({
              error: "admin.auth.validation.organizationSlug.required",
            })
            .min(3, {
              error: "admin.auth.validation.organizationSlug.length",
            })
            .max(20, {
              error: "admin.auth.validation.organizationSlug.length",
            })
            .regex(/^[a-z0-9]+$/, {
              error: "admin.auth.validation.organizationSlug.regex",
            })
            .refine((slug) => slug.length >= 3 && slug.length <= 20, {
              error: "admin.auth.validation.organizationSlug.length",
            })
            .refine(async (slug) => await debounceCheckSlug(slug), {
              error: "admin.auth.validation.organizationSlug.unique",
            }),
        })
        .superRefine((data, ctx) => {
          if (data.password !== data.confirmPassword) {
            ctx.addIssue({
              code: "custom",
              path: ["confirmPassword"],
              message: "admin.auth.validation.confirmPassword.required",
            });
          }
        }),
    [debounceCheckSlug],
  );

  type UserFormValue = z.infer<typeof formSchema>;

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [loading, setLoading] = useState(false);
  const t = useI18n("admin");

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      organizationName: "",
      organizationSlug: "",
    },
    mode: "all",
    reValidateMode: "onChange",
  });

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    try {
      const response = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        organizationName: data.organizationName,
        organizationSlug: data.organizationSlug,
        callbackURL: callbackUrl ?? "/dashboard",
      });

      if (response.error?.message) {
        setError(response.error?.message ?? null);
        return;
      }

      if (response.data?.user) {
        router.push(callbackUrl ?? "/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.email")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("auth.email")}
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.password")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("auth.password")}
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.confirmPassword")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("auth.password")}
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("auth.name")}
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organizationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.organizationName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("auth.organizationName")}
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organizationSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.organizationSlug")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput>
                    <Input
                      placeholder={t("auth.organizationSlug")}
                      disabled={loading}
                      className={InputGroupInputClasses()}
                      {...field}
                    />
                  </InputGroupInput>
                  <InputSuffix className={InputGroupSuffixClasses()}>
                    .{publicDomain}
                  </InputSuffix>
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm font-medium text-destructive">
            {t("auth.sign_up_error")}
          </p>
        )}

        <Button disabled={loading} className="ml-auto w-full" type="submit">
          {t("auth.signUp")}
        </Button>
      </form>
    </Form>
  );
};
