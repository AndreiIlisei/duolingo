import { FeedWrapper } from "@/components/feedWrapper";
import { StickyWrapper } from "@/components/stickyWrapper";
import { Header } from "./header";
import { UserProgress } from "@/components/userProgress";
import {
  getCourseProgress,
  getLessonPercentage,
  getUnits,
  getUserProgress,
  getUserSubscription,
  getLearningPaths,
  getLearningPathProgress,
} from "@/queries/queries";
import { redirect } from "next/navigation";
import { Unit } from "./unit";
import { Promotions } from "@/components/promotions";
import { Quests } from "@/components/quests";
import LearningPaths from "./learningPath";


const LearnPage = async () => {
  const userProgressData = getUserProgress();
  const courseProgressData = getCourseProgress();
  const learningPathProgressData = getLearningPathProgress();
  // const lessonPercentageData = getLessonPercentage();
  // const unitsData = getUnits();
  // const userSubscriptionData = getUserSubscription();
  const learningPathsData = getLearningPaths();
  
  const [
    userProgress,
    courseProgress,
    learningPathProgress,
    // units,
    // lessonPercentage,
    // userSubscription,
    learningPaths,
  ] = await Promise.all([
    userProgressData,
    courseProgressData,
    learningPathProgressData,
    // unitsData,
    // lessonPercentageData,
    // userSubscriptionData,
    learningPathsData,
  ]);

  // console.log(learningPaths);
  // console.log(learningPathProgress);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  if (!courseProgress) {
    redirect("/courses");
  }

  // const isPro = !!userSubscription?.isActive;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      {/* <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        {!isPro && <Promotions />}
        <Quests points={userProgress.points} />
      </StickyWrapper> */}

      <FeedWrapper>
        {/* <Header title={userProgress.activeCourse.title} /> */}

        <LearningPaths 
        learningPathProgress={learningPathProgress}
        learningPaths={learningPaths}
        />

        {/* {learningPaths.map((learningPath) => {
          return (
            <div key={learningPath.id} className="mb-10">
              {learningPath.title}
              <LearningPaths />
              <Unit
                id={learningPath.id}
                order={learningPath.order}
                description={unit.description}
                title={unit.title}
                lessons={unit.lessons}
                activeLesson={courseProgress.activeLesson}
                activeLessonPercentage={lessonPercentage}
              />
            </div>
          );
        })} */}
        {/* {units.map((unit) => {
          return (
            <div key={unit.id} className="mb-10">
              <Unit
                id={unit.id}
                order={unit.order}
                description={unit.description}
                title={unit.title}
                lessons={unit.lessons}
                activeLesson={courseProgress.activeLesson}
                activeLessonPercentage={lessonPercentage}
              />
            </div>
          );
        })} */}
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
