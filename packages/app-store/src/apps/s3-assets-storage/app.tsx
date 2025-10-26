import { App } from "@vivid/types";
import { S3_ASSETS_STORAGE_APP_NAME } from "./const";
import { S3Logo } from "./logo";
import {
  S3AssetsStorageAdminKeys,
  S3AssetsStorageAdminNamespace,
} from "./translations/types";

export const S3AssetsStorageApp: App<
  S3AssetsStorageAdminNamespace,
  S3AssetsStorageAdminKeys
> = {
  name: S3_ASSETS_STORAGE_APP_NAME,
  displayName: "app_s3-assets-storage_admin.app.displayName",
  scope: ["assets-storage"],
  category: ["apps.categories.storage"],
  type: "basic",
  Logo: ({ className }) => <S3Logo className={className} />,
  description: {
    text: "app_s3-assets-storage_admin.app.description",
  },
};
