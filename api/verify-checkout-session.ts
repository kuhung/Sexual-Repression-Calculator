import Stripe from "stripe";

export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(secretKey);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutSessionId = searchParams.get("session_id")?.trim() || "";
    const expectedSessionId =
      searchParams.get("expected_session_id")?.trim() || "";

    if (!checkoutSessionId || !checkoutSessionId.startsWith("cs_")) {
      return Response.json(
        { error: "Invalid Stripe Checkout Session id" },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const checkoutSession =
      await stripe.checkout.sessions.retrieve(checkoutSessionId);

    if (checkoutSession.metadata?.product !== "sri_full_report") {
      return Response.json(
        { error: "Checkout Session is not for this product" },
        { status: 400 },
      );
    }

    if (expectedSessionId) {
      const paidForSessionId =
        checkoutSession.client_reference_id ||
        checkoutSession.metadata?.sessionId ||
        "";
      if (paidForSessionId && paidForSessionId !== expectedSessionId) {
        return Response.json(
          { error: "Checkout Session does not match the requested assessment" },
          { status: 403 },
        );
      }
    }

    if (checkoutSession.payment_status !== "paid") {
      return Response.json(
        { unlocked: false, paymentStatus: checkoutSession.payment_status },
        { status: 402 },
      );
    }

    console.log("[verify] session verified:", checkoutSession.id);
    return Response.json({
      unlocked: true,
      checkoutSessionId: checkoutSession.id,
      sessionId:
        checkoutSession.client_reference_id ||
        checkoutSession.metadata?.sessionId ||
        "",
      amountTotal: checkoutSession.amount_total,
      currency: checkoutSession.currency,
      paidAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[verify] Failed to verify Stripe Checkout Session:", error);
    return Response.json(
      { error: "Unable to verify checkout" },
      { status: 500 },
    );
  }
}
