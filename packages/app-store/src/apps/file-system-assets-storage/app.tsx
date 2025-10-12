import { App } from "@vivid/types";
import { Folder } from "lucide-react";
import { FILE_SYSTEM_ASSETS_STORAGE_APP_NAME } from "./const";
import {
  FileSystemAssetsStorageAdminKeys,
  FileSystemAssetsStorageAdminNamespace,
} from "./translations/types";

export const FileSystemAssetsStorageApp: App<
  FileSystemAssetsStorageAdminNamespace,
  FileSystemAssetsStorageAdminKeys
> = {
  name: FILE_SYSTEM_ASSETS_STORAGE_APP_NAME,
  displayName: "app_file-system-assets-storage_admin.app.displayName",
  scope: ["assets-storage"],
  type: "system",
  category: ["apps.categories.storage"],
  Logo: ({ className }) => <Folder className={className} />,
  dontAllowMultiple: true,
  isHidden: true,
  description: {
    text: "app_file-system-assets-storage_admin.app.description",
  },
};
