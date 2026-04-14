"use client";

import { createContext, useContext } from "react";
import type { CustomerProfile } from "./types";

export const CustomerProfileContext = createContext<CustomerProfile | null>(
  null,
);

export const useCustomerProfile = () => useContext(CustomerProfileContext);
