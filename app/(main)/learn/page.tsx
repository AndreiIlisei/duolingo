import { redirect } from "next/navigation";
import LearnClient from "./learnClient";
import {
  // getSections,
  getSectionsWithProgress,
} from "@/queries/core/getSections";
import {
  getUserProgress,
  getCourseProgress,
  getUserSubscription,
  getLearningPaths,
  getLessonPercentage,
} from "@/queries/queries";

export default async function LearnPage() {
  const [
    userProgress,
    userSubscription,
    courseProgress,
    learningPaths,
    lessonPercentage,
    // allSections,
  ] = await Promise.all([
    getUserProgress(),
    getUserSubscription(),
    getCourseProgress(),
    getLearningPaths(),
    getLessonPercentage(),
    // getSections(),
  ]);

  if (!userProgress?.activeCourse) {
    redirect("/courses");
  }

  console.log("ENV", process.env.DATABASE_URL)
  console.log("ENV", process.env.NODE_ENV)

  // fetch section progress AFTER we know active path
  const sectionsProgress = userProgress.activeLearningPathId
    ? await getSectionsWithProgress(
        userProgress.activeLearningPathId,
        userProgress.userId
      )
    : [];

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
      sectionsData={sectionsProgress}
      lessonPercentage={lessonPercentage}
    />
  );
}
