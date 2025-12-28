CREATE TYPE "public"."srs_direction" AS ENUM('l1_to_l2', 'l2_to_l1');--> statement-breakpoint
CREATE TABLE "srs_deck_items" (
	"deck_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	CONSTRAINT "srs_deck_items_deck_id_item_id_pk" PRIMARY KEY("deck_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "srs_decks" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "srs_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"term" text NOT NULL,
	"meaning" text NOT NULL,
	"pos" text,
	"audio_src" text,
	"image_src" text,
	"example" text,
	"origin_lesson_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srs_review_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_id" integer NOT NULL,
	"quality" integer NOT NULL,
	"response_ms" integer,
	"hint_used" boolean DEFAULT false,
	"reviewed_at" timestamp DEFAULT now() NOT NULL,
	"new_ef" real,
	"new_interval_days" integer,
	"new_due_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "srs_user_item" (
	"user_id" text NOT NULL,
	"item_id" integer NOT NULL,
	"ef" real DEFAULT 2.5 NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"due_at" timestamp DEFAULT now() NOT NULL,
	"last_review_at" timestamp,
	"suspended" boolean DEFAULT false NOT NULL,
	"direction" "srs_direction" DEFAULT 'l1_to_l2',
	CONSTRAINT "srs_user_item_user_id_item_id_pk" PRIMARY KEY("user_id","item_id")
);
--> statement-breakpoint
ALTER TABLE "srs_deck_items" ADD CONSTRAINT "srs_deck_items_deck_id_srs_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."srs_decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_deck_items" ADD CONSTRAINT "srs_deck_items_item_id_srs_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."srs_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_decks" ADD CONSTRAINT "srs_decks_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_items" ADD CONSTRAINT "srs_items_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_items" ADD CONSTRAINT "srs_items_origin_lesson_id_lessons_id_fk" FOREIGN KEY ("origin_lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_review_events" ADD CONSTRAINT "srs_review_events_item_id_srs_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."srs_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_user_item" ADD CONSTRAINT "srs_user_item_item_id_srs_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."srs_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "srs_decks_course_idx" ON "srs_decks" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "srs_items_course_term_unique" ON "srs_items" USING btree ("course_id","term");--> statement-breakpoint
CREATE INDEX "srs_items_course_idx" ON "srs_items" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "srs_review_events_user_item_idx" ON "srs_review_events" USING btree ("user_id","item_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "srs_user_item_due_idx" ON "srs_user_item" USING btree ("user_id","due_at");