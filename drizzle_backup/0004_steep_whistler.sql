ALTER TABLE "sections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "section_progress" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "units" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "lessons" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "challenges" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "challenge_options" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "challenge_progress" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_subscription" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "sections" CASCADE;--> statement-breakpoint
DROP TABLE "section_progress" CASCADE;--> statement-breakpoint
DROP TABLE "units" CASCADE;--> statement-breakpoint
DROP TABLE "lessons" CASCADE;--> statement-breakpoint
DROP TABLE "challenges" CASCADE;--> statement-breakpoint
DROP TABLE "challenge_options" CASCADE;--> statement-breakpoint
DROP TABLE "challenge_progress" CASCADE;--> statement-breakpoint
DROP TABLE "user_subscription" CASCADE;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "active_learning_path_id" integer;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_active_learning_path_id_learning_paths_id_fk" FOREIGN KEY ("active_learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."type";