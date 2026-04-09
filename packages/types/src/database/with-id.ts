export type DatabaseId = {
  _id: string;
};

export type WithDatabaseId<T> = T & DatabaseId;
export type WithOrganizationId<T> = T & { organizationId: string };
export type WithAppId<T> = T & { appId: string };
export type WithUserId<T> = T & { userId: string };
