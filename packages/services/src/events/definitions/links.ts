import type { Payment } from "@timelish/types";

export const dashboardUrls = {
  customer: (id: string) => `/dashboard/customers/${id}`,
  customers: "/dashboard/customers",
  appointment: (id: string) => `/dashboard/appointments/${id}`,
  payment: (payment: Payment) =>
    payment.appointmentId
      ? `/dashboard/appointments/${payment.appointmentId}`
      : `/dashboard/customers/${payment.customerId}`,
  giftCard: (id: string) => `/dashboard/services/gift-cards/${id}`,
  giftCards: "/dashboard/services/gift-cards",
  field: (id: string) => `/dashboard/services/fields/${id}`,
  fields: "/dashboard/services/fields",
  addon: (id: string) => `/dashboard/services/addons/${id}`,
  addons: "/dashboard/services/addons",
  option: (id: string) => `/dashboard/services/options/${id}`,
  options: "/dashboard/services/options",
  discount: (id: string) => `/dashboard/services/discounts/${id}`,
  discounts: "/dashboard/services/discounts",
};
