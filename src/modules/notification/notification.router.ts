import { Hono } from "hono";
import { authMiddleware } from "../../shared/auth/auth-middleware";
import { jsonValidator } from "../../shared/validation/zod-validator";
import {
  SubscribeRequestDto,
  SendNotificationRequestDto,
  GreetingRequestDto,
} from "./notification.dto";
import * as notificationController from "./notification.controller";

export const notificationRouter = new Hono();

notificationRouter.use("/notifications/*", authMiddleware);
notificationRouter.post(
  "/notifications/subscribe",
  jsonValidator(SubscribeRequestDto),
  (c) => notificationController.subscribe(c),
);
notificationRouter.post("/notifications/unsubscribe", (c) =>
  notificationController.unsubscribe(c),
);
notificationRouter.post(
  "/notifications/send",
  jsonValidator(SendNotificationRequestDto),
  (c) => notificationController.send(c),
);
notificationRouter.post(
  "/notifications/greeting",
  jsonValidator(GreetingRequestDto),
  (c) => notificationController.greeting(c),
);
