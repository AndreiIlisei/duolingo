import { redirect } from "next/navigation";
import LearnClient from "./learnClient";
import { getSections } from "@/queries/core/getSections";
import {
  getUserProgress,
  getCourseProgress,
  getUserSubscription,
  getLearningPaths,
  getUnits,
  getLessonPercentage,
} from "@/queries/queries";

export default async function LearnPage() {
  const [
    userProgress,
    userSubscription,
    courseProgress,
    learningPaths,
    sections,
    units,
    lessonPercentage,
  ] = await Promise.all([
    getUserProgress(),
    getUserSubscription(),
    getCourseProgress(),
    getLearningPaths(),
    getSections(),
    getUnits(),
    getLessonPercentage(),
  ]);

  if (!userProgress?.activeCourse || !courseProgress) {
    redirect("/courses");
  }
  
  return (
    <LearnClient
      userProgress={{
        activeCourse: userProgress.activeCourse,
        hearts: userProgress.hearts,
        points: userProgress.points,
        hasActiveSubscription: !!userSubscription?.isActive,
        activeLearningPathId: userProgress.activeLearningPathId,
      }}
      courseProgress={courseProgress}
      learningPaths={learningPaths}
      sections={sections}
      units={units}
      lessonPercentage={lessonPercentage}
    />
  );
}
