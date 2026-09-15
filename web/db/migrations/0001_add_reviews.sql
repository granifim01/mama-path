CREATE TABLE "hospital_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"hospital_id" text NOT NULL,
	"user_id" integer,
	"author_name" varchar(120) NOT NULL,
	"rating" integer,
	"birth_type" text,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"user_id" integer,
	"author_name" varchar(120) NOT NULL,
	"rating" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hospital_reviews" ADD CONSTRAINT "hospital_reviews_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_reviews" ADD CONSTRAINT "hospital_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_hospital_reviews_hospital" ON "hospital_reviews" USING btree ("hospital_id");--> statement-breakpoint
CREATE INDEX "idx_product_reviews_product" ON "product_reviews" USING btree ("product_id");