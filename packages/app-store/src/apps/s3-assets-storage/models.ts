import { z } from "zod";
import { S3AssetsStorageAdminAllKeys } from "./translations/types";

export const s3ConfigurationSchema = z.object({
  region: z
    .string()
    .min(
      1,
      "app_s3-assets-storage_admin.validation.form.region.required" satisfies S3AssetsStorageAdminAllKeys,
    ),
  accessKeyId: z
    .string()
    .min(
      1,
      "app_s3-assets-storage_admin.validation.form.accessKeyId.required" satisfies S3AssetsStorageAdminAllKeys,
    ),
  secretAccessKey: z
    .string()
    .min(
      1,
      "app_s3-assets-storage_admin.validation.form.secretAccessKey.required" satisfies S3AssetsStorageAdminAllKeys,
    ),
  endpoint: z
    .string()
    .url(
      "app_s3-assets-storage_admin.validation.form.endpoint.url" satisfies S3AssetsStorageAdminAllKeys,
    )
    .optional(),
  bucket: z.string().optional(),
  forcePathStyle: z.coerce.boolean().optional(),
});

export type S3Configuration = z.infer<typeof s3ConfigurationSchema>;
