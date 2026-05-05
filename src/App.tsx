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
  X,
  Brain,
  Zap,
  Flame,
  ArrowRight
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
import Logo from './components/Logo';
import QuotaModal from './components/QuotaModal';

export default function App() {
  const [state, setState] = useState<AppState>(storage.load());
  const [activeTab, setActiveTab] = useState<'quiz' | 'dashboard' | 'leaderboard' | 'store' | 'profile'>('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState<Difficulty | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[] | null>(null);
  const [toasts, setToasts] = useState<{ id: string; title: string; subtitle: string; icon?: React.ReactNode }[]>([]);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const t = translations[state.user.language];
  const currentTheme = useMemo(() => {
    return THEMES.find(t => t.id === state.user.currentTheme) || THEMES[0];
  }, [state.user.currentTheme]);

  useEffect(() => {
    soundManager.setEnabled(state.user.soundsEnabled);
  }, [state.user.soundsEnabled]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    let themeColors;
    
    if (state.user.currentTheme === 'custom' && state.user.customTheme) {
      themeColors = {
        primary: state.user.customTheme.primary,
        secondary: state.user.customTheme.secondary,
        bg: isDark ? '#0f172a' : '#f8fafc',
        text: isDark ? '#f1f5f9' : '#0f172a',
        surface: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
        border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      };
    } else {
      themeColors = isDark && (currentTheme as any).darkColors 
        ? (currentTheme as any).darkColors 
        : currentTheme.colors;
    }

    root.style.setProperty('--primary', themeColors.primary);
    root.style.setProperty('--secondary', themeColors.secondary);
    root.style.setProperty('--bg', themeColors.bg);
    root.style.setProperty('--text', themeColors.text);
    root.style.setProperty('--text-muted', (themeColors as any).textMuted || themeColors.text);
    root.style.setProperty('--border', (themeColors as any).border || 'rgba(0,0,0,0.1)');
    root.style.setProperty('--surface', (themeColors as any).surface || 'rgba(255,255,255,0.8)');
  }, [currentTheme, isDark, state.user.currentTheme, state.user.customTheme]);

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
            unlockedAchievements: [...unlocked, ...newlyUnlocked],
            achievementUnlocks: {
              ...(updated.stats.achievementUnlocks || {}),
              ...newlyUnlocked.reduce((acc, id) => ({ ...acc, [id]: new Date().toISOString() }), {})
            }
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

  const calculateRank = (score: number, difficulty: Difficulty, rivals: any[], type: 'high' | 'lifetime' = 'lifetime') => {
    const allScores = [...rivals.map(r => (type === 'lifetime' ? (r.lifetimeLevelScores?.[difficulty] || r.scores[difficulty]) : r.scores[difficulty]) || 0), score];
    allScores.sort((a, b) => b - a);
    return allScores.indexOf(score) + 1;
  };

  const handleQuizComplete = (points: number, correct: number, diff: Difficulty, missed: Question[], sessionStreak: number) => {
    const oldLifetimeScore = (state.stats.lifetimeLevelScores?.[diff] || state.stats.highScores[diff]) || 0;
    const oldRank = calculateRank(oldLifetimeScore, diff, state.stats.rivals || [], 'lifetime');

    storage.updateStats(stats => {
      const newTotalPoints = stats.totalPoints + points;
      const newBalance = (stats.balance || 0) + points;
      const newHighScores = { ...stats.highScores };
      const newLifetimeLevelScores = { ...(stats.lifetimeLevelScores || stats.highScores) };
      
      const isNewHighScore = points > (newHighScores[diff] || 0);
      if (isNewHighScore) newHighScores[diff] = points;
      
      newLifetimeLevelScores[diff] = (newLifetimeLevelScores[diff] || 0) + points;
      
      const newLevel = Math.floor(newTotalPoints / 1000) + 1;
      if (newLevel > stats.level) {
        soundManager.play('levelUp');
        addToast(t.levelUp || "Level Up!", `${t.level} ${newLevel}`, <Award className="text-primary" />);
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
        lifetimeLevelScores: newLifetimeLevelScores,
        level: newLevel,
        bestStreak: newBestStreak,
        missedQuestions: newMissed.slice(-50), // Keep last 50 only
        history: [newHistoryItem, ...(stats.history || [])].slice(0, 100)
      };

      // Rank check after score update based on lifetime score
      const newScore = newLifetimeLevelScores[diff];
      const newRank = calculateRank(newScore, diff, finalStats.rivals || [], 'lifetime');
      
      if (newRank < oldRank) {
        soundManager.play('unlock');
        addToast(
          state.user.language === 'en' ? "Rank Up!" : "র‍্যাঙ্ক উন্নতি!",
          state.user.language === 'en' 
            ? `You are now #${newRank} in ${diff} rankings!` 
            : `আপনি এখন ${diff} র‍্যাঙ্কে #${newRank} পজিশনে!`,
          <Trophy className="text-amber-500" />
        );
      }

      // Check achievements
      const unlocked = finalStats.unlockedAchievements || [];
      const newlyUnlocked = ACHIEVEMENTS
        .filter(a => !unlocked.includes(a.id) && a.requirement(finalStats))
        .map(a => a.id);

      if (newlyUnlocked.length > 0) {
        finalStats.unlockedAchievements = [...unlocked, ...newlyUnlocked];
        finalStats.achievementUnlocks = {
          ...(finalStats.achievementUnlocks || {}),
          ...newlyUnlocked.reduce((acc, id) => ({ ...acc, [id]: new Date().toISOString() }), {})
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

      // Dynamic Rival Progression: Rivals also "play" 
      if (finalStats.rivals) {
        finalStats.rivals = finalStats.rivals.map(rival => {
          // 40% chance a rival gains points when you do
          if (Math.random() > 0.6) {
            const newScores = { ...rival.scores };
            const newLifetimeLevelScores = { ...(rival.lifetimeLevelScores || rival.scores) };
            let addedPoints = 0;
            const levels: Difficulty[] = ['basic', 'normal', 'hard'];
            levels.forEach(lvl => {
              const gain = Math.floor(Math.random() * 100) + 50;
              newScores[lvl] += gain;
              newLifetimeLevelScores[lvl] = (newLifetimeLevelScores[lvl] || 0) + gain;
              addedPoints += gain;
            });
            return { 
              ...rival, 
              scores: newScores, 
              lifetimeLevelScores: newLifetimeLevelScores,
              totalPoints: (rival.totalPoints || 0) + addedPoints,
              trend: 'up' as const 
            };
          }
          return rival;
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
      <header className="sticky top-0 z-40 p-2 md:p-2.5 px-4 md:px-8 flex justify-between items-center max-w-full mx-auto bg-surface/70 backdrop-blur-xl border-b border-white/10 transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <motion.div 
            className="relative w-12 h-12 md:w-14 md:h-14 cursor-pointer group overflow-hidden rounded-2xl"
            onClick={() => setActiveTab('profile')}
          >
            <Logo className="w-full h-full relative z-10" size={32} />
            
            {/* Glass Shine Effect */}
            <motion.div
              animate={{ 
                left: ['-100%', '200%'],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 2,
                ease: "easeInOut"
              }}
              className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] z-20 pointer-events-none"
            />
          </motion.div>
          
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none flex items-center gap-1 select-none">
              <span className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]">Math</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 via-rose-500 to-indigo-500 bg-[length:200%_auto] animate-gradient-x">
                Mind
              </span>
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
              onQuotaExceeded={() => {
                setShowQuotaModal(true);
                setQuizDifficulty(null);
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 max-w-3xl mx-auto">
                  {(['basic', 'normal', 'hard'] as Difficulty[]).map((d) => (
                    <div key={d} id={`quiz-mode-${d}`} className="h-full">
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setQuizDifficulty(d)}
                        className="group relative w-full h-full text-left bg-surface/60 border border-theme/10 rounded-2xl p-4 transition-all duration-300 overflow-hidden shadow-sm flex flex-col"
                      >
                        {/* Subtle Gradient Background Animation Effect */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br bg-[length:400%_400%] ${
                          d === 'basic' ? 'from-emerald-400 via-transparent to-primary' : 
                          d === 'normal' ? 'from-amber-400 via-transparent to-primary' : 
                          'from-rose-400 via-transparent to-primary'
                        } animate-gradient-x`} />

                        <div className="flex items-start justify-between mb-3 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                              d === 'basic' ? 'bg-emerald-500/10 text-emerald-600' : 
                              d === 'normal' ? 'bg-amber-500/10 text-amber-600' : 
                              'bg-rose-500/10 text-rose-600'
                            }`}>
                              {d === 'basic' ? <Gamepad2 size={20} /> : 
                               d === 'normal' ? <Zap size={20} /> : 
                               <Flame size={20} />}
                            </div>
                            <h3 className="text-base font-black tracking-tight group-hover:text-primary transition-colors">{t[d]}</h3>
                          </div>
                          
                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-[9px] font-black uppercase tracking-wider opacity-40">
                              {state.user.language === 'en' ? 'BEST' : 'সেরা'}
                            </span>
                            <span className={`text-[11px] font-black ${
                              d === 'basic' ? 'text-emerald-600' : 
                              d === 'normal' ? 'text-amber-600' : 
                              'text-rose-600'
                            }`}>
                              {(state.stats.highScores[d] || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] font-medium opacity-60 leading-snug relative z-10">
                          {d === 'basic' ? 
                            (state.user.language === 'en' ? 'Core arithmetic: Addition, subtraction & simple multiplication.' : 'পাটিগণিতের মূল ভিত্তি: যোগ, বিয়োগ এবং সাধারণ নামতা ও গুণ।') : 
                           d === 'normal' ? 
                            (state.user.language === 'en' ? 'Algebra essentials: Percentages, factors & equation solving.' : 'বীজগণিতের ধারণা: শতকরা, উৎপাদক এবং সমীকরণ সমাধানের চর্চা।') : 
                            (state.user.language === 'en' ? 'Expert logic: Sequences, complex geometry & math puzzles.' : 'উন্নত যুক্তি: সংখ্যাতত্ত্বের অনুক্রম, জ্যামিতি এবং গাণিতিক ধাঁধা।')}
                        </p>

                        <div className="mt-3 flex items-center justify-end gap-1 text-[10px] font-black uppercase text-primary/70 group-hover:text-primary transition-colors relative z-10">
                          {state.user.language === 'en' ? 'Play' : 'শুরু'}
                          <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'leaderboard' && (
                <Leaderboard 
                  userName={state.user.name}
                  userAvatar={state.user.avatar}
                  rivals={state.stats.rivals || []}
                  language={state.user.language} 
                  highScores={state.stats.highScores}
                  totalPoints={state.stats.totalPoints}
                  lifetimeLevelScores={state.stats.lifetimeLevelScores || state.stats.highScores}
                />
              )}
              {activeTab === 'store' && (
                <Store 
                  user={state.user}
                  unlockedThemes={state.stats.unlockedThemes} 
                  balance={state.stats.balance} 
                  currentTheme={state.user.currentTheme}
                  onUnlock={(themeId) => {
                    const theme = THEMES.find(t => t.id === themeId);
                    const isCustom = themeId === 'custom';
                    const cost = isCustom ? 40000 : (theme?.cost || 0);
                    
                    if (state.stats.balance >= cost) {
                      soundManager.play('unlock');
                      handleUpdateState({
                        stats: { 
                          ...state.stats, 
                          balance: state.stats.balance - cost,
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
                  onUpdateUser={(u) => handleUpdateState({ user: u })}
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
                  onStartTutorial={() => setShowTutorial(true)}
                  language={state.user.language}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Sidebar (Desktop) / Bottom Bar (Mobile) */}
      <nav id="main-nav" className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-20 md:flex-col glass border-t md:border-t-0 md:border-r border-theme/20 flex items-center justify-around md:justify-center gap-4 p-1.5 md:p-3 z-50 transition-all duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-[10px_0_40px_rgba(0,0,0,0.05)]">
        <NavButton id="nav-dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label={t.navDashboard} tooltip={t.navDashboard} />
        <NavButton id="nav-leaderboard" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Trophy />} label={t.navLeaderboard} tooltip={t.navLeaderboard} />
        <NavButton id="nav-quiz" active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<Gamepad2 />} label={t.navQuiz} tooltip={t.navQuiz} />
        <NavButton id="nav-store" active={activeTab === 'store'} onClick={() => setActiveTab('store')} icon={<ShoppingBag />} label={t.navStore} tooltip={t.navStore} />
        <NavButton id="nav-profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon />} label={t.navProfile} tooltip={t.navProfile} />
      </nav>

      <AnimatePresence>
        {(state.isFirstTime || showTutorial) && (
          <Tutorial 
            onComplete={() => {
              if (state.isFirstTime) {
                storage.completeTutorial();
                setState(s => ({ ...s, isFirstTime: false }));
              }
              setShowTutorial(false);
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

      <QuotaModal 
        isOpen={showQuotaModal} 
        onClose={() => setShowQuotaModal(false)}
        onUseOffline={() => {
          setShowQuotaModal(false);
          // Just start quiz with difficulty 'normal' as fallback if needed, 
          // or user can just select a mode again which will now likely hit algorithmic path
          setQuizDifficulty('normal');
        }}
        language={state.user.language}
      />
    </div>
  );
}

function NavButton({ id, active, onClick, icon, label, tooltip }: { id?: string, active: boolean, onClick: () => void, icon: React.ReactNode, label: string, tooltip: string }) {
  return (
    <Tooltip content={tooltip} position="right">
      <motion.button 
        id={id}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl transition-all group ${
          active ? 'text-white' : 'text-muted hover:text-primary transition-colors'
        }`}
      >
        <AnimatePresence>
          {active && (
            <motion.div
              layoutId="navPill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/30"
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            />
          )}
        </AnimatePresence>
        
        <div className="relative z-10 flex flex-col items-center">
          {React.cloneElement(icon as React.ReactElement, { 
            size: 20, 
            strokeWidth: active ? 2.5 : 2,
            className: "transition-transform duration-300 group-hover:scale-110"
          })}
        </div>
      </motion.button>
    </Tooltip>
  );
}
