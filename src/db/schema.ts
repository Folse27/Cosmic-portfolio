import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/** External link attached to a project or a contact/social entry. */
export type LinkItem = { label: string; url: string };

/** How a project's price reads: "from 800 €", "800 €" or "25 € per hour". */
export const PRICE_TYPES = ["from", "fixed", "hourly"] as const;
export type PriceType = (typeof PRICE_TYPES)[number];

/**
 * Per-language overrides for CMS text. The plain columns hold the English
 * base; a missing or empty translated field falls back to it.
 */
export type Translations<T> = Partial<Record<"de" | "ru", Partial<T>>>;
export type SettingsText = { title: string; tagline: string; bio: string; metaDescription: string; skills: string[] };
/** Editable copy of the homepage's data-protection and contact sections, per language. */
export type InfoBox = { title: string; text: string };
export type SectionCopy = {
  dataKicker: string;
  dataTitle: string;
  dataPoints: InfoBox[];
  contactKicker: string;
  contactTitle: string;
  contactIntro: string;
};
export type SectionCopyByLang = Partial<Record<"en" | "de" | "ru", Partial<SectionCopy>>>;

export type ProjectText = {
  title: string;
  dateLabel: string; // a date range or, for services, a duration ("~1–2 weeks")
  summary: string;
  description: string;
  problems: string[];
  solution: string;
  outcomes: string[];
  note: string;
  tags: string[];
};

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

/* ── Auth ─────────────────────────────────────────────────────────────── */

export const adminUsers = pgTable("admin_users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ── Editable site content (single row, id = "singleton") ─────────────── */

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey(), // always "singleton"
  name: text("name").notNull().default("[YOUR NAME]"),
  navName: text("nav_name"), // top-left header label; null = use `name`
  title: text("title").notNull().default("[YOUR TITLE / TAGLINE]"),
  tagline: text("tagline").notNull().default(""),
  bio: text("bio").notNull().default(""),
  profileImage: text("profile_image"),
  logoImage: text("logo_image"), // header logo; null = built-in placeholder
  email: text("email"),
  metaDescription: text("meta_description").notNull().default(""),
  skills: text("skills")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  socials: jsonb("socials")
    .$type<LinkItem[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  translations: jsonb("translations")
    .$type<Translations<SettingsText>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  // Empty fields fall back to the built-in texts in src/lib/i18n.ts.
  sectionCopy: jsonb("section_copy")
    .$type<SectionCopyByLang>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ── Projects ─────────────────────────────────────────────────────────── */

export const projects = pgTable("projects", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  dateLabel: text("date_label"), // freeform display date, e.g. "01.05.2026 – 05.07.2026"
  priceAmount: integer("price_amount"), // whole euros; null = no price shown
  priceType: text("price_type").$type<PriceType>(),
  summary: text("summary").notNull().default(""), // short card blurb
  description: text("description").notNull().default(""),
  problems: text("problems")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  solution: text("solution").notNull().default(""),
  outcomes: text("outcomes")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  note: text("note"), // optional "important note" callout
  coverImage: text("cover_image"),
  gallery: text("gallery")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  links: jsonb("links")
    .$type<LinkItem[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  translations: jsonb("translations")
    .$type<Translations<ProjectText>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  featured: boolean("featured").notNull().default(false), // leads the homepage grid
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ── First-party analytics ────────────────────────────────────────────── */

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 16 }).notNull(), // "view" | "click"
    path: varchar("path", { length: 512 }).notNull(),
    elementId: varchar("element_id", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("events_created_idx").on(t.createdAt),
    index("events_type_created_idx").on(t.type, t.createdAt),
  ],
);

/* ── Contact form submissions ─────────────────────────────────────────── */

export const contactMessages = pgTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ── Uploaded media (Vercel Blob) ─────────────────────────────────────── */

export const mediaImages = pgTable("media_images", {
  id: id(),
  url: text("url").notNull(),
  pathname: text("pathname"), // blob pathname, used for deletion
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ── Rate limiting (see src/lib/rate-limit.ts) ─────────────────────────── */

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(), // bucket + hashed client address, never the raw IP
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

/* ── Inferred row types ───────────────────────────────────────────────── */

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type MediaImage = typeof mediaImages.$inferSelect;
