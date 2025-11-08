"use client";
import { authClient } from "@/app/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@timelish/i18n";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Link,
} from "@timelish/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z.email({ error: "common.email.invalid" }),
  password: z.string(),
});

type UserFormValue = z.infer<typeof formSchema>;

export const UserAuthForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [loading, setLoading] = useState(false);
  const t = useI18n("admin");
  const defaultValues = {
    email: "",
    password: "",
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    try {
      const response = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: callbackUrl ?? "/dashboard",
      });

      if (response.error?.message) {
        setError(response.error?.message ?? null);
      }

      if (response.data?.user) {
        router.push(callbackUrl ?? "/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
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

          {error && (
            <p className="text-sm font-medium text-destructive">
              {t("auth.email_or_password_incorrect")}
            </p>
          )}

          <Button disabled={loading} className="ml-auto w-full" type="submit">
            {t("auth.signIn")}
          </Button>
        </form>
      </Form>

      <div className="text-center w-full text-sm">
        {t.rich("auth.sign_in_sign_up_link", {
          link: (chunks: any) => (
            <Link
              href="/auth/signup"
              className="ml-auto w-full"
              variant="underline"
            >
              {chunks}
            </Link>
          ),
        })}
      </div>
    </div>
  );
};
