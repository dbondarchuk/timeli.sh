import { Page } from "@timelish/types";
import { cache } from "react";

export type PageDataStore = {
  params: Record<string, any>;
  searchParams: Record<string, any | undefined | null>;
  page: Page;
};

const getStore = cache(() => ({
  data: {
    params: {},
    searchParams: {},
    page: {},
  } as PageDataStore,
}));

export const getPageData = () => getStore().data;

export const setPageData = (data: PageDataStore) => {
  getStore().data = data;
};
