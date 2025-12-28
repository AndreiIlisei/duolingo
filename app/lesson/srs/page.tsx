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

  console.log("🔍 SRS Lesson Debug:", {
    hasLesson: !!lesson,
    hasUserProgress: !!userProgress,
    challengeCount: lesson?.challenges.length || 0,
    challenges: lesson?.challenges.map(c => ({
      id: c.id,
      term: c.term,
      type: c.type,
      srsItemId: c.srsItemId
    }))
  });

  if (!lesson || !userProgress) {
    console.log("❌ No lesson or user progress found");
    redirect("/learn");
  }

  if (lesson.challenges.length === 0) {
    console.log("❌ No challenges found - no items due for review");
    redirect("/learn");
  }

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={0}
      userSubscription={userSubscription}
    />
  );
};

export default SrsLessonPage;
