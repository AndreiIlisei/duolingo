"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { quests } from "@/lib/utils";
import Image from "next/image";
import { Progress } from "./ui/progress";

type Props = {
  points: number;
};
export const Quests = ({ points }: Props) => {
  return (
    <div className="border-2 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between w-full space-y-2">
        <h3 className="font-bold text-lg">Quests</h3>
        <Link href="/quests">
          <Button size="sm" variant="primaryOutline">
            View all
          </Button>
        </Link>
      </div>

      <ul className="w-full space-y-4">
        {quests.map((quest) => {
          const progress = (points / quest.value) * 100;

          return (
            <li
              key={quest.title}
              className="flex items-center w-full p-4 gap-x-4 border-t-2"
            >
              <Image src="/points.svg" alt="Points" width={60} height={60} />
              <div className="flex flex-col gap-y-2 w-full">
                <p className="text-neutral-700 text-xl font-bold">
                  {quest.title}
                </p>
                <Progress value={progress} className="h-3" />
                {/* {progress >= 100 && <CheckIcon className="text-green-500" />} */}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
