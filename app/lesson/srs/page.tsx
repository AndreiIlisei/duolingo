import { getUserProgress, getUserSubscription } from "@/queries/queries";
import { getSrsLesson } from "@/queries/srs/getSrsLesson";
import { redirect } from "next/navigation";
import { Quiz } from "../quiz";

const SrsLessonPage = async () => {
  const lessonData = getSrsLesson();
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();

  const [lesson, userProgress, userSubscription] = await Promise.all([
    lessonData,
    userProgressData,
    userSubscriptionData,
  ]);

  if (!lesson || !userProgress) {
    redirect("/learn");
  }

  if (lesson.challenges.length === 0) {
    redirect("/learn");
  }

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialHearts={999}
      initialPercentage={0}
      userSubscription={userSubscription}
    />
  );
};

export default SrsLessonPage;
