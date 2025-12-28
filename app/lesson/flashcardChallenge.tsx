"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  term: string;
  meaning: string;
  partOfSpeech?: string | null;
  example?: string | null;
  onQualitySelect: (quality: number) => void;
  disabled?: boolean;
};

export const FlashcardChallenge = ({
  term,
  meaning,
  partOfSpeech,
  example,
  onQualitySelect,
  disabled,
}: Props) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="w-full">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mb-2 text-sm font-medium text-slate-500">
            Translate this word
          </div>
          <div className="text-4xl font-bold text-slate-900">{term}</div>
          {partOfSpeech && (
            <div className="mt-2 text-sm text-slate-500">({partOfSpeech})</div>
          )}
        </div>

        {showAnswer ? (
          <div className="mt-8 border-t border-slate-200 pt-8">
            <div className="text-center">
              <div className="text-2xl font-semibold text-indigo-600">
                {meaning}
              </div>
              {example && (
                <div className="mt-4 text-sm italic text-slate-600">
                  Example: {example}
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-4 gap-3">
              <button
                onClick={() => onQualitySelect(1)}
                disabled={disabled}
                className={cn(
                  "rounded-lg border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                Again
              </button>
              <button
                onClick={() => onQualitySelect(3)}
                disabled={disabled}
                className={cn(
                  "rounded-lg border-2 border-orange-500 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                Hard
              </button>
              <button
                onClick={() => onQualitySelect(4)}
                disabled={disabled}
                className={cn(
                  "rounded-lg border-2 border-blue-500 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                Good
              </button>
              <button
                onClick={() => onQualitySelect(5)}
                disabled={disabled}
                className={cn(
                  "rounded-lg border-2 border-green-500 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                Easy
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAnswer(true)}
              disabled={disabled}
              className={cn(
                "rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              Show Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
