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
  Award,
  Coins,
  CheckCircle2,
  X
} from 'lucide-react';

import { storage } from './lib/storage';
import { translations } from './lib/translations';
import { THEMES, AppState, Difficulty, Question, ACHIEVEMENTS } from './lib/types';
import { soundManager } from './lib/sounds';

// Components
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Store from './components/Store';
import Profile from './components/Profile';
import Tutorial from './components/Tutorial';
import Tooltip from './components/Tooltip';

export default function App() {
  const [state, setState] = useState<AppState>(storage.load());
  const [activeTab, setActiveTab] = useState<'quiz' | 'dashboard' | 'leaderboard' | 'store' | 'profile'>('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState<Difficulty | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[] | null>(null);
  const [toasts, setToasts] = useState<{ id: string; title: string; subtitle: string; icon?: React.ReactNode }[]>([]);

  const t = translations[state.user.language];
  const currentTheme = useMemo(() => {
    return THEMES.find(t => t.id === state.user.currentTheme) || THEMES[0];
  }, [state.user.currentTheme]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    const themeColors = isDark && (currentTheme as any).darkColors 
      ? (currentTheme as any).darkColors 
      : currentTheme.colors;

    root.style.setProperty('--primary', themeColors.primary);
    root.style.setProperty('--secondary', themeColors.secondary);
    root.style.setProperty('--bg', themeColors.bg);
    root.style.setProperty('--text', themeColors.text);
    root.style.setProperty('--text-muted', (themeColors as any).textMuted || themeColors.text);
    root.style.setProperty('--border', (themeColors as any).border || 'rgba(0,0,0,0.1)');
    root.style.setProperty('--surface', (themeColors as any).surface || 'rgba(255,255,255,0.8)');
  }, [currentTheme, isDark]);

  const addToast = (title: string, subtitle: string, icon?: React.ReactNode) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, subtitle, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleUpdateState = (newState: Partial<AppState>) => {
    let updated = { ...state, ...newState };
    
    // Check achievements if stats changed
    if (newState.stats) {
      const unlocked = updated.stats.unlockedAchievements || [];
      const newlyUnlocked = ACHIEVEMENTS
        .filter(a => !unlocked.includes(a.id) && a.requirement(updated.stats))
        .map(a => a.id);
      
      if (newlyUnlocked.length > 0) {
        updated = {
          ...updated,
          stats: {
            ...updated.stats,
            unlockedAchievements: [...unlocked, ...newlyUnlocked]
          }
        };
        
        // Show toasts for newly unlocked achievements
        soundManager.play('unlock');
        newlyUnlocked.forEach(id => {
          const achievement = ACHIEVEMENTS.find(a => a.id === id);
          if (achievement) {
            addToast(t.newAchievement, achievement.title, <Trophy className="text-amber-500" />);
          }
        });
      }
    }
    setState(updated);
    storage.save(updated);
  };

  const toggleLanguage = () => {
    const newLang = state.user.language === 'en' ? 'bn' : 'en';
    handleUpdateState({
      user: { ...state.user, language: newLang }
    });
  };

  const handleQuizComplete = (points: number, correct: number, diff: Difficulty, missed: Question[], sessionStreak: number) => {
    storage.updateStats(stats => {
      const newTotalPoints = stats.totalPoints + points;
      const newBalance = (stats.balance || 0) + points;
      const newHighScores = { ...stats.highScores };
      if (points > newHighScores[diff]) newHighScores[diff] = points;
      
      const newLevel = Math.floor(newTotalPoints / 1000) + 1;
      if (newLevel > stats.level) {
        soundManager.play('levelUp');
      }
      const newBestStreak = Math.max(stats.bestStreak || 0, sessionStreak);
      
      // Merge missed questions, avoiding duplicates
      const currentMissed = stats.missedQuestions || [];
      const newMissed = [...currentMissed];
      missed.forEach(q => {
        if (!newMissed.find(existing => existing.id === q.id)) {
          newMissed.push(q);
        }
      });

      const newHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString(),
        difficulty: diff,
        score: points,
        correctCount: correct,
        totalQuestions: 10
      };

      const finalStats = {
        ...stats,
        totalPoints: newTotalPoints,
        balance: newBalance,
        totalQuizzes: stats.totalQuizzes + 1,
        correctAnswers: stats.correctAnswers + correct,
        highScores: newHighScores,
        level: newLevel,
        bestStreak: newBestStreak,
        missedQuestions: newMissed.slice(-50), // Keep last 50 only
        history: [newHistoryItem, ...(stats.history || [])].slice(0, 10)
      };

      // Check achievements
      const unlocked = finalStats.unlockedAchievements || [];
      const newlyUnlocked = ACHIEVEMENTS
        .filter(a => !unlocked.includes(a.id) && a.requirement(finalStats))
        .map(a => a.id);

      if (newlyUnlocked.length > 0) {
        finalStats.unlockedAchievements = [...unlocked, ...newlyUnlocked];
        
        // Show toasts for newly unlocked achievements
        soundManager.play('unlock');
        newlyUnlocked.forEach(id => {
          const achievement = ACHIEVEMENTS.find(a => a.id === id);
          if (achievement) {
            addToast(t.newAchievement, achievement.title, <Trophy className="text-amber-500" />);
          }
        });
      }
      return finalStats;
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
      <header className="sticky top-0 z-40 p-3 md:p-4 px-4 md:px-8 flex justify-between items-center max-w-full mx-auto bg-surface/70 backdrop-blur-xl border-b border-white/10 transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('profile')}
            className="group relative"
          >
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-transparent shadow-xl transition-all group-hover:ring-primary group-hover:shadow-primary/20">
              <img src={state.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-surface rounded-full"></div>
          </motion.button>
          
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-black tracking-tight leading-none bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t.title}
            </h1>
            
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                <Award size={10} className="text-primary" />
                <span className="text-[9px] font-black uppercase tracking-wider text-primary">{t.level} {state.stats.level}</span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Coins size={10} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                  {state.stats.balance}
                </span>
              </div>
              
              {/* Level Progress Bar in Header */}
              <div className="w-24 md:w-32 h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden hidden xs:block">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(state.stats.totalPoints % 1000) / 10}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1.5 md:gap-2">
             <Tooltip content={t.switchLanguage} position="bottom">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLanguage}
                className="h-9 w-9 md:h-10 md:w-10 glass border-theme rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center text-[10px] font-black uppercase"
              >
                <Languages size={16} className="text-muted md:w-[18px] md:h-[18px]" />
              </motion.button>
            </Tooltip>

            <Tooltip content={t.switchTheme} position="bottom">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDark(!isDark)}
                className="w-9 h-9 md:w-10 md:h-10 glass border-theme rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center"
              >
                {isDark ? <Sun size={16} className="text-amber-400 md:w-[18px] md:h-[18px]" /> : <Moon size={16} className="text-indigo-600 md:w-[18px] md:h-[18px]" />}
              </motion.button>
            </Tooltip>
          </div>
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
                    <div key={d} id={`quiz-mode-${d}`}>
                      <Tooltip content={`${t.startQuiz} (${t[d]})`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setQuizDifficulty(d)}
                          className={`math-card text-left flex flex-col gap-4 border-2 transition-colors h-full ${
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
                      </Tooltip>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'leaderboard' && (
                <Leaderboard 
                  highScores={state.stats.highScores} 
                  userName={state.user.name}
                  language={state.user.language} 
                />
              )}
              {activeTab === 'store' && (
                <Store 
                  unlockedThemes={state.stats.unlockedThemes} 
                  balance={state.stats.balance} 
                  currentTheme={state.user.currentTheme}
                  onUnlock={(themeId) => {
                    const theme = THEMES.find(t => t.id === themeId);
                    if (!theme) return;
                    
                    if (state.stats.balance >= theme.cost) {
                      soundManager.play('unlock');
                      handleUpdateState({
                        stats: { 
                          ...state.stats, 
                          balance: state.stats.balance - theme.cost,
                          unlockedThemes: [...state.stats.unlockedThemes, themeId]
                        }
                      });
                    }
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
      <nav id="main-nav" className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-20 md:flex-col glass border-t md:border-t-0 md:border-r border-theme flex items-center justify-around md:justify-center gap-2 p-3 z-50 transition-all duration-500">
        <NavButton id="nav-dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label={t.dashboard} tooltip={t.viewDashboard} />
        <NavButton id="nav-quiz" active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<Gamepad2 />} label={t.startQuiz} tooltip={t.startQuiz} />
        <NavButton id="nav-leaderboard" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Trophy />} label={t.leaderboard} tooltip={t.viewLeaderboard} />
        <NavButton id="nav-store" active={activeTab === 'store'} onClick={() => setActiveTab('store')} icon={<ShoppingBag />} label={t.store} tooltip={t.viewStore} />
        <NavButton id="nav-profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon />} label={t.profile} tooltip={t.viewProfile} />
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

      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="pointer-events-auto bg-surface/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[280px] max-w-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                {toast.icon || <Trophy className="text-amber-500" size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/50 mb-0.5">{toast.title}</h4>
                <p className="font-bold text-sm truncate">{toast.subtitle}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-muted"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavButton({ id, active, onClick, icon, label, tooltip }: { id?: string, active: boolean, onClick: () => void, icon: React.ReactNode, label: string, tooltip: string }) {
  return (
    <Tooltip content={tooltip} position="right">
      <button 
        id={id}
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl transition-all ${
          active 
            ? 'bg-primary text-white shadow-lg shadow-primary/30 font-bold' 
            : 'text-muted hover:bg-primary/10'
        }`}
      >
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </button>
    </Tooltip>
  );
}
