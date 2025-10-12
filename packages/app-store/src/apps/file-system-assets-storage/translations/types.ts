import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { FILE_SYSTEM_ASSETS_STORAGE_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export type FileSystemAssetsStorageAdminKeys = Leaves<typeof adminKeys>;
export const fileSystemAssetsStorageAdminNamespace =
  `app_${FILE_SYSTEM_ASSETS_STORAGE_APP_NAME}_admin` as const;

export type FileSystemAssetsStorageAdminNamespace =
  typeof fileSystemAssetsStorageAdminNamespace;
export type FileSystemAssetsStorageAdminAllKeys = AllKeys<
  FileSystemAssetsStorageAdminNamespace,
  FileSystemAssetsStorageAdminKeys
>;
