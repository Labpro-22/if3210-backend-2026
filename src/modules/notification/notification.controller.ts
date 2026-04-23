import type { Context } from "hono";
import * as notificationService from "./notification.service";
import {
  FamilyNotFoundServiceError,
  NotFamilyMemberServiceError,
  TargetNotFamilyMemberServiceError,
  TargetUserNotFoundServiceError,
} from "./notification.error";
import {
  NotFoundHttpException,
  ForbiddenHttpException,
} from "../../shared/http/http-exception";

export async function subscribe(c: Context) {
  const { fcmToken } = c.req.valid("json" as never) as { fcmToken: string };
  await notificationService.subscribe(
    c.get("userId" as never) as number,
    fcmToken,
  );
  return c.json({ data: { subscribed: true } });
}

export async function unsubscribe(c: Context) {
  await notificationService.unsubscribe(c.get("userId" as never) as number);
  return c.json({ data: { unsubscribed: true } });
}

export async function send(c: Context) {
  const { familyId, message } = c.req.valid("json" as never) as {
    familyId: number;
    message: string;
  };
  try {
    await notificationService.broadcastToFamily(
      c.get("userId" as never) as number,
      familyId,
      message,
    );
    return c.json({ data: { sent: true } });
  } catch (e) {
    if (e instanceof FamilyNotFoundServiceError)
      throw new NotFoundHttpException(e.message);
    if (e instanceof NotFamilyMemberServiceError)
      throw new ForbiddenHttpException(e.message);
    throw e;
  }
}

export async function greeting(c: Context) {
  const { familyId, targetUserId, message } = c.req.valid("json" as never) as {
    familyId: number;
    targetUserId: number;
    message: string;
  };
  try {
    const result = await notificationService.sendGreeting(
      c.get("userId" as never) as number,
      familyId,
      targetUserId,
      message,
    );
    return c.json({ data: result });
  } catch (e) {
    if (e instanceof FamilyNotFoundServiceError)
      throw new NotFoundHttpException(e.message);
    if (e instanceof NotFamilyMemberServiceError)
      throw new ForbiddenHttpException(e.message);
    if (e instanceof TargetNotFamilyMemberServiceError)
      throw new ForbiddenHttpException(e.message);
    if (e instanceof TargetUserNotFoundServiceError)
      throw new NotFoundHttpException(e.message);
    throw e;
  }
}
