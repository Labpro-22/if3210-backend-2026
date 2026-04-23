import { db } from "../../db";
import { deviceTokens } from "../../db/schema";
import { eq, inArray } from "drizzle-orm";

export async function upsertDeviceToken(userId: number, fcmToken: string) {
  await db
    .insert(deviceTokens)
    .values({ userId, fcmToken })
    .onConflictDoUpdate({
      target: deviceTokens.userId,
      set: { fcmToken, updatedAt: new Date() },
    });
}

export async function deleteDeviceToken(userId: number) {
  await db.delete(deviceTokens).where(eq(deviceTokens.userId, userId));
}

export async function findTokenByUserId(userId: number) {
  const rows = await db
    .select({ fcmToken: deviceTokens.fcmToken })
    .from(deviceTokens)
    .where(eq(deviceTokens.userId, userId))
    .limit(1);
  return rows[0]?.fcmToken ?? null;
}

export async function findTokensByUserIds(userIds: number[]) {
  if (userIds.length === 0) return [];
  return db
    .select({ userId: deviceTokens.userId, fcmToken: deviceTokens.fcmToken })
    .from(deviceTokens)
    .where(inArray(deviceTokens.userId, userIds));
}
