import { handle } from "@hono/node-server/vercel";
import { Hono } from "hono";
import { setupRoutes } from "../src/server/routes/index.js";

const app = new Hono();

setupRoutes(app);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
export default handle(app);
