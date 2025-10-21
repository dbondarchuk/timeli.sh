"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { adminApi } from "@vivid/api-sdk";
import { EmailBuilder } from "@vivid/email-builder";
import { useI18n } from "@vivid/i18n";
import {
  CommunicationChannel,
  getTemplateSchemaWithUniqueCheck,
  Template,
} from "@vivid/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InfoTooltip,
  Input,
  toastPromise,
  useDebounceCacheFn,
} from "@vivid/ui";
import { SaveButton } from "@vivid/ui-admin";
import { TextMessageBuilder } from "@vivid/ui-admin-kit";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NavigationGuardDialog, useIsDirty } from "../navigation-guard/dialog";
import { TemplatesTemplate } from "./templates/type";

export const TemplateForm: React.FC<
  {
    args: any;
  } & (
    | { type: CommunicationChannel; template?: TemplatesTemplate }
    | { initialData: Template }
  )
> = ({ args, ...rest }) => {
  const t = useI18n("admin");
  const initialData = "initialData" in rest ? rest.initialData : undefined;
  const type = initialData?.type || ("type" in rest ? rest.type : "email");
  const template = "template" in rest ? rest.template : undefined;

  const cachedUniqueNameCheck = useDebounceCacheFn(
    adminApi.templates.checkUniqueName,
    300,
  );
  const formSchema = getTemplateSchemaWithUniqueCheck(
    (name) => cachedUniqueNameCheck(name, initialData?._id),
    "templates.nameMustBeUnique",
  );

  type TemplateFormValues = z.infer<typeof formSchema>;

  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: initialData || {
      type,
      ...(template || {}),
    },
  });

  const { isFormDirty, onFormSubmit } = useIsDirty(form);

  const onSubmit = async (data: TemplateFormValues) => {
    try {
      setLoading(true);

      const fn = async () => {
        if (!initialData) {
          const { _id } = await adminApi.templates.createTemplate(data);
          onFormSubmit();

          setTimeout(() => {
            router.push(`/admin/dashboard/templates/${_id}`);
          }, 100);
        } else {
          await adminApi.templates.updateTemplate(initialData._id, data);
          onFormSubmit();

          setTimeout(() => {
            router.refresh();
          }, 100);
        }
      };

      await toastPromise(fn(), {
        success: t("templates.form.toasts.changesSaved"),
        error: t("templates.form.toasts.requestError"),
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const { setError, trigger } = form;
  const onEmailBuilderValidChange = React.useCallback(
    (isValid: boolean) =>
      isValid
        ? trigger()
        : setError("value", {
            message: t("templates.form.validation.templateNotValid"),
          }),
    [setError, trigger, t],
  );

  return (
    <Form {...form}>
      <NavigationGuardDialog isDirty={isFormDirty} />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full h-full space-y-8"
      >
        <div className="flex flex-col gap-4 w-full h-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("templates.form.name")}{" "}
                  <InfoTooltip>{t("templates.form.nameTooltip")}</InfoTooltip>
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("templates.form.namePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <>
                {type === "email" && (
                  <FormItem className="w-full flex-grow relative h-full">
                    <FormControl>
                      <EmailBuilder
                        args={args}
                        value={field.value}
                        onIsValidChange={onEmailBuilderValidChange}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                {type === "text-message" && (
                  <TextMessageBuilder args={args} field={field} />
                )}
              </>
            )}
          />
        </div>
        <SaveButton form={form} ignoreDirty />
      </form>
    </Form>
  );
};
