import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const hospitals = pgTable(
  "hospitals",
  {
    id: text("id").primaryKey(),
    citySlug: text("city_slug").notNull(),
    cityName: text("city_name").notNull(),
    name: text("name").notNull(),
    facilityType: text("facility_type").notNull(),
    address: text("address"),
    phone: text("phone"),
    rating: doublePrecision("rating"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    hasPaidBirth: boolean("has_paid_birth"),
    freeBirthAvailable: boolean("free_birth_available"),
    payload: jsonb("payload").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_hospitals_city_slug").on(table.citySlug)],
);

export const courseCatalog = pgTable(
  "course_catalog",
  {
    id: integer("id").primaryKey(),
    payload: jsonb("payload").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [check("course_catalog_id_check", sql`${table.id} = 1`)],
);

export const productCatalog = pgTable(
  "product_catalog",
  {
    id: integer("id").primaryKey(),
    payload: jsonb("payload").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [check("product_catalog_id_check", sql`${table.id} = 1`)],
);

export const hospitalReviews = pgTable(
  "hospital_reviews",
  {
    id: serial("id").primaryKey(),
    hospitalId: text("hospital_id")
      .notNull()
      .references(() => hospitals.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    authorName: varchar("author_name", { length: 120 }).notNull(),
    rating: integer("rating"),
    birthType: text("birth_type"),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_hospital_reviews_hospital").on(table.hospitalId)],
);

export const productReviews = pgTable(
  "product_reviews",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id").notNull(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    authorName: varchar("author_name", { length: 120 }).notNull(),
    rating: integer("rating").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_product_reviews_product").on(table.productId)],
);

export const chapterProgress = pgTable(
  "chapter_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trackId: text("track_id").notNull(),
    chapterId: text("chapter_id").notNull(),
    completed: boolean("completed").default(true).notNull(),
    quizPassed: boolean("quiz_passed").default(false).notNull(),
    score: integer("score").default(0).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("chapter_progress_user_track_chapter_unique").on(
      table.userId,
      table.trackId,
      table.chapterId,
    ),
    index("idx_progress_user").on(table.userId),
  ],
);
