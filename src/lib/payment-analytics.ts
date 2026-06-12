import { track } from "@vercel/analytics/react";
import {
  PAYMENT_EVENT_BASE_PROPERTIES,
  type PaymentEventName,
  type PaymentEventProperties,
} from "@/lib/payment-events";

export function trackClientPaymentEvent(
  eventName: PaymentEventName,
  properties: PaymentEventProperties = {},
) {
  track(eventName, {
    ...PAYMENT_EVENT_BASE_PROPERTIES,
    ...properties,
  });
}
