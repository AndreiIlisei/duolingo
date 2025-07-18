/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { startTransition, useState, useTransition } from "react";
import { LearningPathType, PathCardProps, PathId } from "./types";
import path from "path";
import { chooseLearningPath } from "@/actions/user-progress";
import { toast } from "sonner";

// const ProgressRing = ({ progress, size = 70 }) => {
//   const center = size / 2;
//   const radius = center - 5;
//   const circumference = 2 * Math.PI * radius;
//   const strokeDashoffset = circumference - (progress / 100) * circumference;

//   return (
//     <svg className="absolute -top-1 -left-1" width={size} height={size}>
//       <circle
//         cx={center}
//         cy={center}
//         r={radius}
//         fill="none"
//         stroke="rgba(255, 255, 255, 0.2)"
//         strokeWidth="3"
//       />
//       <circle
//         cx={center}
//         cy={center}
//         r={radius}
//         fill="none"
//         stroke="rgba(255, 255, 255, 0.8)"
//         strokeWidth="3"
//         strokeLinecap="round"
//         strokeDasharray={circumference}
//         strokeDashoffset={strokeDashoffset}
//         transform={`rotate(-90 ${center} ${center})`}
//         className="transition-all duration-500"
//       />
//     </svg>
//   );
// };

// const DifficultyStars = ({ level }) => {
//   return (
//     <div className="flex gap-0.5">
//       {[1, 2, 3].map((star) => (
//         <Star
//           key={star}
//           size={12}
//           className={`${
//             star <= level
//               ? "text-yellow-400 fill-yellow-400"
//               : "text-yellow-400/30"
//           }`}
//         />
//       ))}
//     </div>
//   );
// };

// const Badge = ({ children, variant = "default", className = "" }) => {
//   const variants = {
//     default: "bg-white/20 backdrop-blur-sm",
//     new: "bg-gradient-to-r from-red-400 to-red-500 animate-pulse",
//     recommended: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black",
//     streak: "bg-gradient-to-r from-red-500 to-red-600",
//   };

//   return (
//     <span
//       className={`px-3 py-1.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
//     >
//       {children}
//     </span>
//   );
// };

// const AchievementPopup = ({ message, onClose }) => {
//   React.useEffect(() => {
//     const timer = setTimeout(onClose, 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     <div className="fixed top-5 right-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-5 py-3 rounded-xl font-semibold shadow-lg z-50 animate-in slide-in-from-right duration-500">
//       {message}
//     </div>
//   );
// };

const PathCard = ({
  path,
  onSelect,
  isHovered,
  onHover,
  onLeave,
}: PathCardProps) => {
  const backgroundPatterns: Record<PathId, string> = {
    classic: "bg-gradient-to-br from-green-400 to-green-600",
    srs: "bg-gradient-to-br from-blue-500 to-blue-700",
    immersion: "bg-gradient-to-br from-purple-500 to-purple-700",
    targeted: "bg-gradient-to-br from-orange-500 to-orange-600",
  } as const;

  const patternOverlays: Record<PathId, string> = {
    classic:
      "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]",
    srs: "bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1)_2px,transparent_2px),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.1)_2px,transparent_2px)]",
    immersion:
      "bg-[repeating-conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.1)_45deg,transparent_90deg)]",
    targeted:
      "bg-[repeating-linear-gradient(0deg,transparent,transparent_15px,rgba(255,255,255,0.1)_15px,rgba(255,255,255,0.1)_30px),repeating-linear-gradient(90deg,transparent,transparent_15px,rgba(255,255,255,0.1)_15px,rgba(255,255,255,0.1)_30px)]",
  } as const;

  return (
    <div
      className={`relative p-8 rounded-3xl cursor-pointer transition-all duration-300 border border-white/10 overflow-hidden group
        ${backgroundPatterns[path.learning_path_type]} 
        ${
          isHovered
            ? "transform -translate-y-2 scale-105 shadow-2xl"
            : "hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
        }
        `}
      onClick={() => onSelect(path.id)}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Pattern Overlay */}
      <div
        className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300 
            ${patternOverlays[path.learning_path_type]}`}
        style={{ backgroundSize: "30px 30px" }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-white">{path.title}</h3>
              {/* <DifficultyStars level={path.difficulty} /> */}
            </div>
            {/* <p className="text-white/90 mb-4">{path.subtitle}</p> */}
            <p className="text-white/90 mb-4">{path.description}</p>

            {/* <div className="flex flex-wrap gap-5 mb-4 text-sm text-white/90">
              {path.meta.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div> */}

            {/* <div className="flex flex-wrap gap-2 mb-4">
              {path.badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant}>
                  {badge.text}
                </Badge>
              ))}
            </div> */}

            {/* <div className="text-sm text-white/80">{path.xpText}</div> */}
          </div>

          {/* <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl relative">
              <ProgressRing progress={path.progress} />
              {path.icon}
            </div>
          </div> */}
        </div>

        <button className="w-full bg-white/20 backdrop-blur-sm border-none text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:bg-white/30 hover:-translate-y-0.5">
          {/* {path.buttonText} */}
          Choose this
        </button>
      </div>
    </div>
  );
};

const LearningPaths = ({
  learningPathProgress,
  learningPaths,
  onSelect,
}: {
  learningPathProgress: number | null;
  learningPaths: LearningPathType[];
  onSelect: (pathId: number) => void;
}) => {
  const [pending, startTransition] = useTransition();
  const [achievement, setAchievement] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const stats = [
    { number: "2760", label: "Total XP" },
    { number: "12", label: "Day Streak" },
    { number: "3", label: "Paths Active" },
  ];

  const handlePathSelect = (pathId: number) => {
    startTransition(async () => {
      try {
        await chooseLearningPath(pathId); // server call
        /* local UI state reset */
        onSelect(pathId);
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  // const handlePathSelect = (pathId: number) => {
  //   // console.log(pathId);
  //   // console.log(learningPathProgress?.activeLearningPathId);

  //   // if (pathId === learningPathProgress) {
  //   //   console.log("Already active");

  //   //   // return router.push("/learn"); // Navigates to the "/learn" route if the clicked course is already active
  //   // }

  //   startTransition(() => {
  //     chooseLearningPath(pathId, onSelect).catch((err) =>
  //       toast.error("Something went wrong")
  //     );
  //   });

  //   // // Add visual feedback
  //   // const allCards = document.querySelectorAll("[data-path-card]");
  //   // allCards.forEach((card) => {
  //   //   card.classList.add("scale-95");
  //   //   setTimeout(() => {
  //   //     card.classList.remove("scale-95");
  //   //   }, 150);
  //   // });

  //   // // Show achievement for smart path
  //   // if (pathId === "smart") {
  //   //   setAchievement("🎯 Perfect Review Streak!");
  //   // }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br  text-white p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          {/* <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Follow Different Learning Paths
          </h2> */}
          <h1 className="bg-gradient-to-r from-cyan-400 to-blue-500 text-2xl font-bold mb-3 bg-clip-text text-transparent">
            Follow Different Learning Paths
          </h1>
        </div>

        {/* Stats Bar */}
        {/* <div className="flex justify-center gap-8 mb-10 p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-cyan-400">
                {stat.number}
              </div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div> */}

        {/* Learning Paths */}
        <div className="grid gap-6">
          {learningPaths.map((path) => {
            return (
              <div key={path.id} data-path-card>
                <PathCard
                  path={path}
                  onSelect={handlePathSelect}
                  isHovered={hoveredCard === path.id}
                  onHover={() => setHoveredCard(path.id)}
                  onLeave={() => setHoveredCard(null)}
                />
              </div>
            );
          })}
        </div>

        {/* Achievement Popup */}
        {/* {achievement && (
          <AchievementPopup
            message={achievement}
            onClose={() => setAchievement(null)}
          />
        )} */}
      </div>
    </div>
  );
};

export default LearningPaths;
