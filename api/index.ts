export const runtime = "nodejs";

export function GET() {
  return Response.json({
    status: "ok",
    endpoints: [
      "GET  /api/health",
      "POST /api/create-checkout-session",
      "GET  /api/verify-checkout-session",
    ],
  });
}
