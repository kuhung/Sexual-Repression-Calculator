export const PAYMENT_PRODUCT = "sri_full_report";
export const PAYMENT_FLOW = "stripe_hosted_checkout";
export const PAYMENT_EVENT_VERSION = 1;

export const PAYMENT_EVENTS = {
  checkoutIntent: "Checkout Intent",
  checkoutCreated: "Checkout Created",
  checkoutClientFailed: "Checkout Client Failed",
  checkoutFailed: "Checkout Failed",
  checkoutCancelled: "Checkout Cancelled",
  paymentVerified: "Payment Verified",
  paymentVerificationPending: "Payment Verification Pending",
  paymentVerificationFailed: "Payment Verification Failed",
  reportUnlocked: "Report Unlocked",
  reportUnlockFailed: "Report Unlock Failed",
} as const;

export type PaymentEventName =
  (typeof PAYMENT_EVENTS)[keyof typeof PAYMENT_EVENTS];

export type PaymentEventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export const PAYMENT_EVENT_BASE_PROPERTIES = {
  event_version: PAYMENT_EVENT_VERSION,
  product: PAYMENT_PRODUCT,
  payment_flow: PAYMENT_FLOW,
} as const;
