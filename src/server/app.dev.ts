import { Hono } from "hono";
import { setupRoutes } from "./routes/index.js";

export const app = new Hono();

setupRoutes(app);
