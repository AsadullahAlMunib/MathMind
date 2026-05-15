/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'basic' | 'normal' | 'hard' | 'review';
export type QuestionType = 'mcq' | 'true-false' | 'fill-blank' | 'calculation' | 'matching';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  question: string; // Can be text or LaTeX/Math
  options?: string[];
  answer: string;
  type: QuestionType;
  difficulty: Difficulty;
  explanation?: string;
  pairs?: MatchingPair[]; // For matching type
}

export interface ActivityDay {
  date: string;
  count: number;
}

export interface QuizHistory {
  id: string;
  date: string;
  difficulty: Difficulty;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number; // Final time spent in seconds
}

export interface Achievement {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  longDescription?: string;
  longDescriptionBn?: string;
  icon: string; // Lucide icon name or emoji
  requirement: (stats: UserStats) => boolean;
  targetValue?: number;
  getValue?: (stats: UserStats) => number;
  isRecurring?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quiz',
    title: 'First Step',
    titleBn: 'প্রথম পদক্ষেপ',
    description: 'Complete your first math quiz',
    descriptionBn: 'আপনার প্রথম গণিত কুইজ সম্পন্ন করুন',
    longDescription: 'You have started your journey to master mathematics. Every great mathematician began with their first step.',
    longDescriptionBn: 'আপনি গণিতে দক্ষতা অর্জনের যাত্রা শুরু করেছেন। প্রত্যেক মহান গণিতবিদ তাদের প্রথম পদক্ষেপের মাধ্যমেই যাত্রা শুরু করেছিলেন।',
    icon: 'target',
    requirement: (stats) => stats.totalQuizzes >= 1,
    targetValue: 1,
    getValue: (stats) => stats.totalQuizzes
  },
  {
    id: 'perfect_basic',
    title: 'Warm Up Master',
    titleBn: 'ওয়ার্ম আপ মাস্টার',
    description: 'Get a score of 500 in Basic difficulty',
    descriptionBn: 'প্রাথমিক লেভেলে ৫০০ স্কোর অর্জন করুন',
    longDescription: 'Solving basic problems quickly is the foundation of speed. You\'ve proven you\'re ready for bigger challenges.',
    longDescriptionBn: 'প্রাথমিক সমস্যাগুলো দ্রুত সমাধান করা হলো গতির ভিত্তি। আপনি প্রমাণ করেছেন যে আপনি বড় চ্যালেঞ্জের জন্য প্রস্তুত।',
    icon: 'zap',
    requirement: (stats) => stats.highScores.basic >= 500,
    targetValue: 500,
    getValue: (stats) => stats.highScores.basic,
    isRecurring: true
  },
  {
    id: 'streak_10',
    title: 'On Fire',
    titleBn: 'অন ফায়ার',
    description: 'Achieve a best streak of 10 or more',
    descriptionBn: '১০ বা তার বেশি টানা সঠিক উত্তর দিন',
    longDescription: 'Your focus is incredible! Getting many answers right in a row shows deep concentration and skill.',
    longDescriptionBn: 'আপনার একাগ্রতা অবিশ্বাস্য! পর পর অনেকগুলো সঠিক উত্তর দেওয়া গভীর মনোযোগ এবং দক্ষতার প্রতীক।',
    icon: 'flame',
    requirement: (stats) => stats.bestStreak >= 10,
    targetValue: 10,
    getValue: (stats) => stats.bestStreak
  },
  {
    id: 'point_collector_10k',
    title: 'Point Hoarder',
    titleBn: 'পয়েন্ট সংগ্রাহক',
    description: 'Earn a total of 10,000 points',
    descriptionBn: 'মোট ১০,০০০ পয়েন্ট অর্জন করুন',
    longDescription: 'Persistence pays off. Collecting points consistently shows your long-term dedication to practice.',
    longDescriptionBn: 'অধ্যবসায়ের ফল মিষ্টি হয়। ধারাবাহিকভাবে পয়েন্ট সংগ্রহ করা আপনার দীর্ঘমেয়াদী অনুশীলনের একাগ্রতা প্রকাশ করে।',
    icon: 'coins',
    requirement: (stats) => stats.totalPoints >= 10000,
    targetValue: 10000,
    getValue: (stats) => stats.totalPoints
  },
  {
    id: 'theme_fanatic',
    title: 'Fashionable',
    titleBn: 'ফ্যাশনেবল',
    description: 'Unlock 5 different themes',
    descriptionBn: '৫টি আলাদা থিম আনলক করুন',
    longDescription: 'Math is beautiful, and so is your interface. You appreciate style and performance equally.',
    longDescriptionBn: 'গণিত যেমন সুন্দর, আপনার ইন্টারফেসও তেমন। আপনি শৈলী এবং পারফরম্যান্স উভয়কেই সমানভাবে গুরুত্ব দেন।',
    icon: 'palette',
    requirement: (stats) => stats.unlockedThemes.length >= 5,
    targetValue: 5,
    getValue: (stats) => stats.unlockedThemes.length
  },
  {
    id: 'hard_core',
    title: 'Math Legend',
    titleBn: 'ম্যাথ লিজেন্ড',
    description: 'Complete a Hard mode quiz with score > 1200',
    descriptionBn: 'হার্ড মোডে ১২০০ এর বেশি স্কোর অর্জন করুন',
    longDescription: 'Only the best can handle the pressure of hard equations and intense time limits. You are truly a legend.',
    longDescriptionBn: 'কেবল সেরারাই কঠিন সমীকরণ এবং তীব্র সময়ের চাপের মোকাবিলা করতে পারে। আপনি সত্যিই একজন কিংবদন্তি।',
    icon: 'crown',
    requirement: (stats) => stats.highScores.hard >= 1200,
    targetValue: 1200,
    getValue: (stats) => stats.highScores.hard,
    isRecurring: true
  },
  {
    id: 'marathoner',
    title: 'Math Marathoner',
    titleBn: 'ম্যাথ ম্যারাথোনার',
    description: 'Active for 10 distinct days',
    descriptionBn: '১০টি ভিন্ন দিন সক্রিয় থাকুন',
    longDescription: 'Consistency is the key to learning. By visiting for 10 days, you\'ve made math a part of your life.',
    longDescriptionBn: 'শেখবার চাবিকাঠি হলো ধারাবাহিকতা। ১০ দিন আসার মাধ্যমে আপনি গণিতকে আপনার জীবনের অংশ করে নিয়েছেন।',
    icon: 'calendar',
    requirement: (stats) => (stats.activity?.length || 0) >= 10,
    targetValue: 10,
    getValue: (stats) => stats.activity?.length || 0,
    isRecurring: true
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable Force',
    titleBn: 'আনস্টপেবল ফোর্স',
    description: 'Complete 10 perfect quizzes (10/10 correct)',
    descriptionBn: '১০টি নিখুঁত কুইজ সম্পন্ন করুন (১০/১০ সঠিক)',
    longDescription: 'Perfection is rare. Completing 10 full quizzes without a single error is a mark of true excellence.',
    longDescriptionBn: 'নিখুঁত হওয়া বিরল। একটিও ভুল ছাড়া ১০টি পূর্ণ কুইজ সম্পন্ন করা সত্যিকারের শ্রেষ্ঠত্বের পরিচয়।',
    icon: 'shield-check',
    requirement: (stats) => (stats.achievementCounts?.['unstoppable'] || 0) >= 10,
    targetValue: 10,
    getValue: (stats) => stats.achievementCounts?.['unstoppable'] || 0,
    isRecurring: true
  },
  {
    id: 'elite_calculator',
    title: 'Elite Calculator',
    titleBn: 'এলিট ক্যালকুলেটর',
    description: '100 quizzes total (min 25 per difficulty)',
    descriptionBn: 'মোট ১০০টি কুইজ সম্পন্ন করুন (প্রতিটি লেভেলে কমপক্ষে ২৫টি)',
    longDescription: 'You have explored all levels of mathematics. Your versatility across difficulties makes you an elite solver.',
    longDescriptionBn: 'আপনি গণিতের সকল স্তর অন্বেষণ করেছেন। বিভিন্ন অসুবিধার স্তরে আপনার বহুমুখী দক্ষতা আপনাকে একজন এলিট সমাধানকারীতে পরিণত করেছে।',
    icon: 'calculator',
    requirement: (stats) => {
      const basic = stats.lifetimeQuizzesByDifficulty?.basic || 0;
      const normal = stats.lifetimeQuizzesByDifficulty?.normal || 0;
      const hard = stats.lifetimeQuizzesByDifficulty?.hard || 0;
      return (basic + normal + hard) >= 100 && basic >= 25 && normal >= 25 && hard >= 25;
    },
    targetValue: 100,
    getValue: (stats) => {
      const basic = stats.lifetimeQuizzesByDifficulty?.basic || 0;
      const normal = stats.lifetimeQuizzesByDifficulty?.normal || 0;
      const hard = stats.lifetimeQuizzesByDifficulty?.hard || 0;
      return basic + normal + hard;
    }
  },
  {
    id: 'light_speed',
    title: 'Light Speed',
    titleBn: 'লাইট স্পিড',
    description: 'Answer questions within 5 seconds consecutively',
    descriptionBn: '৫ সেকেন্ডের মধ্যে পর পর উত্তর দিন',
    longDescription: 'Your brain processes numbers faster than light! Your rapid-fire answers are truly breathtaking.',
    longDescriptionBn: 'আপনার মস্তিষ্ক আলোর চেয়েও দ্রুত সংখ্যা প্রসেস করতে পারে! আপনার দ্রুতগতির উত্তরগুলো সত্যিই চমৎকার।',
    icon: 'zap',
    requirement: (stats) => (stats.bestLightSpeedStreak || 0) >= 5,
    targetValue: 5,
    getValue: (stats) => stats.bestLightSpeedStreak || 0,
    isRecurring: true
  }
];

export interface LeaderboardRival {
  id: string;
  name: string;
  avatar: string;
  totalPoints: number;
  scores: Record<Difficulty, number>;
  lifetimeLevelScores?: Record<Difficulty, number>;
  trend: 'up' | 'down' | 'stable';
  lastActive: string;
}

export interface UserStats {
  totalPoints: number;
  balance: number;
  totalQuizzes: number;
  totalQuestionsAttempted?: number; // Cumulative total of all questions seen
  correctAnswers: number;
  bestStreak: number;
  level: number;
  unlockedThemes: string[];
  unlockedAchievements?: string[];
  achievementUnlocks?: Record<string, string>;
  achievementCounts?: Record<string, number>; // For multipliers like 2x, 3x
  bestLightSpeedStreak?: number; // Best streak of answers < 5s
  lifetimeCorrectByDifficulty?: Record<Difficulty, number>;
  lifetimeQuizzesByDifficulty?: Record<Difficulty, number>; // For Elite Calculator
  activity: ActivityDay[];
  highScores: Record<Difficulty, number>;
  lifetimeLevelScores?: Record<Difficulty, number>;
  missedQuestions?: Question[];
  missedCorrectCounts?: Record<string, number>;
  history?: QuizHistory[];
  rivals?: LeaderboardRival[];
}

export interface UserProfile {
  name: string;
  avatar: string;
  bio?: string;
  avatarStyle?: string;
  avatarColor?: string;
  customTheme?: {
    primary: string;
    secondary: string;
    bg?: string;
    text?: string;
    darkPrimary?: string;
    darkSecondary?: string;
    darkBg?: string;
    darkText?: string;
  };
  joinedAt: string;
  language: 'en' | 'bn';
  currentTheme: string;
  soundsEnabled: boolean;
  isDarkMode: boolean;
}

export interface AppState {
  user: UserProfile;
  stats: UserStats;
  isFirstTime: boolean;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  bg: string;
  text: string;
  textMuted?: string;
  surface: string;
  border: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  darkColors?: ThemeColors;
  cost: number;
}

export const THEMES: Theme[] = [
  { 
    id: 'default', 
    name: 'Default', 
    colors: { 
      primary: '#4f46e5', 
      secondary: '#6366f1', 
      bg: '#f1f5f9', 
      text: '#0f172a',
      textMuted: '#475569',
      surface: '#ffffff',
      border: '#cbd5e1'
    }, 
    darkColors: {
      primary: '#818cf8', 
      secondary: '#6366f1', 
      bg: '#020617', 
      text: '#f8fafc',
      textMuted: '#94a3b8',
      surface: '#0f172a',
      border: '#1e293b'
    },
    cost: 0 
  },
  { 
    id: 'emerald', 
    name: 'Emerald Forest', 
    colors: { 
      primary: '#059669', 
      secondary: '#10b981', 
      bg: '#f0fdf4', 
      text: '#064e3b',
      textMuted: '#14532d',
      surface: '#ffffff',
      border: '#bbf7d0'
    }, 
    darkColors: {
      primary: '#34d399', 
      secondary: '#10b981', 
      bg: '#022c22', 
      text: '#ecfdf5',
      textMuted: '#6ee7b7',
      surface: '#064e3b',
      border: '#065f46'
    },
    cost: 500 
  },
  { 
    id: 'sunset', 
    name: 'Sunset Glow', 
    colors: { 
      primary: '#d97706', 
      secondary: '#f59e0b', 
      bg: '#fffbeb', 
      text: '#451a03',
      textMuted: '#78350f',
      surface: '#ffffff',
      border: '#fde68a'
    }, 
    darkColors: {
      primary: '#fbbf24', 
      secondary: '#f59e0b', 
      bg: '#451a03', 
      text: '#fffbeb',
      textMuted: '#fde68a',
      surface: '#78350f',
      border: '#92400e'
    },
    cost: 1000 
  },
  { 
    id: 'cyber', 
    name: 'Cyberpunk', 
    colors: { 
      primary: '#ff00ff', 
      secondary: '#00ffff', 
      bg: '#fdf4ff', 
      text: '#4a044e',
      textMuted: '#701a75',
      surface: '#ffffff',
      border: '#f5d0fe'
    }, 
    darkColors: {
      primary: '#ff00ff', 
      secondary: '#00ffff', 
      bg: '#0d0221', 
      text: '#00ff00',
      textMuted: '#00cc00',
      surface: '#1a0b2e',
      border: '#2d0e4e'
    },
    cost: 2500 
  },
  { 
    id: 'royal', 
    name: 'Royal Gold', 
    colors: { 
      primary: '#92400e', 
      secondary: '#b45309', 
      bg: '#fffbeb', 
      text: '#451a03',
      textMuted: '#78350f',
      surface: '#ffffff',
      border: '#fef3c7'
    }, 
    darkColors: {
      primary: '#fbbf24', 
      secondary: '#f59e0b', 
      bg: '#1c1917', 
      text: '#fafaf9',
      textMuted: '#fed7aa',
      surface: '#292524',
      border: '#44403c'
    },
    cost: 5000 
  },
  { 
    id: 'ocean_breeze', 
    name: 'Ocean Breeze', 
    colors: { 
      primary: '#0ea5e9', 
      secondary: '#38bdf8', 
      bg: '#f0f9ff', 
      text: '#0c4a6e',
      textMuted: '#075985',
      surface: '#ffffff',
      border: '#bae6fd'
    }, 
    darkColors: {
      primary: '#38bdf8', 
      secondary: '#22d3ee', 
      bg: '#082f49', 
      text: '#e0f2fe',
      textMuted: '#7dd3fc',
      surface: '#0c4a6e',
      border: '#075985'
    },
    cost: 7500 
  },
  { 
    id: 'lavender', 
    name: 'Lavender Dream', 
    colors: { 
      primary: '#7c3aed', 
      secondary: '#8b5cf6', 
      bg: '#f5f3ff', 
      text: '#4c1d95',
      textMuted: '#5b21b6',
      surface: '#ffffff',
      border: '#ddd6fe'
    }, 
    darkColors: {
      primary: '#a78bfa', 
      secondary: '#c4b5fd', 
      bg: '#2e1065', 
      text: '#f5f3ff',
      textMuted: '#ddd6fe',
      surface: '#4c1d95',
      border: '#5b21b6'
    },
    cost: 10000 
  },
  { 
    id: 'monochrome', 
    name: 'Monochrome Pro', 
    colors: { 
      primary: '#18181b', 
      secondary: '#3f3f46', 
      bg: '#ffffff', 
      text: '#18181b',
      textMuted: '#52525b',
      surface: '#f4f4f5',
      border: '#e4e4e7'
    }, 
    darkColors: {
      primary: '#f4f4f5', 
      secondary: '#a1a1aa', 
      bg: '#09090b', 
      text: '#f4f4f5',
      textMuted: '#a1a1aa',
      surface: '#18181b',
      border: '#27272a'
    },
    cost: 15000 
  },
  { 
    id: 'nebula', 
    name: 'Nebula', 
    colors: { 
      primary: '#ec4899', 
      secondary: '#a855f7', 
      bg: '#fdf2f8', 
      text: '#831843',
      textMuted: '#9d174d',
      surface: '#ffffff',
      border: '#fbcfe8'
    }, 
    darkColors: {
      primary: '#f472b6', 
      secondary: '#a78bfa', 
      bg: '#020617', 
      text: '#f8fafc',
      textMuted: '#94a3b8',
      surface: '#0f172a',
      border: '#1e293b'
    },
    cost: 20000 
  },
  { 
    id: 'crimson', 
    name: 'Crimson Fury', 
    colors: { 
      primary: '#b91c1c', 
      secondary: '#dc2626', 
      bg: '#fff1f2', 
      text: '#7f1d1d',
      textMuted: '#991b1b',
      surface: '#ffffff',
      border: '#fecaca'
    }, 
    darkColors: {
      primary: '#ef4444', 
      secondary: '#dc2626', 
      bg: '#450a0a', 
      text: '#fef2f2',
      textMuted: '#fca5a5',
      surface: '#7f1d1d',
      border: '#991b1b'
    },
    cost: 30000 
  },
];

/**
 * Utility functions for color manipulation (Hex/HSL)
 */

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export const hexToHSL = (hex: string): HSL => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

export const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

/**
 * Suggests a dark mode equivalent for a given light mode color
 */
export const suggestDarkEquivalent = (hex: string, type: 'primary' | 'secondary' | 'bg' | 'text'): string => {
  const hsl = hexToHSL(hex);
  
  switch (type) {
    case 'primary':
    case 'secondary':
      // For primary/secondary button colors:
      // Typically we want it slightly lighter (higher L) and more saturated (higher S) for OLED/Dark screens
      return hslToHex(hsl.h, Math.min(100, hsl.s + 10), Math.min(90, Math.max(45, hsl.l + 15)));
    
    case 'bg':
      // For background:
      // We want a very dark version of the same hue (low L, lowish S)
      return hslToHex(hsl.h, Math.min(30, hsl.s * 0.5), 2);
      
    case 'text':
      // For text:
      // Usually near white, maybe 95% lightness
      return hslToHex(hsl.h, Math.min(10, hsl.s), 95);
      
    default:
      return hex;
  }
};
