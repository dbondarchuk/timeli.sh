import { CustomerTabInjectorApp } from "@timelish/types";
import { FORMS_APP_NAME } from "../apps/forms/const";
import { FormsCustomerTabInjector } from "../apps/forms/customer-tab-injector";

export const CustomerTabInjectorApps: Record<string, CustomerTabInjectorApp> = {
  [FORMS_APP_NAME]: FormsCustomerTabInjector,
};
