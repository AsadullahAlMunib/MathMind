/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, UserProfile, UserStats } from './types';

const INITIAL_STATS: UserStats = {
  totalPoints: 0,
  totalQuizzes: 0,
  correctAnswers: 0,
  bestStreak: 0,
  level: 1,
  unlockedThemes: ['default', 'dark'],
  activity: [],
  highScores: { basic: 0, normal: 0, hard: 0 },
  missedQuestions: [],
};

const INITIAL_USER: UserProfile = {
  name: 'Math Explorer',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MathMind',
  joinedAt: new Date().toISOString(),
  language: 'bn',
  currentTheme: 'default',
};

const STORAGE_KEY = 'math_mind_v1';

export const storage = {
  save: (data: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    return JSON.parse(data);
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
  }
};
