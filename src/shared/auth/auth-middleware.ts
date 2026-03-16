import { createMiddleware } from "hono/factory";
import { verifyToken } from "./jwt";
import { UnauthorizedHttpException } from "../http/http-exception";

type AuthEnv = {
  Variables: { userId: number; email: string };
};

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedHttpException("Missing or invalid authorization header");
  }
  try {
    const { sub, email } = await verifyToken(header.slice(7));
    c.set("userId", sub);
    c.set("email", email);
  } catch {
    throw new UnauthorizedHttpException("Invalid or expired token");
  }
  await next();
});
