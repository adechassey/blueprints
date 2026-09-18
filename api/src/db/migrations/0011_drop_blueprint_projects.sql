ALTER TABLE "blueprint_projects" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "blueprint_projects" CASCADE;--> statement-breakpoint
ALTER TABLE "blueprints" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blueprints" ADD CONSTRAINT "blueprints_project_slug_unique" UNIQUE("project_id","slug");