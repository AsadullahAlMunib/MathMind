/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, UserProfile, UserStats, Question, LeaderboardRival, Difficulty } from './types';

const INITIAL_RIVALS: LeaderboardRival[] = [
  { id: 'r1', name: 'Euler_Math', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Euler', totalPoints: 150000, scores: { basic: 50420, normal: 51200, hard: 52100, review: 20000 }, lifetimeLevelScores: { basic: 45000, normal: 55000, hard: 50000, review: 15000 }, trend: 'stable', lastActive: new Date().toISOString() },
  { id: 'r2', name: 'Pythagoras', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Pythagoras', totalPoints: 130000, scores: { basic: 46200, normal: 45800, hard: 44500, review: 18000 }, lifetimeLevelScores: { basic: 52000, normal: 38000, hard: 40000, review: 12000 }, trend: 'up', lastActive: new Date().toISOString() },
  { id: 'r3', name: 'Gauss_99', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Gauss', totalPoints: 115000, scores: { basic: 41800, normal: 39500, hard: 37800, review: 15000 }, lifetimeLevelScores: { basic: 32000, normal: 48000, hard: 35000, review: 10000 }, trend: 'down', lastActive: new Date().toISOString() },
  { id: 'r4', name: 'Hypatia_X', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Hypatia', totalPoints: 100000, scores: { basic: 36500, normal: 34200, hard: 31500, review: 12000 }, lifetimeLevelScores: { basic: 28000, normal: 30000, hard: 42000, review: 8000 }, trend: 'up', lastActive: new Date().toISOString() },
  { id: 'r5', name: 'Newton_Apple', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Newton', totalPoints: 85000, scores: { basic: 31200, normal: 29800, hard: 27200, review: 10000 }, lifetimeLevelScores: { basic: 35000, normal: 25000, hard: 25000, review: 6000 }, trend: 'stable', lastActive: new Date().toISOString() },
  { id: 'r6', name: 'Ada_L', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ada', totalPoints: 75000, scores: { basic: 27400, normal: 25400, hard: 22800, review: 8000 }, lifetimeLevelScores: { basic: 20000, normal: 32000, hard: 23000, review: 4000 }, trend: 'up', lastActive: new Date().toISOString() },
  { id: 'r7', name: 'Ramanujan', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rama', totalPoints: 65000, scores: { basic: 23100, normal: 21600, hard: 18900, review: 6000 }, lifetimeLevelScores: { basic: 25000, normal: 18000, hard: 22000, review: 3500 }, trend: 'stable', lastActive: new Date().toISOString() },
  { id: 'r8', name: 'Descartes', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Descartes', totalPoints: 55000, scores: { basic: 19500, normal: 17800, hard: 14600, review: 4500 }, lifetimeLevelScores: { basic: 15000, normal: 22000, hard: 18000, review: 2000 }, trend: 'down', lastActive: new Date().toISOString() },
  { id: 'r9', name: 'Fibonacci', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Fibo', totalPoints: 45000, scores: { basic: 15800, normal: 14200, hard: 11200, review: 3000 }, lifetimeLevelScores: { basic: 18000, normal: 12000, hard: 15000, review: 1500 }, trend: 'up', lastActive: new Date().toISOString() },
  { id: 'r10', name: 'Leibniz_DT', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Leibniz', totalPoints: 35000, scores: { basic: 12450, normal: 10840, hard: 8620, review: 2000 }, lifetimeLevelScores: { basic: 10000, normal: 11000, hard: 14000, review: 1000 }, trend: 'stable', lastActive: new Date().toISOString() },
];

const INITIAL_STATS: UserStats = {
  totalPoints: 0,
  balance: 0,
  totalQuizzes: 0,
  totalQuestionsAttempted: 0,
  correctAnswers: 0,
  bestStreak: 0,
  level: 1,
  unlockedThemes: ['default'],
  activity: [],
  highScores: { basic: 0, normal: 0, hard: 0, review: 0 },
  lifetimeLevelScores: { basic: 0, normal: 0, hard: 0, review: 0 },
  missedQuestions: [],
  history: [],
  unlockedAchievements: [],
  achievementUnlocks: {},
  rivals: INITIAL_RIVALS,
};

const INITIAL_USER: UserProfile = {
  name: 'Math Explorer',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=MathMind&backgroundColor=b6e3f4',
  bio: 'Exploring the beauty of mathematics one problem at a time.',
  avatarStyle: 'avataaars',
  avatarColor: 'b6e3f4',
  joinedAt: new Date().toISOString(),
  language: 'bn',
  currentTheme: 'default',
  soundsEnabled: true,
  isDarkMode: false,
};

const STORAGE_KEY = 'math_mind_v1';
const QUESTION_CACHE_KEY = 'math_mind_questions_cache_v2';

export const storage = {
  save: (data: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  
  saveToQuestionCache: (questions: Question[]) => {
    try {
      const existing = storage.getQuestionCache();
      // Deduplicate by ID
      const existingIds = new Set(existing.map(q => q.id));
      const newQuestions = questions.filter(q => !existingIds.has(q.id));
      
      const updated = [...newQuestions, ...existing].slice(0, 150); // Increased to 150 for better offline variety
      localStorage.setItem(QUESTION_CACHE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to question cache', e);
    }
  },

  getQuestionCache: (): Question[] => {
    try {
      const data = localStorage.getItem(QUESTION_CACHE_KEY);
      if (!data) return [];
      const questions: Question[] = JSON.parse(data);
      
      // Migration/Cleanup: Strip unwanted formatting instructions from cached questions
      const instructionRegex = /\s*\((?:উত্তর|answer).*?\)\s*$/i;
      return questions.map(q => {
        if (q.question && instructionRegex.test(q.question)) {
          return { ...q, question: q.question.replace(instructionRegex, '').trim() };
        }
        return q;
      });
    } catch (e) {
      return [];
    }
  },

  load: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        user: INITIAL_USER,
        stats: INITIAL_STATS,
        isFirstTime: true,
      };
    }
    const parsed: AppState = JSON.parse(data);
    
    // Migration: Ensure totalQuestionsAttempted exists
    if (parsed.stats.totalQuestionsAttempted === undefined) {
      // Best guess for existing users
      parsed.stats.totalQuestionsAttempted = parsed.stats.totalQuizzes * 10;
    }
    
    // Migration: Ensure balance exists
    if (parsed.stats.balance === undefined) {
      parsed.stats.balance = parsed.stats.totalPoints;
    }
    
    // Migration: Initialize lifetimeLevelScores
    if (parsed.stats.lifetimeLevelScores === undefined) {
      parsed.stats.lifetimeLevelScores = { ...parsed.stats.highScores, review: 0 };
    }
    
    // Ensure all difficulties exist in highScores and lifetimeLevelScores
    const difficulties: Difficulty[] = ['basic', 'normal', 'hard', 'review'];
    difficulties.forEach(d => {
      if (parsed.stats.highScores[d] === undefined) parsed.stats.highScores[d] = 0;
      if (parsed.stats.lifetimeLevelScores![d] === undefined) parsed.stats.lifetimeLevelScores![d] = 0;
    });
    
    // Migration: If user was using the old standalone 'dark' theme, 
    // move them to 'default' which now has dark mode support.
    if (parsed.user.currentTheme === 'dark') {
      parsed.user.currentTheme = 'default';
    }
    
    // Ensure 'dark' is removed from unlocked themes to keep it clean
    if (parsed.stats.unlockedThemes.includes('dark')) {
      parsed.stats.unlockedThemes = parsed.stats.unlockedThemes.filter(id => id !== 'dark');
    }

    // Migration: Ensure bio and avatar metadata exist
    if (parsed.user.bio === undefined) {
      parsed.user.bio = 'Exploring the beauty of mathematics one problem at a time.';
    }
    if (parsed.user.avatarStyle === undefined) {
      parsed.user.avatarStyle = 'avataaars';
    }
    if (parsed.user.avatarColor === undefined) {
      parsed.user.avatarColor = 'b6e3f4';
    }
    if (parsed.user.soundsEnabled === undefined) {
      parsed.user.soundsEnabled = true;
    }
    if (parsed.user.isDarkMode === undefined) {
      parsed.user.isDarkMode = false;
    }

    // Force update rivals if they are using the old scoring scale (less than 10k for top rank)
    const topRival = parsed.stats.rivals?.find(r => r.id === 'r1');
    const needsScoreReset = topRival && topRival.scores.basic < 10000;

    if (parsed.stats.rivals === undefined || needsScoreReset) {
      parsed.stats.rivals = INITIAL_RIVALS;
    } else {
      // Evolve rivals: small chance to change score and trend to make it feel alive
      parsed.stats.rivals = parsed.stats.rivals.map(rival => {
        const shouldChange = Math.random() > 0.7;
        if (!shouldChange) return rival;

        const newScores = { ...rival.scores };
        const d: Difficulty[] = ['basic', 'normal', 'hard', 'review'];
        d.forEach(level => {
          const change = Math.floor((Math.random() - 0.4) * 50); // Small random change
          newScores[level] = Math.max(0, (newScores[level] || 0) + change);
        });

        const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
        return {
          ...rival,
          scores: newScores,
          trend: trends[Math.floor(Math.random() * trends.length)],
          lastActive: new Date().toISOString()
        };
      });
    }

    // Migration: Ensure history is limited to 100
    if (parsed.stats.history && parsed.stats.history.length > 100) {
      parsed.stats.history = parsed.stats.history.slice(0, 100);
    }

    return parsed;
  },

  updateStats: (updater: (stats: UserStats) => UserStats) => {
    const data = storage.load();
    data.stats = updater(data.stats);
    storage.save(data);
    return data.stats;
  },

  updateUser: (updater: (user: UserProfile) => UserProfile) => {
    const data = storage.load();
    data.user = updater(data.user);
    storage.save(data);
    return data.user;
  },

  completeTutorial: () => {
    const data = storage.load();
    data.isFirstTime = false;
    storage.save(data);
  },

  logActivity: () => {
    const today = new Date().toISOString().split('T')[0];
    storage.updateStats((stats) => {
      const activity = [...stats.activity];
      const existing = activity.find(a => a.date === today);
      if (existing) {
        existing.count += 1;
      } else {
        activity.push({ date: today, count: 1 });
      }
      return { ...stats, activity };
    });
  },

  saveApiKey: (key: string) => {
    localStorage.setItem('gemini_api_key', key);
  },

  getApiKey: () => {
    return localStorage.getItem('gemini_api_key');
  },

  clearApiKey: () => {
    localStorage.removeItem('gemini_api_key');
  }
};
