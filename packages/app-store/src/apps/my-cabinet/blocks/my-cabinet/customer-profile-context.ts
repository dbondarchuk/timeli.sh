"use client";

import { createContext, useContext } from "react";
import type { CustomerProfile } from "./types";

export type CustomerContextValue = {
  customer: CustomerProfile | null;
  timezone: string;
  setTimeZone: (tz: string) => void;
};

export const CustomerProfileContext = createContext<CustomerContextValue>({
  customer: null,
  timezone: "",
  setTimeZone: () => {},
});

export const useCustomerProfile = () => useContext(CustomerProfileContext);
