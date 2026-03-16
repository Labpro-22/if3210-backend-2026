import "dotenv/config";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { logger } from "hono/logger";
import { errorMiddleware } from "./shared/http/error-middleware";
import { authRouter } from "./modules/auth/auth.router";
import { profileRouter } from "./modules/profile/profile.router";
import { familyRouter } from "./modules/family/family.router";
import { liveRouter } from "./modules/live/live.ws";
import { serveStatic } from "hono/bun";
import { websocket } from "hono/bun";

const app = new Hono();

app.use(logger());
app.use(bodyLimit({ maxSize: 16 * 1024 }));
app.onError(errorMiddleware);

// Static assets
app.use("/assets/*", serveStatic({ root: "./public" }));

// Health check
app.get("/api/health", (c) => c.json({ data: { status: "ok" } }));

// Routes
app.route("/api", authRouter);
app.route("/api", profileRouter);
app.route("/api", familyRouter);
app.route("/", liveRouter);

const port = parseInt(process.env.PORT || "3000");
console.log(`Server running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
  websocket,
};
