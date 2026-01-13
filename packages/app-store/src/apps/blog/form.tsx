"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@timelish/i18n";
import { PlateEditor } from "@timelish/rte";
import {
  Breadcrumbs,
  Checkbox,
  DateTimePicker,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InfoTooltip,
  Input,
  TagInput,
  toastPromise,
  use12HourFormat,
} from "@timelish/ui";
import { SaveButton } from "@timelish/ui-admin";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createBlogPost, updateBlogPost } from "./actions";
import { BlogPost } from "./models";
import { blogPostSchema, blogPostTagSchema } from "./models/blog-post";
import {
  BlogAdminKeys,
  BlogAdminNamespace,
  blogAdminNamespace,
} from "./translations/types";

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

export const BlogPostForm: React.FC<{
  initialData?: BlogPost;
  appId: string;
}> = ({ initialData, appId }) => {
  const t = useI18n<BlogAdminNamespace, BlogAdminKeys>(blogAdminNamespace);
  const tAdmin = useI18n("admin");

  const [loading, setLoading] = useState(false);
  const [slugManuallyChanged, setSlugManuallyChanged] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialData || {
      isPublished: true,
      publicationDate: new Date(),
      tags: [],
      content: [],
    },
  });

  const slug = form.watch("slug");
  const title = form.watch("title");
  const isNewPost = !initialData;

  const breadcrumbItems = useMemo(
    () => [
      { title: tAdmin("navigation.dashboard"), link: "/dashboard" },
      { title: t("app.displayName"), link: "/dashboard/blog" },
      {
        title: initialData?._id ? initialData.title : t("app.pages.new.label"),
        link: initialData?._id
          ? `/dashboard/blog/${initialData._id}`
          : "/dashboard/blog/new",
      },
    ],
    [initialData?._id, initialData?.title, t, tAdmin],
  );

  // Auto-generate slug when title changes (only when slug hasn't been manually changed)
  // For new posts: always auto-generate if not manually changed
  // For existing posts: only auto-generate if slug was never manually changed
  React.useEffect(() => {
    if (!slugManuallyChanged && title && isNewPost) {
      const generatedSlug = generateSlug(title);
      if (generatedSlug && generatedSlug !== slug) {
        form.setValue("slug", generatedSlug);
        form.trigger("slug");
      }
    }
  }, [title, slugManuallyChanged, slug, form]);

  const onSubmit = async (data: z.infer<typeof blogPostSchema>) => {
    try {
      setLoading(true);

      const fn = async () => {
        if (!initialData?._id) {
          const result = await createBlogPost(appId, data);
          router.push(`/dashboard/blog/edit?id=${result._id}`);
        } else {
          await updateBlogPost(appId, initialData._id, data);
          router.refresh();
        }
      };

      await toastPromise(fn(), {
        success: t("form.toasts.changesSaved"),
        error: t("form.toasts.requestError"),
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <Breadcrumbs items={breadcrumbItems} />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full h-full space-y-8"
      >
        <div className="flex flex-col gap-2 w-full">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    className="md:text-xl lg:text-2xl font-bold tracking-tight border-0 w-full px-0"
                    autoFocus
                    h={"lg"}
                    disabled={loading}
                    placeholder={t("form.titlePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="lg:col-span-2 w-full flex-grow relative h-full">
                <FormLabel>
                  {t("form.content")}{" "}
                  <InfoTooltip>{t("form.contentTooltip")}</InfoTooltip>
                </FormLabel>
                <FormControl>
                  <div className="min-h-[400px] border rounded-md">
                    <PlateEditor
                      className="bg-background px-4 sm:px-4 pb-24 min-h-[400px]"
                      disabled={loading}
                      value={field.value || []}
                      onChange={(v) => {
                        field.onChange(v);
                        field.onBlur();
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t("form.slug")}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder={t("form.slugPlaceholder")}
                      onChange={(e) => {
                        field.onChange(e);
                        setSlugManuallyChanged(true);
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publicationDate"
              render={({ field }) => {
                const uses12HourFormat = use12HourFormat();
                return (
                  <FormItem>
                    <FormLabel>
                      {t("form.publicationDate")}{" "}
                      <InfoTooltip>
                        {t("form.publicationDateTooltip")}
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        use12HourFormat={uses12HourFormat}
                        onChange={(e) => {
                          field.onChange(e);
                          field.onBlur();
                        }}
                        value={field.value}
                        className="w-full"
                        classNames={{
                          trigger: "h-8 text-xs",
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("form.isPublished")}</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {t("form.isPublishedDescription")}
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.tags")}{" "}
                    <InfoTooltip>{t("form.tagsTooltip")}</InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <TagInput
                      {...field}
                      value={field.value || []}
                      onChange={(e) => {
                        field.onChange(e);
                        field.onBlur();
                      }}
                      h="sm"
                      tagValidator={blogPostTagSchema}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <SaveButton form={form} />
      </form>
    </Form>
  );
};
