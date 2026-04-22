import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { authMiddleware } from "../../shared/auth/auth-middleware";
import { jsonValidator } from "../../shared/validation/zod-validator";
import { UpdateMeRequestDto } from "./profile.dto";
import * as profileController from "./profile.controller";

export const profileRouter = new Hono();

profileRouter.use("/me", authMiddleware);
profileRouter.get("/me", (c) => profileController.getMe(c));
profileRouter.patch("/me", jsonValidator(UpdateMeRequestDto), (c) =>
  profileController.updateMe(c),
);

profileRouter.use("/me/photo", authMiddleware);
profileRouter.post("/me/photo", bodyLimit({ maxSize: 512_000 }), (c) =>
  profileController.uploadPhoto(c),
);
