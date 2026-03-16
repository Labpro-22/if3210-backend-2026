import type { ZodSchema } from "zod";
import { zValidator } from "@hono/zod-validator";

export const jsonValidator = <T extends ZodSchema>(schema: T) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: result.error.issues.map((i) => i.message).join(", "),
          },
        },
        400
      );
    }
  });
