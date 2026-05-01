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
  { id: 'default', name: 'Default', colors: { primary: '#6366f1', secondary: '#4f46e5', bg: '#f9fafb', text: '#111827' }, cost: 0 },
  { id: 'dark', name: 'Dark Night', colors: { primary: '#818cf8', secondary: '#6366f1', bg: '#111827', text: '#f9fafb' }, cost: 0 },
  { id: 'emerald', name: 'Emerald Forest', colors: { primary: '#10b981', secondary: '#059669', bg: '#f0fdf4', text: '#064e3b' }, cost: 500 },
  { id: 'sunset', name: 'Sunset Glow', colors: { primary: '#f59e0b', secondary: '#d97706', bg: '#fffbeb', text: '#78350f' }, cost: 1000 },
  { id: 'cyber', name: 'Cyberpunk', colors: { primary: '#ff00ff', secondary: '#00ffff', bg: '#0b001a', text: '#00ff00' }, cost: 2500 },
  { id: 'royal', name: 'Royal Gold', colors: { primary: '#fbbf24', secondary: '#d97706', bg: '#fff7ed', text: '#431407' }, cost: 5000 },
];
