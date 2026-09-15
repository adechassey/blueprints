CREATE TABLE "device_auth_requests" (
	"device_code" text PRIMARY KEY NOT NULL,
	"user_code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"token" text,
	"user_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "device_auth_requests_user_code_unique" UNIQUE("user_code")
);
--> statement-breakpoint
ALTER TABLE "device_auth_requests" ADD CONSTRAINT "device_auth_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;