import { WithDatabaseId } from "../database";

export type Organization = WithDatabaseId<{
  slug: string;
  domain?: string;
  isInstalled?: boolean;
}>;
