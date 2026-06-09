import { Hono } from "hono";
import stripeRoutes from "./stripe";

export function setupRoutes(app: Hono) {
  const routes = new Hono();
  
  routes.route("/", stripeRoutes);

  const entry = app.route("/api", routes);

  return entry;
}

export type AppType = ReturnType<typeof setupRoutes>;
