ALTER TABLE "blueprints" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "blueprints" ADD COLUMN "forked_from_id" uuid;--> statement-breakpoint
ALTER TABLE "blueprints" ADD CONSTRAINT "blueprints_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blueprints" ADD CONSTRAINT "blueprints_forked_from_id_blueprints_id_fk" FOREIGN KEY ("forked_from_id") REFERENCES "public"."blueprints"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blueprints_project_idx" ON "blueprints" USING btree ("project_id");--> statement-breakpoint
-- Backfill the owning project from the join table: every blueprint belongs to
-- exactly one project today. NOT NULL, UNIQUE (project_id, slug) and dropping
-- blueprint_projects come in a later migration, once the deployed API no longer
-- reads the join table.
UPDATE "blueprints" b SET "project_id" = (
	SELECT bp."project_id" FROM "blueprint_projects" bp
	WHERE bp."blueprint_id" = b."id"
	ORDER BY bp."added_at" ASC
	LIMIT 1
) WHERE b."project_id" IS NULL;
