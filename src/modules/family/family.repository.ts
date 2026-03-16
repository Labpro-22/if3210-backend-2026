import { db } from "../../db";
import { families, familyMemberships, users } from "../../db/schema";
import { eq, desc, and, inArray, notExists, sql, asc, max } from "drizzle-orm";

export async function createFamilyTx(
  createdBy: number,
  name: string,
  iconUrl: string,
  familyCode: string
) {
  return await db.transaction(async (tx) => {
    const [family] = await tx
      .insert(families)
      .values({ name, iconUrl, familyCode, createdBy })
      .returning();
    await tx.insert(familyMemberships).values({ familyId: family!.id, userId: createdBy });
    return family!;
  });
}

export async function listFamilySummaries() {
  return db
    .select({
      id: families.id,
      name: families.name,
      iconUrl: families.iconUrl,
      createdAt: families.createdAt,
    })
    .from(families)
    .orderBy(desc(families.createdAt));
}

export async function listJoinedFamiliesWithMembers(userId: number) {
  const rows = await db
    .select({
      id: families.id,
      name: families.name,
      iconUrl: families.iconUrl,
      familyCode: families.familyCode,
      createdAt: families.createdAt,
      updatedAt: families.updatedAt,
      memberId: users.id,
      memberFullName: users.fullName,
      memberEmail: users.email,
      memberJoinedAt: familyMemberships.joinedAt,
    })
    .from(families)
    .innerJoin(
      familyMemberships,
      and(
        eq(familyMemberships.familyId, families.id),
        // first join: ensure user is a member
        eq(families.id, families.id)
      )
    )
    .innerJoin(users, eq(users.id, familyMemberships.userId))
    .where(
      // only families the user belongs to
      sql`${families.id} IN (SELECT family_id FROM family_memberships WHERE user_id = ${userId})`
    )
    .orderBy(desc(families.createdAt), asc(users.fullName));
  return rows;
}

export async function findFamilyDetail(familyId: number) {
  const rows = await db
    .select()
    .from(families)
    .where(eq(families.id, familyId))
    .limit(1);
  return rows[0] ?? null;
}

export async function isFamilyMember(familyId: number, userId: number) {
  const rows = await db
    .select({ v: sql<number>`1` })
    .from(familyMemberships)
    .where(and(eq(familyMemberships.familyId, familyId), eq(familyMemberships.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

export async function listFamilyMembers(familyId: number) {
  return db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      joinedAt: familyMemberships.joinedAt,
    })
    .from(familyMemberships)
    .innerJoin(users, eq(users.id, familyMemberships.userId))
    .where(eq(familyMemberships.familyId, familyId))
    .orderBy(asc(users.fullName));
}

export async function joinFamily(familyId: number, userId: number) {
  await db.insert(familyMemberships).values({ familyId, userId });
}

export async function leaveFamily(familyId: number, userId: number) {
  await db
    .delete(familyMemberships)
    .where(and(eq(familyMemberships.familyId, familyId), eq(familyMemberships.userId, userId)));
}

// Discover
export async function findMaxFamilyId() {
  const rows = await db.select({ maxId: max(families.id) }).from(families);
  return rows[0]?.maxId ?? 0;
}

export async function listDiscoverFamiliesByIds(candidateIds: number[], userId: number) {
  if (candidateIds.length === 0) return [];
  const rows = await db
    .select({
      id: families.id,
      name: families.name,
      iconUrl: families.iconUrl,
      createdAt: families.createdAt,
      memberFullName: users.fullName,
      memberEmail: users.email,
    })
    .from(families)
    .leftJoin(familyMemberships, eq(familyMemberships.familyId, families.id))
    .leftJoin(users, eq(users.id, familyMemberships.userId))
    .where(
      and(
        inArray(families.id, candidateIds),
        notExists(
          db
            .select({ v: sql<number>`1` })
            .from(familyMemberships)
            .where(
              and(
                eq(familyMemberships.familyId, families.id),
                eq(familyMemberships.userId, userId)
              )
            )
        )
      )
    )
    .orderBy(asc(families.id));
  return rows;
}
