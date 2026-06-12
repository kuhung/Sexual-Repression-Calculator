import { track } from "@vercel/analytics/server";
import {
  PAYMENT_EVENT_BASE_PROPERTIES,
  type PaymentEventName,
  type PaymentEventProperties,
} from "../lib/payment-events.js";

export function classifyPaymentError(error: unknown) {
  if (error instanceof Error && error.message === "Missing STRIPE_SECRET_KEY") {
    return "missing_secret_key";
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as { code?: unknown; type?: unknown };
    if (typeof candidate.code === "string" && candidate.code.length <= 80) {
      return candidate.code;
    }
    if (typeof candidate.type === "string" && candidate.type.length <= 80) {
      return candidate.type;
    }
  }

  return "unknown";
}

export async function trackServerPaymentEvent(
  request: Request,
  eventName: PaymentEventName,
  properties: PaymentEventProperties = {},
) {
  await track(
    eventName,
    {
      ...PAYMENT_EVENT_BASE_PROPERTIES,
      deployment_environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      ...properties,
    },
    { request },
  );
}
