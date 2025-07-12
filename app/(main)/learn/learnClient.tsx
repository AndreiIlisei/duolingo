"use client";

import { FeedWrapper } from "@/components/feedWrapper";
import { StickyWrapper } from "@/components/stickyWrapper";
import { Header } from "./header";
import { UserProgress } from "@/components/userProgress";
import { Promotions } from "@/components/promotions";
import { Quests } from "@/components/quests";
import LearningPaths from "./learningPath";
import { useState } from "react";
import { SectionsView } from "../sections/sectionPage";
import { Unit } from "./unit";

const LearnClient = ({
  userProgress,
  courseProgress,
  learningPaths,
  sections,
  units,
  isPro,
  lessonPercentage,
}: {
  userProgress: any;
  courseProgress: any;
  learningPaths: any[];
  sections: any[];
  units: any[];
  isPro: boolean;
  lessonPercentage: number;
}) => {
  const [pathId, setPath] = useState<number | null>(null);
  const [sectionId, setSection] = useState<number | null>(null);
  const [unitId, setUnit] = useState<number | null>(null);

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        {!isPro && <Promotions />}
        <Quests points={userProgress.points} />
      </StickyWrapper>

      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />
        {!pathId && (
          <LearningPaths
            learningPathProgress={userProgress?.activeLearningPathId}
            learningPaths={learningPaths}
            onSelect={(pid: number) => {
              setPath(pid);
              setSection(null);
              setUnit(null);
            }}
          />
        )}

        {/* level 2: sections */}
        {pathId && !sectionId && (
          <SectionsView
            sectionsData={sections.filter((s) => s.learningPathId === pathId)}
            pathId={pathId}
            currentSectionId={sectionId}
            onSelect={(sid) => {
              setSection(sid);
              setUnit(null);
            }}
          />
        )}

        {/* level 3: units (add later) */}
        {sectionId &&
          units.map((unit) => {
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
          })}
      </FeedWrapper>
    </div>
  );
};

export default LearnClient;
