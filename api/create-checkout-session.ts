import Stripe from "stripe";

export const runtime = "nodejs";

const DEFAULT_AMOUNT = 990;
const DEFAULT_CURRENCY = "cny";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(secretKey);
}

function getSiteUrl(reqUrl: string) {
  const configuredUrl =
    process.env.PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  try {
    return new URL(reqUrl).origin.replace(/\/$/, "");
  } catch {
    // Fall back to Vercel-provided hostnames when the request URL is unavailable.
  }

  const vercelUrl =
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`.replace(/\/$/, "");
  }

  return "";
}

function getLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId = process.env.STRIPE_FULL_REPORT_PRICE_ID;
  if (priceId) {
    return { price: priceId, quantity: 1 };
  }

  const amount = Number(
    process.env.STRIPE_REPORT_PRICE_AMOUNT || DEFAULT_AMOUNT,
  );
  const currency = (
    process.env.STRIPE_REPORT_PRICE_CURRENCY || DEFAULT_CURRENCY
  ).toLowerCase();
  const productName =
    process.env.STRIPE_REPORT_PRODUCT_NAME || "性压抑指数完整报告";

  return {
    quantity: 1,
    price_data: {
      currency,
      unit_amount: Number.isFinite(amount) && amount > 0 ? amount : DEFAULT_AMOUNT,
      product_data: {
        name: productName,
        description: "解锁完整的指数评估报告，包含详细维度分析与行动建议。",
      },
    },
  };
}

function isValidSessionId(sessionId: string) {
  return /^[a-zA-Z0-9:_-]{6,160}$/.test(sessionId);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const sessionId =
      typeof body.sessionId === "string" ? body.sessionId.trim() : "";

    if (!sessionId || !isValidSessionId(sessionId)) {
      return Response.json({ error: "Invalid assessment session id" }, { status: 400 });
    }

    const siteUrl = getSiteUrl(request.url);
    const stripe = getStripe();

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
          message:
            "本产品为一次性数字报告解锁。付款日起7天内可无条件全额退款，请发送订单时间与邮箱至 sri@kuhung.me 申请。",
        },
      },
    });

    console.log("[checkout] session created:", checkoutSession.id, "for:", sessionId);
    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[checkout] Failed to create Stripe Checkout Session:", error);
    return Response.json({ error: "Unable to start checkout" }, { status: 500 });
  }
}
