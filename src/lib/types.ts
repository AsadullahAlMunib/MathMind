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

export interface UserStats {
  totalPoints: number;
  totalQuizzes: number;
  correctAnswers: number;
  bestStreak: number;
  level: number;
  unlockedThemes: string[];
  activity: ActivityDay[];
  highScores: Record<Difficulty, number>;
  missedQuestions?: Question[];
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

export const THEMES = [
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
    cost: 0 
  },
  { 
    id: 'dark', 
    name: 'Dark Night', 
    colors: { 
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
    cost: 5000 
  },
];
