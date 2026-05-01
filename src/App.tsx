/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  LayoutDashboard, 
  Trophy, 
  ShoppingBag, 
  Settings, 
  User as UserIcon,
  Sun,
  Moon,
  Languages,
  BookOpen,
  Github,
  Award
} from 'lucide-react';

import { storage } from './lib/storage';
import { translations } from './lib/translations';
import { THEMES, AppState, Difficulty } from './lib/types';

// Components
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Store from './components/Store';
import Profile from './components/Profile';
import Tutorial from './components/Tutorial';

export default function App() {
  const [state, setState] = useState<AppState>(storage.load());
  const [activeTab, setActiveTab] = useState<'quiz' | 'dashboard' | 'leaderboard' | 'store' | 'profile'>('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState<Difficulty | null>(null);

  const [quizQuestions, setQuizQuestions] = useState<Question[] | null>(null);

  const t = translations[state.user.language];
  const currentTheme = useMemo(() => {
    const theme = THEMES.find(t => t.id === state.user.currentTheme) || THEMES[0];
    return isDark ? THEMES.find(t => t.id === 'dark')! : theme;
  }, [state.user.currentTheme, isDark]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.colors.primary);
    root.style.setProperty('--secondary', currentTheme.colors.secondary);
    root.style.setProperty('--bg', currentTheme.colors.bg);
    root.style.setProperty('--text', currentTheme.colors.text);
    root.style.setProperty('--text-muted', (currentTheme.colors as any).textMuted || currentTheme.colors.text);
    root.style.setProperty('--border', (currentTheme.colors as any).border || 'rgba(0,0,0,0.1)');
    root.style.setProperty('--surface', (currentTheme.colors as any).surface || 'rgba(255,255,255,0.8)');
  }, [currentTheme]);

  const handleUpdateState = (newState: Partial<AppState>) => {
    const updated = { ...state, ...newState };
    setState(updated);
    storage.save(updated);
  };

  const toggleLanguage = () => {
    const newLang = state.user.language === 'en' ? 'bn' : 'en';
    handleUpdateState({
      user: { ...state.user, language: newLang }
    });
  };

  const handleQuizComplete = (points: number, correct: number, diff: Difficulty, missed: Question[]) => {
    storage.updateStats(stats => {
      const newTotalPoints = stats.totalPoints + points;
      const newHighScores = { ...stats.highScores };
      if (points > newHighScores[diff]) newHighScores[diff] = points;
      
      const newLevel = Math.floor(newTotalPoints / 1000) + 1;
      
      // Merge missed questions, avoiding duplicates
      const currentMissed = stats.missedQuestions || [];
      const newMissed = [...currentMissed];
      missed.forEach(q => {
        if (!newMissed.find(existing => existing.id === q.id)) {
          newMissed.push(q);
        }
      });

      return {
        ...stats,
        totalPoints: newTotalPoints,
        totalQuizzes: stats.totalQuizzes + 1,
        correctAnswers: stats.correctAnswers + correct,
        highScores: newHighScores,
        level: newLevel,
        missedQuestions: newMissed.slice(-50) // Keep last 50 only
      };
    });
    storage.logActivity();
    setQuizDifficulty(null);
    setQuizQuestions(null);
    setState(storage.load());
  };

  const startReviewMode = () => {
    if (state.stats.missedQuestions && state.stats.missedQuestions.length > 0) {
      setQuizQuestions(state.stats.missedQuestions);
      setQuizDifficulty('normal'); // Default difficulty for review
    }
  };

  return (
    <div className="min-h-screen theme-transition pb-24 md:pb-0 md:pl-20 font-sans">
      {/* Header Info */}
      <header className="sticky top-0 z-40 p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto glass border-b border-theme transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="p-3 bg-primary rounded-2xl text-white shadow-xl shadow-primary/30 flex items-center justify-center"
          >
            <Gamepad2 size={24} />
          </motion.div>
          
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight leading-none mb-1">{t.title}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                < Award size={10} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">{t.level} {state.stats.level}</span>
              </div>
              <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">
                {state.stats.totalPoints} {t.points}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLanguage}
            className="h-11 px-4 glass border-theme rounded-xl hover:bg-primary/5 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <Languages size={18} className="text-muted" />
            <span className="hidden sm:inline">{state.user.language}</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark(!isDark)}
            className="w-11 h-11 glass border-theme rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center"
          >
            {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {quizDifficulty ? (
            <Quiz 
              difficulty={quizDifficulty} 
              onComplete={handleQuizComplete}
              onCancel={() => {
                setQuizDifficulty(null);
                setQuizQuestions(null);
              }}
              language={state.user.language}
              initialQuestions={quizQuestions || undefined}
            />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  stats={state.stats} 
                  user={state.user} 
                  language={state.user.language}
                  onStartQuiz={(d) => setQuizDifficulty(d)}
                  onStartReview={startReviewMode}
                />
              )}
              {activeTab === 'quiz' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                  {(['basic', 'normal', 'hard'] as Difficulty[]).map((d) => (
                    <motion.button
                      key={d}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuizDifficulty(d)}
                      className={`math-card text-left flex flex-col gap-4 border-2 transition-colors ${
                        d === 'basic' ? 'border-emerald-500/20' : 
                        d === 'normal' ? 'border-amber-500/20' : 'border-rose-500/20'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        d === 'basic' ? 'bg-emerald-500 text-white' : 
                        d === 'normal' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        <Gamepad2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold capitalize">{t[d]}</h3>
                        <p className="text-sm opacity-60">
                          {d === 'basic' ? 'Addition, subtraction, multiplication.' : 
                           d === 'normal' ? 'Algebra, squares, and percentages.' : 
                           'Advanced math and logic puzzles.'}
                        </p>
                      </div>
                      <div className="mt-auto text-[10px] font-black uppercase tracking-tighter text-muted">
                        {t.highScore}: {state.stats.highScores[d]} pts
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
              {activeTab === 'leaderboard' && <Leaderboard highScores={state.stats.highScores} language={state.user.language} />}
              {activeTab === 'store' && (
                <Store 
                  unlockedThemes={state.stats.unlockedThemes} 
                  totalPoints={state.stats.totalPoints} 
                  currentTheme={state.user.currentTheme}
                  onUnlock={(themeId, cost) => {
                    handleUpdateState({
                      stats: { 
                        ...state.stats, 
                        totalPoints: state.stats.totalPoints - cost,
                        unlockedThemes: [...state.stats.unlockedThemes, themeId]
                      }
                    });
                  }}
                  onSelect={(themeId) => {
                    handleUpdateState({
                      user: { ...state.user, currentTheme: themeId }
                    });
                  }}
                  language={state.user.language}
                />
              )}
              {activeTab === 'profile' && (
                <Profile 
                  user={state.user} 
                  stats={state.stats}
                  onUpdateUser={(u) => handleUpdateState({ user: u })}
                  onClearReview={() => {
                    handleUpdateState({
                      stats: { ...state.stats, missedQuestions: [] }
                    });
                  }}
                  language={state.user.language}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Sidebar (Desktop) / Bottom Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-20 md:flex-col glass border-t md:border-t-0 md:border-r border-theme flex items-center justify-around md:justify-center gap-2 p-3 z-50">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label={t.dashboard} />
        <NavButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<Gamepad2 />} label={t.startQuiz} />
        <NavButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Trophy />} label={t.leaderboard} />
        <NavButton active={activeTab === 'store'} onClick={() => setActiveTab('store')} icon={<ShoppingBag />} label={t.store} />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon />} label={t.profile} />
      </nav>

      <AnimatePresence>
        {state.isFirstTime && (
          <Tutorial 
            onComplete={() => {
              storage.completeTutorial();
              setState(s => ({ ...s, isFirstTime: false }));
            }} 
            language={state.user.language}
          />
        )}
      </AnimatePresence>

      <footer className="hidden md:flex fixed right-4 bottom-4 p-4 text-xs opacity-40 hover:opacity-100 transition-opacity flex-col items-end">
        <p>© 2026 Math Mind</p>
        <p className="flex items-center gap-1">
          Made by <span className="font-bold">Md Asadullah Al Munib</span>
          <a href="https://github.com/AsadullahAlMunib" target="_blank" className="hover:text-primary"><Github size={12} /></a>
        </p>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl transition-all ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-primary/30 font-bold' 
          : 'text-muted hover:bg-primary/10'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      <span className="text-[10px] absolute -bottom-6 w-max opacity-0 md:group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </button>
  );
}
