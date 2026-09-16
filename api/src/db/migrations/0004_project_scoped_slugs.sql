ALTER TABLE "blueprints" DROP CONSTRAINT "blueprints_slug_unique";--> statement-breakpoint
CREATE INDEX "blueprints_slug_idx" ON "blueprints" USING btree ("slug");