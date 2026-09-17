CREATE TYPE "public"."blueprint_layer" AS ENUM('database', 'api', 'domain', 'ui', 'state', 'infra', 'testing', 'tooling');--> statement-breakpoint
CREATE TYPE "public"."technology_category" AS ENUM('language', 'framework', 'library', 'database', 'infra', 'tooling');--> statement-breakpoint
CREATE TABLE "blueprint_technologies" (
	"blueprint_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "blueprint_technologies_blueprint_id_technology_id_pk" PRIMARY KEY("blueprint_id","technology_id")
);
--> statement-breakpoint
CREATE TABLE "technologies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" "technology_category" DEFAULT 'library' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "technologies_name_unique" UNIQUE("name"),
	CONSTRAINT "technologies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "blueprint_technologies" ADD CONSTRAINT "blueprint_technologies_blueprint_id_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "public"."blueprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blueprint_technologies" ADD CONSTRAINT "blueprint_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blueprint_technologies_technology_idx" ON "blueprint_technologies" USING btree ("technology_id");