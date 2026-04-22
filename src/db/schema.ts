import {
  pgTable,
  integer,
  varchar,
  char,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nim: varchar({ length: 8 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  profileImageUrl: varchar("profile_image_url", { length: 512 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const families = pgTable(
  "families",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    iconUrl: varchar("icon_url", { length: 255 }).notNull(),
    familyCode: char("family_code", { length: 6 }).notNull().unique(),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_families_created_at").on(t.createdAt.desc())],
);

export const familyMemberships = pgTable(
  "family_memberships",
  {
    familyId: integer("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.familyId, t.userId] }),
    index("idx_family_memberships_user_id").on(t.userId),
    index("idx_family_memberships_family_id").on(t.familyId),
  ],
);

export const deviceTokens = pgTable("device_tokens", {
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  fcmToken: varchar("fcm_token", { length: 4096 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
