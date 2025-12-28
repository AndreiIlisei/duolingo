"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ReviewItem = {
  id: number;
  itemId: number;
  term: string;
  meaning: string;
  partOfSpeech?: string | null;
  example?: string | null;
};

type ReviewResult = {
  itemId: number;
  quality: number;
  responseMs: number;
};

export default function SmartReviewSessionPage() {
  const router = useRouter();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    fetchDueItems();
  }, []);

  const fetchDueItems = async () => {
    try {
      const response = await fetch("/api/srs/due-items");
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();
      setItems(data.items || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching due items:", error);
      setLoading(false);
    }
  };

  const handleQualityRating = async (quality: number) => {
    if (!items[currentIndex]) return;

    const responseMs = Date.now() - startTime;
    const result: ReviewResult = {
      itemId: items[currentIndex].itemId,
      quality,
      responseMs,
    };

    setResults([...results, result]);

    try {
      await fetch("/api/srs/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
    } catch (error) {
      console.error("Error submitting review:", error);
    }

    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setStartTime(Date.now());
    } else {
      router.push("/smart-review?completed=true");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading review session...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No items due for review</h2>
          <p className="mt-2 text-slate-600">Check back later!</p>
          <button
            onClick={() => router.push("/smart-review")}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Back to Smart Review
          </button>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const progress = ((currentIndex + 1) / items.length) * 100;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Progress bar */}
      <div className="h-2 bg-slate-200">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="text-sm text-slate-600">
            {currentIndex + 1} / {items.length}
          </div>
          <button
            onClick={() => router.push("/smart-review")}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Question card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mb-2 text-sm font-medium text-slate-500">
                Translate this word
              </div>
              <div className="text-4xl font-bold text-slate-900">
                {currentItem.term}
              </div>
              {currentItem.partOfSpeech && (
                <div className="mt-2 text-sm text-slate-500">
                  ({currentItem.partOfSpeech})
                </div>
              )}
            </div>

            {/* Answer section */}
            {showAnswer ? (
              <div className="mt-8 border-t border-slate-200 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-indigo-600">
                    {currentItem.meaning}
                  </div>
                  {currentItem.example && (
                    <div className="mt-4 text-sm italic text-slate-600">
                      Example: {currentItem.example}
                    </div>
                  )}
                </div>

                {/* Quality rating buttons */}
                <div className="mt-8 grid grid-cols-4 gap-3">
                  <button
                    onClick={() => handleQualityRating(1)}
                    className="rounded-lg border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Again
                  </button>
                  <button
                    onClick={() => handleQualityRating(3)}
                    className="rounded-lg border-2 border-orange-500 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 hover:bg-orange-100"
                  >
                    Hard
                  </button>
                  <button
                    onClick={() => handleQualityRating(4)}
                    className="rounded-lg border-2 border-blue-500 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100"
                  >
                    Good
                  </button>
                  <button
                    onClick={() => handleQualityRating(5)}
                    className="rounded-lg border-2 border-green-500 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-100"
                  >
                    Easy
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Show Answer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
