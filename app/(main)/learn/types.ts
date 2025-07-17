import { challenges, lessons, units } from "@/database/schema";

// Define the valid path IDs as a type
export type PathId = "classic" | "srs" | "immersion" | "targeted";

export type LearningPathType = {
  id: number;
  courseId: number | null;
  order: number | null;
  title: string;
  description: string;
  learning_path_type: PathId;
};

export type PathCardProps = {
  path: LearningPathType;
  onSelect: (pathId: number) => void;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
};

export type LessonWithUnitAndChallenges = typeof lessons.$inferSelect & {
  unit: typeof units.$inferSelect;
  challenges: (typeof challenges.$inferSelect)[];
};

export type UnitTypes = {
  id: number;
  order: number;
  title: string;
  description: string;
  lessons: (typeof lessons.$inferSelect & { completed: boolean })[];
  activeLesson?:
    | {
        id: number;
        title: string;
        order: number;
        unitId: number;
        unit: {
          id: number;
          title: string;
          order: number;
          description: string | null;
          sectionId: number;
        };
        challenges: {
          id: number;
          order: number;
          lessonId: number;
          type: "SELECT" | "ASSIST";
          question: string;
        }[];
      }
    | undefined;
  activeLessonPercentage?: number | null;
};

export type SectionType = {
  id: number;
  title: string;
  description: string | null;
  order: number;
  done: number;
  total: number;
  percent: number;
  learningPathId: number;
};

export type CourseProgress = {
  activeLesson:
    | {
        id: number;
        title: string;
        order: number;
        unitId: number;
        unit: {
          id: number;
          title: string;
          order: number;
          description: string | null;
          sectionId: number;
        };
        challenges: {
          id: number;
          order: number;
          lessonId: number;
          type: "SELECT" | "ASSIST";
          question: string;
        }[];
      }
    | undefined;
  activeLessonId: number | undefined;
};
