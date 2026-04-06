CREATE TYPE "public"."project_member_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TABLE "blueprint_projects" (
	"blueprint_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"added_by" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blueprint_projects_blueprint_id_project_id_pk" PRIMARY KEY("blueprint_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "project_member_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_members_unique" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "blueprints" DROP CONSTRAINT "blueprints_project_slug";--> statement-breakpoint
ALTER TABLE "blueprints" DROP CONSTRAINT "blueprints_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "blueprint_projects" ADD CONSTRAINT "blueprint_projects_blueprint_id_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "public"."blueprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blueprint_projects" ADD CONSTRAINT "blueprint_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blueprint_projects" ADD CONSTRAINT "blueprint_projects_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "blueprint_projects" ("blueprint_id", "project_id", "added_by", "added_at")
SELECT "id", "project_id", "author_id", "created_at"
FROM "blueprints"
WHERE "project_id" IS NOT NULL
ON CONFLICT DO NOTHING;--> statement-breakpoint
ALTER TABLE "blueprints" DROP COLUMN "project_id";--> statement-breakpoint
ALTER TABLE "blueprints" ADD CONSTRAINT "blueprints_slug_unique" UNIQUE("slug");