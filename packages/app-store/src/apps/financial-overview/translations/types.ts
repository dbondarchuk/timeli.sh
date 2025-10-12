import { Leaves } from "@vivid/types";
import type admin from "./en/admin.json";

export type FinancialOverviewAdminKeys = Leaves<typeof admin>;
export const financialOverviewAdminNamespace =
  "app_financial-overview_admin" as const;

export type FinancialOverviewAdminNamespace =
  typeof financialOverviewAdminNamespace;
