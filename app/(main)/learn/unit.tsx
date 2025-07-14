import { UnitBanner } from "./unitBanner";
import { LessonButton } from "./lessonButton";
import { UnitTypes } from "./types";
import { ArrowLeft } from "lucide-react";

export const Unit = ({
  title,
  description,
  lessons,
  activeLesson,
  activeLessonPercentage,
  onBack,
}: UnitTypes & {
  onBack: () => void;
}) => {
  return (
    <>
      <div className="sticky top-0 z-10 backdrop-blur-sm border-b mb-4">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-black hover:text-gray-400 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>
      <UnitBanner title={title} description={description} />
      <div className="flex items-center flex-col relative">
        {lessons.map((lesson, index) => {
          const isCurrent = lesson.id === activeLesson?.id;
          const isLocked = !lesson.completed && !isCurrent;

          return (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              index={index}
              totalCount={lessons.length - 1}
              current={isCurrent}
              locked={isLocked}
              percentage={activeLessonPercentage}
            />
          );
        })}
      </div>
    </>
  );
};
