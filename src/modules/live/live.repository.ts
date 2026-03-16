import { db } from "../../db";
import { familyMemberships } from "../../db/schema";
import { eq, and, ne } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function listSharedPeerUserIds(userId: number): Promise<number[]> {
  const rows = await db
    .selectDistinct({ userId: familyMemberships.userId })
    .from(familyMemberships)
    .where(
      and(
        ne(familyMemberships.userId, userId),
        sql`${familyMemberships.familyId} IN (SELECT family_id FROM family_memberships WHERE user_id = ${userId})`
      )
    );
  return rows.map((r) => r.userId);
}

export async function listFamilyIdsByUserId(userId: number): Promise<number[]> {
  const rows = await db
    .select({ familyId: familyMemberships.familyId })
    .from(familyMemberships)
    .where(eq(familyMemberships.userId, userId));
  return rows.map((r) => r.familyId);
}
