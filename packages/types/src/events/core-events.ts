/** Core platform event type strings (emitted from @timelish/services). Payload shape is per event. */

export const CUSTOMER_CREATED_EVENT_TYPE = "customer.created" as const;
export const CUSTOMER_UPDATED_EVENT_TYPE = "customer.updated" as const;
export const CUSTOMER_DELETED_EVENT_TYPE = "customer.deleted" as const;

export const PAYMENT_CREATED_EVENT_TYPE = "payment.created" as const;
export const PAYMENT_UPDATED_EVENT_TYPE = "payment.updated" as const;
export const PAYMENT_DELETED_EVENT_TYPE = "payment.deleted" as const;
export const PAYMENT_REFUNDED_EVENT_TYPE = "payment.refunded" as const;

export const GIFT_CARD_CREATED_EVENT_TYPE = "giftCard.created" as const;
export const GIFT_CARD_UPDATED_EVENT_TYPE = "giftCard.updated" as const;
export const GIFT_CARD_STATUS_CHANGED_EVENT_TYPE =
  "giftCard.statusChanged" as const;
export const GIFT_CARD_DELETED_EVENT_TYPE = "giftCard.deleted" as const;

export const FIELD_CREATED_EVENT_TYPE = "field.created" as const;
export const FIELD_UPDATED_EVENT_TYPE = "field.updated" as const;
export const FIELD_DELETED_EVENT_TYPE = "field.deleted" as const;

export const ADDON_CREATED_EVENT_TYPE = "addon.created" as const;
export const ADDON_UPDATED_EVENT_TYPE = "addon.updated" as const;
export const ADDON_DELETED_EVENT_TYPE = "addon.deleted" as const;

export const APPOINTMENT_OPTION_CREATED_EVENT_TYPE =
  "appointmentOption.created" as const;
export const APPOINTMENT_OPTION_UPDATED_EVENT_TYPE =
  "appointmentOption.updated" as const;
export const APPOINTMENT_OPTION_DELETED_EVENT_TYPE =
  "appointmentOption.deleted" as const;

export const DISCOUNT_CREATED_EVENT_TYPE = "discount.created" as const;
export const DISCOUNT_UPDATED_EVENT_TYPE = "discount.updated" as const;
export const DISCOUNT_DELETED_EVENT_TYPE = "discount.deleted" as const;
export const DISCOUNT_APPLIED_EVENT_TYPE = "discount.applied" as const;

export const APPOINTMENT_CREATED_EVENT_TYPE = "appointment.created" as const;
/** Reschedule with full appointment + slot fields (see booking service). */
export const APPOINTMENT_RESCHEDULED_EVENT_TYPE =
  "appointment.rescheduled" as const;
/** Reschedule by time/duration deltas (see booking service). */
export const APPOINTMENT_SLOT_RESCHEDULED_EVENT_TYPE =
  "appointment.slotRescheduled" as const;
export const APPOINTMENT_STATUS_CHANGED_EVENT_TYPE =
  "appointment.statusChanged" as const;

export const APP_INSTALLED_EVENT_TYPE = "app.installed" as const;
export const APP_UNINSTALLED_EVENT_TYPE = "app.uninstalled" as const;
export const APP_CONNECTED_EVENT_TYPE = "app.connected" as const;
export const APP_FAILED_EVENT_TYPE = "app.failed" as const;
