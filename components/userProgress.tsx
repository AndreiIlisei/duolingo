import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { InfinityIcon } from "lucide-react";
import { courses, userProgress } from "@/database/schema";

import type { InferSelectModel } from "drizzle-orm";

export type DBUserProgress = InferSelectModel<typeof userProgress>;
export type DBCourse = InferSelectModel<typeof courses>;

export type UserProgressProps = {
  activeCourse: DBCourse; // relation may be null
  hearts: DBUserProgress["hearts"];
  points: DBUserProgress["points"];
  hasActiveSubscription: boolean; // computed flag
  activeLearningPathId: number | null;
};

export const UserProgress = ({
  activeCourse,
  hearts,
  points,
  hasActiveSubscription,
}: UserProgressProps) => {
  return (
    <div className="flex items-center justify-between gap-x-2 w-full">
      <Link href="/courses">
        <Button variant="ghost">
          <Image
            src={activeCourse?.imageSrc || ""}
            alt={activeCourse?.title || ""}
            className="rounded-md border"
            width={32}
            height={32}
          />
        </Button>
      </Link>

      <Link href="/shop">
        <Button variant="ghost" className="text-orange-500">
          <Image
            src="/energy.svg"
            height={28}
            width={28}
            alt="Points"
            className="mr-2"
          />
          {points}
        </Button>
      </Link>

      <Link href="/shop">
        <Button variant="ghost" className="text-rose-500">
          <Image
            src="/heart.svg"
            height={22}
            width={22}
            alt="Hearts"
            className="mr-2"
          />
          {hasActiveSubscription ? (
            <InfinityIcon className="h-4 w-4 stroke-[3]" />
          ) : (
            hearts
          )}
        </Button>
      </Link>
    </div>
  );
};
