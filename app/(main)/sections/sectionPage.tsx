"use client";
import { ArrowLeft, Eye, Lock } from "lucide-react";
import { useState } from "react";

// Define the valid section IDs as a type
type SectionId = "section1" | "section2" | "section3" | "section4";

const ProgressBar = ({ current, total, color = "bg-green-500" }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-600 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-gray-300 text-sm font-medium">
        {current} / {total}
      </span>
    </div>
  );
};

const SectionCard = ({ section, onSelect, onJumpTo }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusStyles = () => {
    switch (section.status) {
      case "completed":
        return {
          bgColor: "bg-slate-700/60",
          borderColor: "border-green-500/30",
          buttonColor: "bg-blue-500 hover:bg-blue-600",
          buttonText: "CONTINUE",
          progressColor: "bg-green-500",
        };
      case "available":
        return {
          bgColor: "bg-slate-700/60",
          borderColor: "border-blue-500/30",
          buttonColor:
            "bg-slate-600 hover:bg-slate-500 border-2 border-slate-500",
          buttonText: `JUMP TO ${section.title.toUpperCase()}`,
          progressColor: "bg-gray-500",
        };
      case "locked":
        return {
          bgColor: "bg-slate-800/60",
          borderColor: "border-gray-600/30",
          buttonColor: "bg-gray-700 cursor-not-allowed",
          buttonText: "LOCKED",
          progressColor: "bg-gray-600",
        };
      default:
        return {
          bgColor: "bg-slate-700/60",
          borderColor: "border-gray-500/30",
          buttonColor: "bg-gray-600",
          buttonText: "CONTINUE",
          progressColor: "bg-gray-500",
        };
    }
  };

  const styles = getStatusStyles();
  const isDisabled = section.status === "locked";

  return (
    <div
      className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-200 border-2 overflow-hidden mb-4
        ${styles.bgColor} ${styles.borderColor}
        ${!isDisabled && isHovered ? "transform -translate-y-1 shadow-lg" : ""}
        ${
          !isDisabled
            ? "hover:-translate-y-1 hover:shadow-lg"
            : "cursor-not-allowed opacity-75"
        }
      `}
      onClick={() => !isDisabled && onSelect(section.id)}
      onMouseEnter={() => !isDisabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        {/* Left Content */}
        <div className="flex-1 pr-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-cyan-400 text-sm font-semibold">
              {section.level} •
            </span>
            <button
              className="text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                // Handle see details
              }}
            >
              <Eye size={14} />
              SEE DETAILS
            </button>
          </div>

          {/* Section Title */}
          <h3 className="text-white text-xl font-bold mb-3">{section.title}</h3>

          {/* Progress or Lock Status */}
          {section.status === "locked" ? (
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-gray-400" />
              <span className="text-gray-400 text-sm">
                {section.units} UNITS
              </span>
            </div>
          ) : (
            <div className="mb-4">
              <ProgressBar
                current={section.completed}
                total={section.total}
                color={styles.progressColor}
              />
            </div>
          )}

          {/* Action Button */}
          <button
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 
              ${styles.buttonColor} text-white
              ${!isDisabled ? "hover:transform hover:-translate-y-0.5" : ""}
            `}
            disabled={isDisabled}
            onClick={(e) => {
              e.stopPropagation();
              if (section.status === "available") {
                onJumpTo(section.id);
              } else if (section.status === "completed") {
                onSelect(section.id);
              }
            }}
          >
            {styles.buttonText}
          </button>
        </div>

        {/* Right Content - Character and Speech Bubble */}
        <div className="relative">
          {/* Speech Bubble */}
          {section.speechBubble && (
            <div className="absolute -top-4 right-0 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg max-w-48 text-center">
              {section.speechBubble}
              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-800"></div>
            </div>
          )}

          {/* Character */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all duration-200 mt-8
            ${section.status === "locked" ? "grayscale opacity-50" : ""}
            ${isHovered && !isDisabled ? "transform scale-110" : ""}
          `}
          >
            {section.character}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SectionsView = ({
  sectionsData,
  pathId,
  currentSectionId,
  onSelect,
}: {
  sectionsData: Section[];
  pathId: number;
  currentSectionId: number | null;
  onSelect: (sectionId: number) => void;
}) => {
  const [selectedSection, setSelectedSection] = useState(null);

  const sections = [
    {
      id: "section1",
      level: "A1",
      title: "Section 1",
      status: "completed",
      completed: 8,
      total: 8,
      character: "🦉",
      speechBubble: "¡Hola!",
    },
    {
      id: "section2",
      level: "A1",
      title: "Section 2",
      status: "available",
      completed: 0,
      total: 24,
      units: 24,
      character: "🦉",
      speechBubble: "Quiero aprender español.",
    },
    {
      id: "section3",
      level: "A2",
      title: "Section 3",
      status: "locked",
      completed: 0,
      total: 18,
      units: 18,
      character: "🦉",
      speechBubble: null,
    },
    {
      id: "section4",
      level: "A2",
      title: "Section 4",
      status: "locked",
      completed: 0,
      total: 22,
      units: 22,
      character: "🦉",
      speechBubble: null,
    },
  ];

  const handleSectionSelect = (sectionId: number) => {
    setSelectedSection(sectionId);
    // Handle navigation to section content
    console.log("Selected section:", sectionId);
    onSelect(sectionId);
  };

  const handleJumpToSection = (sectionId: number) => {
    console.log("Jump to section:", sectionId);
    // Handle jump to section logic
  };

  const handleBack = () => {
    // Handle back navigation
    console.log("Going back...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b ">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sections</h1>
          <p className="text-gray-400">Continue your journey</p>
        </div>

        {/* Sections List */}
        <div className="space-y-4">
          {sectionsData.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onSelect={handleSectionSelect}
              onJumpTo={handleJumpToSection}
            />
          ))}
        </div>

        {/* Bottom Spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};
