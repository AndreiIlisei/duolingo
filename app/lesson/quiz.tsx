/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { challengeOptions, challenges } from "@/database/schema";
import { useEffect, useState, useTransition } from "react";

import { Header } from "./header";
import { Footer } from "./footer";
import Confetti from "react-confetti";

import { Challenge } from "./challenge";
import { QuestionBubble } from "./questionBubble";
import { upsertChallengeProgress } from "@/actions/challengeProgress";
import { maxHearts } from "@/lib/utils";
import { toast } from "sonner";
import { reduceHearts } from "@/actions/user-progress";
import { useAudio, useWindowSize, useMount } from "react-use";
import Image from "next/image";
import { ResultCard } from "./resultCard";
import { useRouter } from "next/navigation";
import { useHeartsModal } from "@/store/useHeartsModal";
import { usePracticeModal } from "@/store/usePracticeModal";

type Props = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: (typeof challengeOptions.$inferSelect)[];
  })[];
  userSubscription: any; // TODO: Replace with subscription DB type
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
}: Props) => {
  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();

  useMount(() => {
    if (initialPercentage === 100) {
      openPracticeModal();
    }
  });

  const { width, height } = useWindowSize();
  const router = useRouter();

  const [correctAudio, , correctControls] = useAudio({ src: "/correct.mp3" });
  const [incorrectAudio, , incorrectControls] = useAudio({
    src: "/incorrect.mp3",
  });
  const [finishAudio, , finishControls] = useAudio({ src: "/finish.mp3" });
  const [hasPlayedFinishAudio, setHasPlayedFinishAudio] = useState(false);

  const [pending, startTransition] = useTransition();
  const [lessonId] = useState(initialLessonId);
  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");
  const [challenges] = useState(initialLessonChallenges);

  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    );
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  // Play finish audio when lesson completed
  useEffect(() => {
    if (!challenge && !hasPlayedFinishAudio) {
      finishControls.play();
      setHasPlayedFinishAudio(true);
    }
  }, [challenge, hasPlayedFinishAudio, finishControls]);

  // If no challenge, show finished screen immediately
  if (!challenge) {
    return (
      <>
        {finishAudio}

        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />

        <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
          <Image
            src="/finished.jpg"
            alt="Finish"
            className="hidden lg:block"
            height={100}
            width={100}
          />
          <Image
            src="/finished.jpg"
            alt="Finish"
            className="block lg:hidden"
            height={50}
            width={50}
          />

          <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
            Great job! <br /> You&apos;ve completed the lesson.
          </h1>

          <div className="flex items-center gap-x-4 w-full">
            <ResultCard variant="points" value={challenges.length * 10} />
          </div>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard variant="hearts" value={hearts} />
          </div>
        </div>
        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/learn")}
        />
      </>
    );
  }

  // Normal quiz screen (challenge exists)
  const title =
    challenge.type === "ASSIST"
      ? "Select the correct meaning"
      : challenge.question;

  const onSelect = (id: number) => {
    if (status !== "none") return;
    setSelectedOption(id);
  };

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = options.find((option) => option.correct);
    if (!correctOption) return;

    if (correctOption.id === selectedOption) {
      startTransition(() => {
        upsertChallengeProgress(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }
            correctControls.play();
            setStatus("correct");
            setPercentage((prev) => prev + 100 / challenges.length);

            if (initialPercentage === 100) {
              setHearts((prev) => Math.min(prev + 1, maxHearts));
            }
          })
          .catch(() => toast.error("Something went wrong"));
      });
    } else {
      startTransition(() => {
        reduceHearts(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }
            incorrectControls.play();
            setStatus("wrong");
            if (!response?.error) {
              setHearts((prev) => Math.max(prev - 1, 0));
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again."));
      });
    }
  };

  return (
    <>
      {finishAudio}
      {correctAudio}
      {incorrectAudio}

      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />

      <div className="flex-1">
        <div className="h-full flex items-center justify-center">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
              {title}
            </h1>
            <div>
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}
              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
      />
    </>
  );
};
// export const Quiz = ({
//   initialPercentage,
//   initialHearts,
//   initialLessonId,
//   initialLessonChallenges,
//   userSubscription,
// }: Props) => {
//   const { width, height } = useWindowSize();

//   const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.mp3" });
//   const [incorrectAudio, _i, incorrectControls] = useAudio({
//     src: "/incorrect.mp3",
//   });
//   const [finishAudio, , finishControls] = useAudio({ src: "/finish.mp3" });

//   const router = useRouter();

//   const [pending, startTransition] = useTransition();

//   const [lessonId] = useState(initialLessonId);

//   const [hearts, setHearts] = useState(initialHearts);
//   const [percentage, setPercentage] = useState(initialPercentage);

//   const [selectedOption, setSelectedOption] = useState<number>();
//   const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

//   const [challenges] = useState(initialLessonChallenges);

//   const [activeIndex, setActiveIndex] = useState(() => {
//     const uncompletedIndex = challenges.findIndex(
//       (challenge) => !challenge.completed
//     );

//     return uncompletedIndex === -1 ? 0 : uncompletedIndex;
//   });

//   const challenge = challenges[activeIndex];
//   console.log(challenge);

//   const options = challenge?.challengeOptions ?? [];

//   useEffect(() => {
//     if (!challenge) {
//       finishControls.play();
//     }
//   }, [challenge, finishControls]);

//   // if (!challenge) {
//   //   return (
//   //     <>
//   //       {/* {finishAudio} */}
//   //       <Confetti
//   //         width={width}
//   //         height={height}
//   //         recycle={false}
//   //         numberOfPieces={500}
//   //         tweenDuration={10000}
//   //       />

//   //       <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
//   //         <Image
//   //           src="/finished.jpg"
//   //           alt="Finish"
//   //           className="hidden lg:block"
//   //           height={100}
//   //           width={100}
//   //         />
//   //         <Image
//   //           src="/finished.jpg"
//   //           alt="Finish"
//   //           className="block lg:hidden"
//   //           height={50}
//   //           width={50}
//   //         />

//   //         <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
//   //           Great job! <br /> You&apos;ve completed the lesson.
//   //         </h1>
//   //         <div className="flex items-center gap-x-4 w-full">
//   //           <ResultCard variant="points" value={challenges.length * 10} />
//   //         </div>
//   //         <div className="flex items-center gap-x-4 w-full">
//   //           <ResultCard variant="hearts" value={hearts} />
//   //         </div>
//   //       </div>
//   //       <Footer
//   //         lessonId={lessonId}
//   //         status="completed"
//   //         onCheck={() => router.push("/learn")}
//   //       />
//   //     </>
//   //   );
//   // }

//   const title =
//     challenge.type === "ASSIST"
//       ? "Select the correct meaning"
//       : challenge.question;

//   const onSelect = (id: number) => {
//     if (status !== "none") return;

//     setSelectedOption(id);
//   };

//   const onNext = () => {
//     setActiveIndex((current) => current + 1);
//   };

//   const onContinue = () => {
//     if (!selectedOption) return;

//     if (status === "wrong") {
//       setStatus("none");
//       setSelectedOption(undefined);
//       return;
//     }

//     if (status === "correct") {
//       onNext();
//       setStatus("none");
//       setSelectedOption(undefined);
//       return;
//     }

//     const correctOption = options.find((option) => option.correct);

//     if (!correctOption) {
//       return;
//     }

//     if (correctOption && correctOption.id === selectedOption) {
//       startTransition(() => {
//         upsertChallengeProgress(challenge.id)
//           .then((response) => {
//             if (response?.error === "hearts ") {
//               console.error("Missing hearts");
//               return;
//             }

//             correctControls.play();
//             setStatus("correct");
//             setPercentage((prev) => prev + 100 / challenges.length);

//             // This is practice
//             if (initialPercentage === 100) {
//               setHearts((prev) => Math.min(prev + 1, maxHearts));
//             }
//           })
//           .catch(() => toast.error("Something went wrong"));
//       });
//     } else {
//       startTransition(() => {
//         reduceHearts(challenge.id)
//           .then((response) => {
//             if (response?.error === "hearts") {
//               console.error("Missing hearts");
//               return;
//             }

//             incorrectControls.play();
//             setStatus("wrong");

//             if (!response?.error) {
//               setHearts((prev) => Math.max(prev - 1, 0));
//             }
//           })
//           .catch(() => toast.error("Something went wrong. Please try again."));
//       });
//     }
//   };

//   return (
//     <>
//       {finishAudio}
//       {challenge ? (
//         <>
//           {correctAudio}
//           {incorrectAudio}

//           <Header
//             hearts={hearts}
//             percentage={percentage}
//             hasActiveSubscription={!!userSubscription?.isActive}
//           />

//           <div className="flex-1">
//             <div className="h-full flex items-center justify-center">
//               <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
//                 <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
//                   {title}
//                 </h1>
//                 <div>
//                   {challenge.type === "ASSIST" && (
//                     <QuestionBubble question={challenge.question} />
//                   )}
//                   <Challenge
//                     options={options}
//                     onSelect={onSelect}
//                     status={status}
//                     selectedOption={selectedOption}
//                     disabled={pending}
//                     type={challenge.type}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <Footer
//             disabled={pending || !selectedOption}
//             status={status}
//             onCheck={onContinue}
//           />
//         </>
//       ) : (
//         <>
//           <Confetti
//             width={width}
//             height={height}
//             recycle={false}
//             numberOfPieces={500}
//             tweenDuration={10000}
//           />

//           <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
//             <Image
//               src="/finished.jpg"
//               alt="Finish"
//               className="hidden lg:block"
//               height={100}
//               width={100}
//             />
//             <Image
//               src="/finished.jpg"
//               alt="Finish"
//               className="block lg:hidden"
//               height={50}
//               width={50}
//             />

//             <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
//               Great job! <br /> You&apos;ve completed the lesson.
//             </h1>
//             <div className="flex items-center gap-x-4 w-full">
//               <ResultCard variant="points" value={challenges.length * 10} />
//             </div>
//             <div className="flex items-center gap-x-4 w-full">
//               <ResultCard variant="hearts" value={hearts} />
//             </div>
//           </div>
//           <Footer
//             lessonId={lessonId}
//             status="completed"
//             onCheck={() => router.push("/learn")}
//           />
//         </>
//       )}
//     </>
//   );
// };
