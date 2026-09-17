CREATE TABLE "stack_technologies" (
	"stack_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "stack_technologies_stack_id_technology_id_pk" PRIMARY KEY("stack_id","technology_id")
);
--> statement-breakpoint
CREATE TABLE "stacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stacks_name_unique" UNIQUE("name"),
	CONSTRAINT "stacks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "stack_technologies" ADD CONSTRAINT "stack_technologies_stack_id_stacks_id_fk" FOREIGN KEY ("stack_id") REFERENCES "public"."stacks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stack_technologies" ADD CONSTRAINT "stack_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stacks" ADD CONSTRAINT "stacks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stack_technologies_technology_idx" ON "stack_technologies" USING btree ("technology_id");