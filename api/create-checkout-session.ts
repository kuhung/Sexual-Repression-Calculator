import Stripe from "stripe";

const DEFAULT_PRODUCT_NAME = "SRI Full Report";
const DEFAULT_AMOUNT = 900;
const DEFAULT_CURRENCY = "hkd";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-05-27.dahlia",
  });
}

function getRequestBody(req: any) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function getSiteUrl(req: any) {
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

  const origin = req.headers?.origin;
  if (origin) {
    return origin.replace(/\/$/, "");
  }

  const host = req.headers?.["x-forwarded-host"] || req.headers?.host;
  const proto = req.headers?.["x-forwarded-proto"] || "https";
  return `${proto}://${host}`.replace(/\/$/, "");
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
  const productName = process.env.STRIPE_REPORT_PRODUCT_NAME || DEFAULT_PRODUCT_NAME;

  return {
    quantity: 1,
    price_data: {
      currency,
      unit_amount: Number.isFinite(amount) && amount > 0 ? amount : DEFAULT_AMOUNT,
      product_data: {
        name: productName,
        description: "Unlock the complete Sexual Repression Index assessment report.",
      },
    },
  };
}

function isValidSessionId(sessionId: string) {
  return /^[a-zA-Z0-9:_-]{6,160}$/.test(sessionId);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = getRequestBody(req);
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";

    if (!sessionId || !isValidSessionId(sessionId)) {
      return res.status(400).json({ error: "Invalid assessment session id" });
    }

    const siteUrl = getSiteUrl(req);
    const termsUrl = `${siteUrl}/terms`;
    const privacyUrl = `${siteUrl}/privacy`;
    const refundUrl = `${siteUrl}/refunds`;
    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
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
      allow_promotion_codes: true,
      consent_collection: {
        terms_of_service: "required",
      },
      custom_text: {
        submit: {
          message: `本产品为一次性数字报告解锁。付款日起7天内可无条件申请全额退款，详见[退款政策](${refundUrl})。`,
        },
        terms_of_service_acceptance: {
          message: `我已阅读并同意[SRI Calculator服务条款](${termsUrl})、[隐私政策](${privacyUrl})和[退款政策](${refundUrl})。`,
        },
      },
    });

    return res.status(200).json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Failed to create Stripe Checkout Session:", error);
    return res.status(500).json({ error: "Unable to start checkout" });
  }
}
