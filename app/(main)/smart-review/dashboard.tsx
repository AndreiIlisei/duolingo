"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Flame, Clock, TrendingUp, Calendar } from "lucide-react";

type Props = {
  stats: {
    dueNow: number;
    dueTomorrow: number;
    dueThisWeek: number;
    learning: number;
    mastered: number;
    totalItems: number;
    streak: number;
    estimatedMinutes: number;
  };
};

export const SrsDashboard = ({ stats }: Props) => {
  const router = useRouter();

  const handleStartReview = () => {
    if (stats.dueNow > 0) {
      router.push("/lesson/srs");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">📚 Smart Review</h1>
        <p className="text-slate-600 mt-2">
          Master vocabulary with spaced repetition
        </p>
      </div>

      {/* Main Review Card */}
      <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 shadow-lg">
        <div className="text-center">
          <div className="text-6xl font-bold text-indigo-600 mb-2">
            {stats.dueNow}
          </div>
          <div className="text-xl font-semibold text-slate-700 mb-4">
            {stats.dueNow === 1 ? "word due today" : "words due today"}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-slate-600 mb-6">
            <Clock className="w-5 h-5" />
            <span>~{stats.estimatedMinutes} minutes</span>
          </div>

          <Button
            onClick={handleStartReview}
            disabled={stats.dueNow === 0}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-12 py-6 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stats.dueNow === 0 ? "No Reviews Due" : "Start Review"}
          </Button>

          {stats.dueNow === 0 && (
            <p className="text-sm text-slate-500 mt-4">
              Great job! Check back later for more reviews.
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streak */}
        <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {stats.streak}
              </div>
              <div className="text-sm text-slate-600">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Learning */}
        <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {stats.learning}
              </div>
              <div className="text-sm text-slate-600">Learning</div>
            </div>
          </div>
        </div>

        {/* Mastered */}
        <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {stats.mastered}
              </div>
              <div className="text-sm text-slate-600">Mastered</div>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">📖</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {stats.totalItems}
              </div>
              <div className="text-sm text-slate-600">Total Words</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Reviews */}
      {(stats.dueTomorrow > 0 || stats.dueThisWeek > 0) && (
        <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Upcoming Reviews</h3>
          </div>
          <div className="space-y-2 text-sm">
            {stats.dueTomorrow > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Tomorrow</span>
                <span className="font-medium">{stats.dueTomorrow} words</span>
              </div>
            )}
            {stats.dueThisWeek > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>This week</span>
                <span className="font-medium">{stats.dueThisWeek} words</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-xl border-2 border-blue-100 bg-blue-50 p-6">
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-2">💡 How it works</p>
          <p className="text-blue-800">
            Review words at optimal intervals to maximize retention. Rate each
            word honestly - this helps the system schedule your next review at
            the perfect time.
          </p>
        </div>
      </div>
    </div>
  );
};
