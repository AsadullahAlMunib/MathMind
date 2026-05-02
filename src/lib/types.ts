/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'basic' | 'normal' | 'hard';
export type QuestionType = 'mcq' | 'true-false' | 'fill-blank';

export interface Question {
  id: string;
  question: string; // Can be text or LaTeX/Math
  options?: string[];
  answer: string;
  type: QuestionType;
  difficulty: Difficulty;
  explanation?: string;
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
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  requirement: (stats: UserStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quiz',
    title: 'First Step',
    description: 'Complete your first math quiz',
    icon: 'target',
    requirement: (stats) => stats.totalQuizzes >= 1
  },
  {
    id: 'perfect_basic',
    title: 'Warm Up Master',
    description: 'Get a perfect score in Basic difficulty',
    icon: 'zap',
    requirement: (stats) => stats.highScores.basic >= 1000
  },
  {
    id: 'streak_10',
    title: 'On Fire',
    description: 'Achieve a best streak of 10 or more',
    icon: 'flame',
    requirement: (stats) => stats.bestStreak >= 10
  },
  {
    id: 'point_collector_10k',
    title: 'Point Hoarder',
    description: 'Earn a total of 10,000 points',
    icon: 'coins',
    requirement: (stats) => stats.totalPoints >= 10000
  },
  {
    id: 'theme_fanatic',
    title: 'Fashionable',
    description: 'Unlock 5 different themes',
    icon: 'palette',
    requirement: (stats) => stats.unlockedThemes.length >= 5
  },
  {
    id: 'hard_core',
    title: 'Math Legend',
    description: 'Complete a Hard mode quiz with score > 4000',
    icon: 'crown',
    requirement: (stats) => stats.highScores.hard >= 4000
  }
];

export interface UserStats {
  totalPoints: number;
  balance: number;
  totalQuizzes: number;
  correctAnswers: number;
  bestStreak: number;
  level: number;
  unlockedThemes: string[];
  unlockedAchievements?: string[];
  activity: ActivityDay[];
  highScores: Record<Difficulty, number>;
  missedQuestions?: Question[];
  history?: QuizHistory[];
}

export interface UserProfile {
  name: string;
  avatar: string;
  joinedAt: string;
  language: 'en' | 'bn';
  currentTheme: string;
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
      bg: '#0d0221', 
      text: '#00ff00',
      textMuted: '#00cc00',
      surface: '#1a0b2e',
      border: '#2d0e4e'
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
      primary: '#d97706', 
      secondary: '#fbbf24', 
      bg: '#fff7ed', 
      text: '#431407',
      textMuted: '#7c2d12',
      surface: '#ffffff',
      border: '#fed7aa'
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
      secondary: '#06b6d4', 
      bg: '#f0f9ff', 
      text: '#0c4a6e',
      textMuted: '#0369a1',
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
      primary: '#8b5cf6', 
      secondary: '#a78bfa', 
      bg: '#f5f3ff', 
      text: '#4c1d95',
      textMuted: '#6d28d9',
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
      bg: '#fafafa', 
      text: '#18181b',
      textMuted: '#52525b',
      surface: '#ffffff',
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
      secondary: '#8b5cf6', 
      bg: '#0f172a', 
      text: '#f8fafc',
      textMuted: '#94a3b8',
      surface: '#1e293b',
      border: '#334155'
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
      primary: '#dc2626', 
      secondary: '#b91c1c', 
      bg: '#fef2f2', 
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
