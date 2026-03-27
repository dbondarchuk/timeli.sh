"use client";

import { authClient } from "@/app/auth-client";
import { LanguageOptions } from "@/constants/texts";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminApi, UserUpdate, userUpdateSchema } from "@timelish/api-sdk";
import { languages, useI18n } from "@timelish/i18n";
import { PlateMarkdownEditor } from "@timelish/rte";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Combobox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PhoneInput,
  toast,
  toastPromise,
} from "@timelish/ui";
import { AssetSelectorDialog, SaveButton } from "@timelish/ui-admin";
import { Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { EmailChangeDialog } from "./email-change-dialog";
import { PasswordChangeDialog } from "./password-change-dialog";

export const ProfileForm: React.FC<{
  values: UserUpdate & { email: string };
}> = ({ values }) => {
  const searchParams = useSearchParams();
  const emailChanged = searchParams.get("emailChanged");
  const [avatarDialogOpen, setAvatarDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const session = authClient.useSession();

  const t = useI18n("admin");
  const router = useRouter();

  const form = useForm<UserUpdate>({
    resolver: zodResolver(userUpdateSchema),
    mode: "all",
    reValidateMode: "onChange",
    values: { ...values },
  });

  const onSubmit = async (data: UserUpdate) => {
    try {
      setLoading(true);
      await toastPromise(adminApi.users.updateMyUser(data), {
        success: t("users.profile.toasts.changesSaved"),
        error: t("users.profile.toasts.requestError"),
      });

      if (data.language !== values.language && window?.location) {
        setTimeout(() => window.location.reload(), 1000);
      } else {
        session.refetch();
        router.refresh();
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (emailChanged === "true") {
      toast.success(
        t("users.profile.emailChange.toasts.emailChangedSuccessfully"),
      );
    }
  }, [emailChanged]);

  const image = form.watch("image");
  const name = form.watch("name");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-4">
            <CardHeader className="border-b">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("users.profile.form.photoSectionTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 items-center">
                <img
                  src={image ?? "/unknown-person.png"}
                  alt={t("users.profile.form.imageAlt")}
                  className="h-24 w-24 rounded-full object-cover"
                />
                <div className="text-center">
                  <p className="text-base font-semibold">{name}</p>
                  <p className="text-sm text-muted-foreground">
                    {values.email}
                  </p>
                </div>
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="w-full">
                            <AssetSelectorDialog
                              accept={["image/*"]}
                              isOpen={avatarDialogOpen}
                              addTo={{
                                description: `${values.name} - Profile Photo`,
                              }}
                              close={() => setAvatarDialogOpen(false)}
                              onSelected={(asset) => {
                                field.onChange(`/assets/${asset.filename}`);
                                field.onBlur();
                              }}
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                className="w-full"
                                disabled={loading}
                                onClick={() => setAvatarDialogOpen(true)}
                              >
                                {t("users.profile.form.changePhoto")}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                                onClick={() => {
                                  field.onChange(null);
                                  field.onBlur();
                                }}
                              >
                                {t("users.profile.form.removePhoto")}
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-8">
            <CardHeader className="border-b">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("users.profile.form.detailsSectionTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("users.profile.form.name")}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder={t("users.profile.form.namePlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("users.profile.form.phone")}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          {...field}
                          disabled={loading}
                          label={t("users.profile.form.phone")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("users.profile.form.language")}</FormLabel>
                      <FormControl>
                        <Combobox
                          values={languages.map((language) => ({
                            label: LanguageOptions[language],
                            value: language,
                          }))}
                          className="w-full"
                          value={field.value}
                          onItemSelect={(value) => {
                            field.onChange(value);
                            field.onBlur();
                          }}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("users.profile.form.bio")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PlateMarkdownEditor
                      {...field}
                      value={field.value ?? ""}
                      disabled={loading}
                      placeholder={t("users.profile.form.bioPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("users.profile.security.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <p className="font-medium">
                    {t("users.profile.security.email")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {values.email}
                  </p>
                </div>
              </div>
              <EmailChangeDialog currentEmail={values.email} />
            </div>
            <div className="h-px w-full bg-border" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <p className="font-medium">
                    {t("users.profile.security.password")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("users.profile.security.passwordDescription")}
                  </p>
                </div>
              </div>
              <PasswordChangeDialog />
            </div>
          </CardContent>
        </Card>
        <SaveButton form={form} disabled={loading} />
      </form>
    </Form>
  );
};
