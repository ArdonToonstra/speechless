CREATE TABLE "magic_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"token" text NOT NULL,
	"role" text DEFAULT 'collaborator' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"usage_limit" integer DEFAULT 20 NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "magic_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "guests" ALTER COLUMN "role" SET DEFAULT 'collaborator';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "custom_occasion" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "speech_type" text DEFAULT 'gift' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "date_known" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "honoree" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "event_context" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "guest_count" integer;--> statement-breakpoint
ALTER TABLE "magic_links" ADD CONSTRAINT "magic_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "project_type";