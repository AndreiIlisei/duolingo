"use client";

import { FeedWrapper } from "@/components/feedWrapper";
import { StickyWrapper } from "@/components/stickyWrapper";
import { Header } from "./header";
import { UserProgress, UserProgressProps } from "@/components/userProgress";
import { Promotions } from "@/components/promotions";
import { Quests } from "@/components/quests";
import LearningPaths from "./learningPath";
import { useState } from "react";
import { SectionsView } from "../sections/sectionPage";
import { Unit } from "./unit";
import {
  CourseProgress,
  LearningPathType,
  SectionType,
  UnitTypes,
} from "./types";
import { ArrowLeft } from "lucide-react";

const LearnClient = ({
  userProgress,
  courseProgress,
  learningPaths,
  sectionsData,
  lessonPercentage,
}: {
  userProgress: UserProgressProps;
  courseProgress: CourseProgress | null;
  learningPaths: LearningPathType[];
  sectionsData: SectionType[];
  lessonPercentage: number;
}) => {
  const [pathId, setPath] = useState<number | null>(null);
  const [sectionId, setSection] = useState<number | null>(null);
  const [unitData, setUnitData] = useState<UnitTypes[] | null>(null);
  const [loadingUnits, setLoadingUnits] = useState(false);

  async function handleSectionSelect(sectionId: number) {
    setSection(sectionId);
    setUnitData(null);
    setLoadingUnits(true); // ← show skeleton

    try {
      const res = await fetch(`/api/units?section=${sectionId}`);
      const units = await res.json();
      setUnitData(units);
    } finally {
      setLoadingUnits(false); // ← hide skeleton
    }
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress {...userProgress} />
        {!userProgress.hasActiveSubscription && <Promotions />}
        <Quests points={userProgress.points} />
      </StickyWrapper>

      <FeedWrapper>
        {!pathId && (
          <>
            <Header title={userProgress.activeCourse.title} />
            <LearningPaths
              learningPathProgress={userProgress?.activeLearningPathId}
              learningPaths={learningPaths}
              onSelect={(pid: number) => {
                setPath(pid);
                setSection(null);
              }}
            />
          </>
        )}

        {/* level 2: sections */}
        {pathId && !sectionId && (
          <SectionsView
            sectionsData={sectionsData}
            onSelect={(sid) => {
              handleSectionSelect(sid);
            }}
            onBack={() => {
              setSection(null);
              setPath(null);
            }}
          />
        )}

        {/* level 3: units (add later) */}
        {sectionId && loadingUnits ? (
          <div className="flex justify-center p-6">Loading for now</div>
        ) : (
          <>
            <div className="sticky top-0 z-10 backdrop-blur-sm border-b mb-4">
              <div className="max-w-2xl mx-auto px-6 py-4">
                <button
                  onClick={() => {
                    setSection(null);
                  }}
                  className="flex items-center gap-2 text-black hover:text-gray-400 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span className="font-medium">Back</span>
                </button>
              </div>
            </div>
            {sectionId &&
              unitData &&
              unitData?.map((unit: UnitTypes) => {
                return (
                  <div key={unit.id} className="mb-10">
                    <Unit
                      id={unit.id}
                      order={unit.order}
                      description={unit.description}
                      title={unit.title}
                      lessons={unit.lessons}
                      activeLesson={courseProgress?.activeLesson}
                      activeLessonPercentage={lessonPercentage}
                    />
                  </div>
                );
              })}
          </>
        )}
      </FeedWrapper>
    </div>
  );
};

export default LearnClient;
