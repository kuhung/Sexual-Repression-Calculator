import Stripe from "stripe";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-05-27.dahlia",
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const checkoutSessionId =
      typeof req.query?.session_id === "string" ? req.query.session_id.trim() : "";

    if (!checkoutSessionId || !checkoutSessionId.startsWith("cs_")) {
      return res.status(400).json({ error: "Invalid Stripe Checkout Session id" });
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId);

    if (checkoutSession.metadata?.product !== "sri_full_report") {
      return res.status(400).json({ error: "Checkout Session is not for this product" });
    }

    if (checkoutSession.payment_status !== "paid") {
      return res.status(402).json({
        unlocked: false,
        paymentStatus: checkoutSession.payment_status,
      });
    }

    return res.status(200).json({
      unlocked: true,
      checkoutSessionId: checkoutSession.id,
      sessionId: checkoutSession.client_reference_id || checkoutSession.metadata?.sessionId || "",
      amountTotal: checkoutSession.amount_total,
      currency: checkoutSession.currency,
      paidAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to verify Stripe Checkout Session:", error);
    return res.status(500).json({ error: "Unable to verify checkout" });
  }
}
