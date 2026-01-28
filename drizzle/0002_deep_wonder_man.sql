CREATE TABLE "date_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"proposed_date" timestamp NOT NULL,
	"proposed_time" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "date_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"date_option_id" integer NOT NULL,
	"guest_id" integer NOT NULL,
	"response" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "date_options" ADD CONSTRAINT "date_options_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "date_responses" ADD CONSTRAINT "date_responses_date_option_id_date_options_id_fk" FOREIGN KEY ("date_option_id") REFERENCES "public"."date_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "date_responses" ADD CONSTRAINT "date_responses_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;