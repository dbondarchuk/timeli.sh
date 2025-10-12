import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { S3_ASSETS_STORAGE_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type S3AssetsStorageAdminKeys = Leaves<typeof admin>;
export const s3AssetsStorageAdminNamespace =
  `app_${S3_ASSETS_STORAGE_APP_NAME}_admin` as const;

export type S3AssetsStorageAdminNamespace =
  typeof s3AssetsStorageAdminNamespace;

export type S3AssetsStorageAdminAllKeys = AllKeys<
  S3AssetsStorageAdminNamespace,
  S3AssetsStorageAdminKeys
>;
