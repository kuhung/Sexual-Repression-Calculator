import { Hono } from "hono";
import Stripe from "stripe";

const DEFAULT_PRODUCT_NAME = "性压抑指数完整报告";
const DEFAULT_AMOUNT = 990;
const DEFAULT_CURRENCY = "cny";

function getStripe(c: any) {
  const secretKey = c.env?.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-05-27.dahlia" as any,
  });
}

function getSiteUrl(c: any) {
  const req = c.req.raw;
  const configuredUrl =
    process.env.PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`.replace(/\/$/, "");
  }

  const url = new URL(c.req.url);
  return `${url.protocol}//${url.host}`.replace(/\/$/, "");
}

function getLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId = process.env.STRIPE_FULL_REPORT_PRICE_ID;

  if (priceId) {
    return {
      price: priceId,
      quantity: 1,
    };
  }

  const amount = Number(process.env.STRIPE_REPORT_PRICE_AMOUNT || DEFAULT_AMOUNT);
  const currency = (process.env.STRIPE_REPORT_PRICE_CURRENCY || DEFAULT_CURRENCY).toLowerCase();
  const productName = process.env.STRIPE_REPORT_PRODUCT_NAME || "性压抑指数完整报告";

  return {
    quantity: 1,
    price_data: {
      currency,
      unit_amount: Number.isFinite(amount) && amount > 0 ? amount : DEFAULT_AMOUNT,
      product_data: {
        name: productName,
        description: "解锁完整的性压抑指数评估报告，包含详细维度分析与行动建议。",
      },
    },
  };
}

function isValidSessionId(sessionId: string) {
  return /^[a-zA-Z0-9:_-]{6,160}$/.test(sessionId);
}

const stripeRoutes = new Hono();

stripeRoutes.post("/create-checkout-session", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";

    if (!sessionId || !isValidSessionId(sessionId)) {
      return c.json({ error: "Invalid assessment session id" }, 400);
    }

    const siteUrl = getSiteUrl(c);
    const termsUrl = `${siteUrl}/terms`;
    const privacyUrl = `${siteUrl}/privacy`;
    const refundUrl = `${siteUrl}/refunds`;
    const stripe = getStripe(c);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["alipay", "card"],
      billing_address_collection: "auto",
      line_items: [getLineItem()],
      success_url: `${siteUrl}/results?sessionId=${encodeURIComponent(
        sessionId,
      )}&checkout=success&checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/results?sessionId=${encodeURIComponent(sessionId)}&checkout=cancelled`,
      client_reference_id: sessionId,
      metadata: {
        product: "sri_full_report",
        sessionId,
      },
      custom_text: {
        submit: {
          message: `本产品为一次性数字报告解锁。付款日起7天内可无条件全额退款，请发送订单时间与邮箱至 refund@kuhung.me 申请。`,
        },
      },
    });

    return c.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Failed to create Stripe Checkout Session:", error);
    return c.json({ error: "Unable to start checkout" }, 500);
  }
});

stripeRoutes.get("/verify-checkout-session", async (c) => {
  try {
    const checkoutSessionId = c.req.query("session_id")?.trim() || "";

    if (!checkoutSessionId || !checkoutSessionId.startsWith("cs_")) {
      return c.json({ error: "Invalid Stripe Checkout Session id" }, 400);
    }

    const stripe = getStripe(c);
    const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId);

    if (checkoutSession.metadata?.product !== "sri_full_report") {
      return c.json({ error: "Checkout Session is not for this product" }, 400);
    }

    if (checkoutSession.payment_status !== "paid") {
      return c.json({
        unlocked: false,
        paymentStatus: checkoutSession.payment_status,
      }, 402);
    }

    return c.json({
      unlocked: true,
      checkoutSessionId: checkoutSession.id,
      sessionId: checkoutSession.client_reference_id || checkoutSession.metadata?.sessionId || "",
      amountTotal: checkoutSession.amount_total,
      currency: checkoutSession.currency,
      paidAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to verify Stripe Checkout Session:", error);
    return c.json({ error: "Unable to verify checkout" }, 500);
  }
});

export default stripeRoutes;
