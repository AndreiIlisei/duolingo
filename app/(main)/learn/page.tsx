import { redirect } from "next/navigation";
import LearnClient from "./learnClient";
import { getSections } from "@/queries/core/getSections";
import {
  getUserProgress,
  getCourseProgress,
  getUserSubscription,
  getLearningPaths,
  getUnits,
  getLesson,
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
    lessons,
    lessonPercentage,
  ] = await Promise.all([
    getUserProgress(),
    getUserSubscription(),
    getCourseProgress(),
    getLearningPaths(),
    getSections(),
    getUnits(),
    getLesson(),
    getLessonPercentage(),
  ]);

  if (!userProgress?.activeCourse || !courseProgress) {
    redirect("/courses");
  }

  console.log(courseProgress);
  

  return (
    <LearnClient
      userProgress={userProgress}
      courseProgress={courseProgress}
      learningPaths={learningPaths}
      sections={sections}
      units={units}
      lessons={lessons}
      lessonPercentage={lessonPercentage}
      isPro={!!userSubscription?.isActive}
    />
  );
}
