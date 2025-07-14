import { lessons, units } from "@/database/schema";

// Define the valid path IDs as a type
export type PathId = "classic" | "srs" | "immersion" | "targeted";

export type LearningPathType = {
  id: number;
  courseId: number | null;
  order: number | null;
  title: string;
  description: string;
  learning_path_type: PathId;
  // type: PathId;
  // subtitle: string;
  // difficulty: number;
  // progress: number;
  // icon: string;
  // meta:
  //   | { icon: string; text: string }[]
  //   | { icon: React.ReactNode; text: string }[];
  // badges: { text: string; variant: string }[];
  // xpText: string;
  // buttonText: string;
};

export type PathCardProps = {
  path: LearningPathType;
  onSelect: (pathId: number) => void;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
};

export type UnitTypes = {
  id: number;
  order: number;
  title: string;
  description: string;
  lessons: (typeof lessons.$inferSelect & { completed: boolean })[];
  /** make optional */
  activeLesson?:
    | (typeof lessons.$inferSelect & { unit: typeof units.$inferSelect })
    | undefined;
  activeLessonPercentage?: number | null;
};

export type SectionType = {
  id: number;
  title: string;
  description: string | null;
  order: number;
  courseId: number;
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
