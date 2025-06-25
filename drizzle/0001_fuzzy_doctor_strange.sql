CREATE TYPE "public"."learning_path" AS ENUM('classic', 'srs', 'immersion', 'targeted');--> statement-breakpoint
CREATE TABLE "sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"course_id" integer NOT NULL,
	"learning_path_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "courses_learning_path_id_learning_paths_id_fk";
--> statement-breakpoint
ALTER TABLE "units" DROP CONSTRAINT "units_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "section_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_learning_path_id_learning_paths_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "learning_path_id";--> statement-breakpoint
ALTER TABLE "units" DROP COLUMN "course_id";