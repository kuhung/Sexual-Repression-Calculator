import { Hono } from "hono";
import stripeRoutes from "./stripe.js";

export function setupRoutes(app: Hono) {
  const routes = new Hono();

  routes.get("/health", (c) => c.json({ status: "ok", ts: Date.now() }));
  routes.route("/", stripeRoutes);

  const entry = app.route("/api", routes);

  return entry;
}

export type AppType = ReturnType<typeof setupRoutes>;
