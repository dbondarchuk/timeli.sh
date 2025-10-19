"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@vivid/i18n";
import {
  DndFileInput,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  toastPromise,
} from "@vivid/ui";
import { SaveButton } from "@vivid/ui-admin";
import mimeType from "mime-type/with-db";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { checkUniqueFileName, createAsset } from "./actions";

export const AssetForm: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const t = useI18n("admin");

  const formSchema = z.object({
    file: z.instanceof(File, { message: "assets.fileRequired" }),
    filename: z
      .string()
      .min(3, { message: "assets.fileNameMinLength" })
      .regex(
        /^[\w,\.\(\)\s-]+\.[A-Za-z0-9]{1,6}$/gi,
        "assets.fileNameExtension",
      )
      .refine((filename) => checkUniqueFileName(filename), {
        message: "assets.fileNameUnique",
      }),
    mimeType: z.string(),
    description: z.string().optional(),
  });

  type FileFormValues = z.infer<typeof formSchema>;

  const form = useForm<FileFormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {},
  });

  const file = form.watch("file");
  const filename = file?.name;
  React.useEffect(() => {
    if (filename) {
      let fileType = mimeType.lookup(filename);
      if (!fileType) {
        fileType = "application/octet-stream";
      } else if (Array.isArray(fileType)) {
        fileType = fileType[0];
      }

      form.setValue("filename", filename);
      form.setValue("mimeType", fileType);
      form.trigger("filename");
    }
  }, [filename, form]);

  const onSubmit = async (data: FileFormValues) => {
    try {
      setLoading(true);

      const formData = new FormData();
      const { file, ...rest } = data;

      formData.append("file", file);
      Object.entries(rest).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      await toastPromise(createAsset(formData), {
        success: t("assets.toasts.changesSaved"),
        error: t("common.toasts.error"),
      });

      router.push(`/admin/dashboard/assets`);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("assets.form.asset")}</FormLabel>
              <FormControl>
                <DndFileInput
                  disabled={loading}
                  value={field.value ? [field.value] : []}
                  onChange={(value) => {
                    field.onChange(value?.[0]);
                    field.onBlur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="gap-2 flex flex-col md:grid md:grid-cols-2 md:gap-4">
          <FormField
            control={form.control}
            name="filename"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("assets.form.fileName")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("assets.form.fileNamePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("assets.form.description")}</FormLabel>
                <FormControl>
                  <Textarea
                    autoResize
                    disabled={loading}
                    placeholder={t("assets.form.descriptionPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <SaveButton form={form} />
      </form>
    </Form>
  );
};
