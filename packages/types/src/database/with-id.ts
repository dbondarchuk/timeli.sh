export type DatabaseId = {
  _id: string;
};

export type WithDatabaseId<T> = T & DatabaseId;
export type WithCompanyId<T> = T & { companyId: string };
export type WithAppId<T> = T & { appId: string };
