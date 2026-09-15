CREATE TABLE "chapter_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"track_id" text NOT NULL,
	"chapter_id" text NOT NULL,
	"completed" boolean DEFAULT true NOT NULL,
	"quiz_passed" boolean DEFAULT false NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chapter_progress_user_track_chapter_unique" UNIQUE("user_id","track_id","chapter_id")
);
--> statement-breakpoint
CREATE TABLE "course_catalog" (
	"id" integer PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_catalog_id_check" CHECK ("course_catalog"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "hospitals" (
	"id" text PRIMARY KEY NOT NULL,
	"city_slug" text NOT NULL,
	"city_name" text NOT NULL,
	"name" text NOT NULL,
	"facility_type" text NOT NULL,
	"address" text,
	"phone" text,
	"rating" double precision,
	"lat" double precision,
	"lng" double precision,
	"has_paid_birth" boolean,
	"free_birth_available" boolean,
	"payload" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_catalog" (
	"id" integer PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_catalog_id_check" CHECK ("product_catalog"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(120) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "chapter_progress" ADD CONSTRAINT "chapter_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_progress_user" ON "chapter_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_hospitals_city_slug" ON "hospitals" USING btree ("city_slug");