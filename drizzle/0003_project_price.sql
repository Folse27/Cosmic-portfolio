ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "price_amount" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "price_type" text;