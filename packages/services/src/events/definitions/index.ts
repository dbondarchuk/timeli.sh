import type { EventDefinition } from "@timelish/types";

import { APP_EVENT_DEFINITIONS } from "./app/app-event-definitions";
import { ADDON_EVENT_DEFINITIONS } from "./addon/addon-event-definitions";
import { APPOINTMENT_EVENT_DEFINITIONS } from "./appointment/appointment-event-definitions";
import { APPOINTMENT_OPTION_EVENT_DEFINITIONS } from "./appointment-option/appointment-option-event-definitions";
import { CUSTOMER_EVENT_DEFINITIONS } from "./customer/customer-event-definitions";
import { DISCOUNT_EVENT_DEFINITIONS } from "./discount/discount-event-definitions";
import { FIELD_EVENT_DEFINITIONS } from "./field/field-event-definitions";
import { GIFT_CARD_EVENT_DEFINITIONS } from "./gift-card/gift-card-event-definitions";
import { PAYMENT_EVENT_DEFINITIONS } from "./payment/payment-event-definitions";

/** Core platform event definitions, grouped by domain under `definitions/` */
export const DOMAIN_EVENT_DEFINITIONS: Record<string, EventDefinition> = {
  ...APP_EVENT_DEFINITIONS,
  ...APPOINTMENT_EVENT_DEFINITIONS,
  ...CUSTOMER_EVENT_DEFINITIONS,
  ...PAYMENT_EVENT_DEFINITIONS,
  ...GIFT_CARD_EVENT_DEFINITIONS,
  ...FIELD_EVENT_DEFINITIONS,
  ...ADDON_EVENT_DEFINITIONS,
  ...APPOINTMENT_OPTION_EVENT_DEFINITIONS,
  ...DISCOUNT_EVENT_DEFINITIONS,
};
