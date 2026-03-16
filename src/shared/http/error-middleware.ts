import type { ErrorHandler } from "hono";
import { HttpException } from "./http-exception";

export const errorMiddleware: ErrorHandler = (err, c) => {
  if (err instanceof HttpException) {
    return c.json(
      { error: { code: err.code, message: err.message } },
      err.statusCode as any
    );
  }
  console.error(err);
  return c.json(
    { error: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" } },
    500
  );
};
