import { title } from "process";
import { text } from "stream/consumers";
import { Path } from "./types";
import {
  Star,
  Clock,
  BookOpen,
  Target,
  Brain,
  Globe,
  Briefcase,
  Plane,
  Zap,
} from "lucide-react";

const paths: Path[] = [
  {
    id: 5,
    learning_path_id: "classic",
    title: "Classic Path",
    subtitle: "Learn through structured lessons and challenges",
    difficulty: 2,
    progress: 85,
    icon: "📚",
    meta: [
      { icon: <Clock size={16} />, text: "~15 min/day" },
      { icon: <BookOpen size={16} />, text: "42 lessons" },
      { icon: <Target size={16} />, text: "85% complete" },
    ],
    badges: [
      { text: "🔥 12 day streak", variant: "streak" },
      { text: "📈 +250 XP today", variant: "default" },
    ],
    xpText: "Total earned: 1,240 XP",
    buttonText: "CONTINUE",
  },
  {
    id: 6,
    learning_path_id: "smart",
    title: "Smart Review",
    subtitle: "AI-powered review based on your memory strength",
    difficulty: 3,
    progress: 75,
    icon: "🧠",
    meta: [
      { icon: <Brain size={16} />, text: "23 words due" },
      { icon: <Zap size={16} />, text: "8 min session" },
      { icon: <Target size={16} />, text: "92% accuracy" },
    ],
    badges: [
      { text: "⭐ Recommended", variant: "recommended" },
      { text: "🧠 +180 XP ready", variant: "default" },
    ],
    xpText: "Total earned: 890 XP",
    buttonText: "START REVIEW",
  },
  {
    id: 7,
    learning_path_id: "culture",
    title: "Culture Dive",
    subtitle: "Learn through videos, news, and real-world content",
    difficulty: 2,
    progress: 50,
    icon: "🌍",
    meta: [
      { icon: "🎥", text: "5 new videos" },
      { icon: "📰", text: "Daily news" },
      { icon: <Globe size={16} />, text: "Level: Intermediate" },
    ],
    badges: [
      { text: "✨ New content", variant: "new" },
      { text: "🏆 Weekly challenge", variant: "default" },
    ],
    xpText: "Total earned: 630 XP",
    buttonText: "EXPLORE",
  },
  {
    id: 8,
    learning_path_id: "focused",
    title: "Focused Learning",
    subtitle: "Specialized content for professionals and travelers",
    difficulty: 3,
    progress: 0,
    icon: "🎯",
    meta: [
      { icon: <Briefcase size={16} />, text: "Business focus" },
      { icon: <Plane size={16} />, text: "Travel ready" },
      { icon: <Target size={16} />, text: "Custom goals" },
    ],
    badges: [
      { text: "🎯 Personalized", variant: "default" },
      { text: "📊 Track progress", variant: "default" },
    ],
    xpText: "Ready to start: 0 XP",
    buttonText: "CUSTOMIZE",
  },
];
