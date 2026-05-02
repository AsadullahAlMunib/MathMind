/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Flame, 
  ArrowRight,
  BrainCircuit,
  BookOpen,
  Trophy,
  Medal,
  Award,
  Coins
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import AppTooltip from './Tooltip';
import { format, subDays, isSameDay } from 'date-fns';

import { UserStats, UserProfile, Difficulty } from '../lib/types';
import { translations } from '../lib/translations';

interface DashboardProps {
  stats: UserStats;
  user: UserProfile;
  language: 'en' | 'bn';
  onStartQuiz: (d: Difficulty) => void;
  onStartReview: () => void;
}

export default function Dashboard({ stats, user, language, onStartQuiz, onStartReview }: DashboardProps) {
  const [activeAnalysis, setActiveAnalysis] = useState<'accuracy' | 'mastery'>('accuracy');
  const t = translations[language];

  // Level progress calculation (based on 1000 points per level)
  const levelProgress = (stats.totalPoints % 1000) / 10; // Result is percentage (0-100)
  const pointsToNextLevel = 1000 - (stats.totalPoints % 1000);
  const hasMissed = stats.missedQuestions && stats.missedQuestions.length > 0;

  // Prepare activity data (last 50 days)
  const activityData = Array.from({ length: 50 }, (_, i) => {
    const date = subDays(new Date(), 49 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = stats.activity.find(a => a.date === dateStr);
    return {
      date: dateStr,
      count: entry ? entry.count : 0,
      label: format(date, 'MMM d')
    };
  });

  const getCellColor = (count: number) => {
    if (count === 0) return 'rgba(0,0,0,0.05)';
    if (count < 2) return 'var(--primary)';
    if (count < 5) return 'var(--primary)';
    return 'var(--secondary)';
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      {/* Welcome Banner */}
      <section className="math-card bg-slate-950 text-white overflow-hidden relative border-none shadow-xl p-4 md:p-6 group/card">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 opacity-90 transition-opacity group-hover/card:opacity-100"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.15),transparent)]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-4xl font-black tracking-tight drop-shadow-lg text-white"
              >
                {language === 'en' ? `Hello, ${user.name}!` : `হ্যালো, ${user.name}!`}
              </motion.h2>
              <p className="text-white/80 max-w-sm font-medium leading-tight text-sm md:text-base">
                {language === 'en' 
                  ? "Ready to exercise your brain today?"
                  : "আজ আপনার মস্তিষ্ককে ব্যায়াম করতে প্রস্তুত?"}
              </p>
            </div>

            <div className="space-y-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 inline-block w-full max-w-xs shadow-lg shadow-black/5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white">
                <span className="flex items-center gap-1">
                  <Award size={12} className="text-amber-300" /> {t.level} {stats.level}
                </span>
                <span className="text-white/70">{pointsToNextLevel} {language === 'en' ? 'PTS TO NEXT' : 'পয়েন্ট লেভেল আপ'}</span>
              </div>
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5">
              <AppTooltip content={t.startQuiz}>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onStartQuiz('basic')}
                  className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <BrainCircuit size={18} className="group-hover:rotate-12 transition-transform relative z-10" />
                  <span className="relative z-10">{t.startQuiz}</span>
                </motion.button>
              </AppTooltip>
              
              {hasMissed && (
                <AppTooltip content={language === 'en' ? 'Review questions you missed' : 'ভুল করা প্রশ্নগুলো আবার দেখুন'}>
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2, backgroundColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStartReview}
                    className="bg-white/10 backdrop-blur-xl border border-white/30 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 group"
                  >
                    <BookOpen size={18} className="group-hover:scale-110 transition-transform" />
                    <span>{language === 'en' ? 'Review' : 'রিভিউ'}</span>
                  </motion.button>
                </AppTooltip>
              )}
            </div>
          </div>

          <div className="hidden md:block relative">
             <motion.div 
               animate={{ 
                 rotate: [0, 3, -3, 0],
                 y: [0, -10, 0]
               }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="w-40 h-40 bg-white/10 rounded-[2.5rem] flex items-center justify-center backdrop-blur-3xl ring-2 ring-white/30 relative shadow-2xl"
             >
               <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-[2.5rem]"></div>
               <div className="relative">
                 <Flame size={70} className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]" />
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                   transition={{ duration: 3, repeat: Infinity }}
                   className="absolute inset-0 bg-amber-400 rounded-full blur-2xl -z-10"
                 />
               </div>
             </motion.div>
          </div>
        </div>
        
        {/* Floating symbols */}
        <motion.div 
          animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -right-4 w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center ring-1 ring-white/30"
        >
          <span className="text-2xl font-black">+</span>
        </motion.div>
        <motion.div 
          animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center ring-1 ring-white/30"
        >
          <span className="text-2xl font-black">÷</span>
        </motion.div>
        
        {/* Abstract background decorations */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[30rem] h-[30rem] bg-indigo-400 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-pink-400 rounded-full blur-[120px]"
        />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid-vibrant" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.2"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid-vibrant)" />
          </svg>
        </div>
      </section>

      {/* Review Banner for specific attention if missed many */}
      {hasMissed && stats.missedQuestions!.length >= 5 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="math-card glass border-rose-500/20 p-5 flex flex-col md:flex-row items-center gap-5 relative overflow-hidden"
        >
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
            <Zap size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
             <h4 className="text-xl font-bold">
               {language === 'en' ? 'Challenge Yourself!' : 'নিজেকে চ্যালেঞ্জ দিন!'}
             </h4>
             <p className="text-muted text-sm">
               {language === 'en' 
                 ? `You have ${stats.missedQuestions?.length} questions to review. Practice them to master these concepts!`
                 : `আপনার কাছে ${stats.missedQuestions?.length}টি প্রশ্ন রিভিউ করার জন্য আছে। এগুলো প্র্যাকটিস করুন আপনার দক্ষতা বাড়াতে!`}
             </p>
          </div>
          <AppTooltip content={language === 'en' ? 'Review missed questions now' : 'এখনই ভুল করা প্রশ্নগুলো রিভিউ করুন'}>
            <button 
              onClick={onStartReview}
              className="w-full md:w-auto bg-rose-500 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              {language === 'en' ? 'Master These Questions' : 'এই প্রশ্নগুলো আয়ত্ত করুন'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </AppTooltip>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatItem icon={<Coins />} label={t.balance} value={stats.balance} color="text-amber-500" />
        <StatItem icon={<Target />} label={t.level} value={stats.level} color="text-emerald-500" progress={levelProgress} />
        <StatItem icon={<Zap />} label={t.totalQuizzes} value={stats.totalQuizzes} color="text-indigo-500" />
        <StatItem 
          icon={<Flame />} 
          label={t.streak} 
          value={stats.bestStreak} 
          color="text-rose-500" 
          isStreak={stats.bestStreak > 0}
        />
      </div>

      {/* Performance Section Highlights */}
      <section className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="math-card glass border-emerald-500/20 p-2.5 md:p-4 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 group">
          <div className="w-7 h-7 md:w-9 md:h-9 bg-emerald-500 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Trophy size={14} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[7px] md:text-[9px] font-black text-muted uppercase leading-none mb-1">{language === 'en' ? 'Basic' : 'বেসিক'}</p>
            <p className="text-xs md:text-lg font-black truncate">{stats.highScores.basic}</p>
          </div>
        </div>
        <div className="math-card glass border-amber-500/20 p-2.5 md:p-4 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 group">
          <div className="w-7 h-7 md:w-9 md:h-9 bg-amber-500 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Medal size={14} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[7px] md:text-[9px] font-black text-muted uppercase leading-none mb-1">{language === 'en' ? 'Normal' : 'সাধারণ'}</p>
            <p className="text-xs md:text-lg font-black truncate">{stats.highScores.normal}</p>
          </div>
        </div>
        <div className="math-card glass border-rose-500/20 p-2.5 md:p-4 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 group">
          <div className="w-7 h-7 md:w-9 md:h-9 bg-rose-500 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Award size={14} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[7px] md:text-[9px] font-black text-muted uppercase leading-none mb-1">{language === 'en' ? 'Hard' : 'হার্ড'}</p>
            <p className="text-xs md:text-lg font-black truncate">{stats.highScores.hard}</p>
          </div>
        </div>
      </section>
      
      {/* Quiz Analytics Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black flex items-center gap-2">
            <TrendingUp size={22} className="text-primary" />
            {language === 'en' ? 'Quiz Analytics' : 'কুইজ বিশ্লেষণ'}
          </h3>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {language === 'en' ? 'Live Progress' : 'লাইভ প্রগ্রেস'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Combined Analytics Card */}
          <div className="math-card glass p-4 min-h-[300px] flex flex-col group hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 z-20">
               <AppTooltip content={activeAnalysis === 'accuracy' ? (language === 'en' ? 'Switch to Mastery' : 'দক্ষতা দেখুন') : (language === 'en' ? 'Switch to Accuracy' : 'সঠিকতা দেখুন')}>
                 <motion.button
                   whileHover={{ scale: 1.1, rotate: 90 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={() => setActiveAnalysis(activeAnalysis === 'accuracy' ? 'mastery' : 'accuracy')}
                   className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary/20 transition-all border border-primary/20"
                 >
                   {activeAnalysis === 'accuracy' ? <BrainCircuit size={18} /> : <Target size={18} />}
                 </motion.button>
               </AppTooltip>
            </div>

            <div className="flex items-center justify-between mb-4 pr-12">
              <div>
                <h4 className="font-black text-sm">
                  {activeAnalysis === 'accuracy' 
                    ? (language === 'en' ? 'Accuracy Overview' : 'নির্ভুলতার চিত্র')
                    : (language === 'en' ? 'Mastery Profile' : 'দক্ষতার প্রোফাইল')
                  }
                </h4>
                <p className="text-[9px] text-muted font-bold tracking-tight">
                  {activeAnalysis === 'accuracy'
                    ? (language === 'en' ? `${stats.totalQuizzes} Quizzes Completed` : `${stats.totalQuizzes}টি কুইজ সম্পন্ন`)
                    : (language === 'en' ? 'High scores by difficulty' : 'কঠিন্য অনুযায়ী সর্বোচ্চ স্কোর')
                  }
                </p>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                {activeAnalysis === 'accuracy' ? (
                  <motion.div 
                    key="accuracy"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full h-full relative"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: language === 'en' ? 'Correct' : 'সঠিক', value: stats.correctAnswers },
                            { name: language === 'en' ? 'Incorrect' : 'ভুল', value: Math.max(0, (stats.totalQuizzes * 10) - stats.correctAnswers) }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={6}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" opacity={0.2} />
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="flex flex-col items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full w-20 h-20 md:w-28 md:h-28 justify-center shadow-inner border border-theme">
                        <span className="text-xl md:text-3xl font-black text-emerald-500 leading-none">
                          {stats.totalQuizzes > 0 ? Math.round((stats.correctAnswers / (stats.totalQuizzes * 10)) * 100) : 0}%
                        </span>
                        <span className="text-[8px] md:text-[10px] uppercase font-black opacity-40">{language === 'en' ? 'Accuracy' : 'সঠিকতা'}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mastery"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: t.basic, A: stats.highScores.basic, fullMark: 1000 },
                        { subject: t.normal, A: stats.highScores.normal, fullMark: 2500 },
                        { subject: t.hard, A: stats.highScores.hard, fullMark: 5000 },
                      ]}>
                        <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeights: 'bold', fill: 'currentColor', opacity: 0.6 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} hide />
                        <Radar
                          name={user.name}
                          dataKey="A"
                          stroke="var(--primary)"
                          fill="var(--primary)"
                          fillOpacity={0.3}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Global Summary Card - Redesigned for Premium Feel */}
      <section className="relative overflow-hidden group rounded-[2rem] border border-white/10 shadow-2xl bg-slate-950 text-white p-6 md:p-8">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/20 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary-rgb),0.15),transparent)]"></div>
        <div className="absolute top-0 right-0 p-8 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp size={200} className="rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Main Point Display */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 w-fit backdrop-blur-md">
              <Trophy size={14} className="text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{t.lifetimePoints}</span>
            </div>
            <div className="flex flex-col items-center md:items-start group/score">
              <div className="flex items-baseline gap-3">
                <span className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent drop-shadow-2xl">
                  {stats.totalPoints.toLocaleString()}
                </span>
                <span className="text-xs md:text-sm font-black text-primary tracking-widest uppercase opacity-80 mb-2 md:mb-4">pts</span>
              </div>
              <p className="text-[10px] md:text-xs font-medium text-white/40 tracking-wider">
                {language === 'en' ? 'RANK: MASTER MIND' : 'র‍্যাঙ্ক: মাস্টার মাইন্ড'}
              </p>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-2 gap-8 md:gap-12 flex-1 w-full max-w-sm">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest opacity-60">{language === 'en' ? 'Accurate Answer' : 'সঠিক উত্তর'}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400 leading-none">{stats.correctAnswers}</span>
                  <span className="text-[10px] font-bold text-emerald-400/40">{Math.round((stats.correctAnswers / (Math.max(1, stats.totalQuizzes) * 10)) * 100)}%</span>
                </div>
              </div>
              <div className="h-1 w-full bg-emerald-400/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((stats.correctAnswers / (Math.max(1, stats.totalQuizzes) * 10)) * 100)}%` }}
                  className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest opacity-60">{language === 'en' ? 'Total Quizzes' : 'মোট কুইজ'}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-rose-400 leading-none">{stats.totalQuizzes}</span>
                  <span className="text-[10px] font-bold text-rose-400/40">COMPLETED</span>
                </div>
              </div>
              <div className="h-1 w-full bg-rose-400/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating background decorations */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>
      </section>

      {/* Activity Graph and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Contribution Graph */}
        <div className="math-card md:col-span-2 space-y-3 relative overflow-hidden group p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              {t.activity}
            </h3>
            <div className="flex items-center gap-4 text-[8px] font-bold opacity-30 uppercase tracking-tighter">
              <span>Last 12 Weeks</span>
            </div>
          </div>
          
          <div className="relative z-10 overflow-x-auto pb-2 scrollbar-hide">
            <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-max">
              {activityData.map((day, idx) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.005 }}
                  style={{ backgroundColor: getCellColor(day.count) }}
                  className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-[2px] transition-all hover:scale-125 cursor-pointer hover:ring-2 ring-primary/40 group relative"
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-75 group-hover:scale-100 origin-bottom whitespace-nowrap z-50 shadow-2xl border border-white/10">
                    <span className="font-bold">{day.count > 0 ? `${day.count} Quizzes` : 'No Activity'}</span>
                    <span className="opacity-50 ml-1">on {day.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-[10px] opacity-40 font-bold relative z-10">
            <div className="flex gap-4">
               <span>Mon</span>
               <span>Wed</span>
               <span>Fri</span>
            </div>
            <div className="flex items-center gap-1.5 uppercase tracking-widest">
              <span>Less</span>
              <div className="w-3 h-3 bg-black/5 dark:bg-white/5 rounded-[2px]"></div>
              <div className="w-3 h-3 bg-primary/30 rounded-[2px]"></div>
              <div className="w-3 h-3 bg-primary/60 rounded-[2px]"></div>
              <div className="w-3 h-3 bg-primary rounded-[2px]"></div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Accuracy Chart */}
        <div className="math-card flex flex-col p-4">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-amber-500" />
            {language === 'en' ? 'Personal Bests' : 'ব্যক্তিগত সেরা'}
          </h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: t.basic, value: stats.highScores.basic },
                { name: t.normal, value: stats.highScores.normal },
                { name: t.hard, value: stats.highScores.hard }
              ]}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'white' }}
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                  { [0, 1, 2].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-theme flex items-center justify-between text-sm">
            <span className="text-muted font-bold">{t.correctAnswers}</span>
            <span className="font-black text-lg">{stats.correctAnswers}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ 
  icon, 
  label, 
  value, 
  color, 
  progress, 
  isStreak 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string | number, 
  color: string,
  progress?: number,
  isStreak?: boolean
}) {
  return (
    <AppTooltip content={label}>
      <motion.div 
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="math-card p-3.5 shadow-sm hover:shadow-xl transition-all text-center flex flex-col items-center justify-center relative overflow-hidden"
      >
      <div className={`w-8 h-8 md:w-10 md:h-10 mx-auto mb-1.5 md:mb-2 rounded-lg md:rounded-xl bg-opacity-10 flex items-center justify-center relative z-10 ${color.replace('text', 'bg')}`}>
        <div className="relative">
          {React.cloneElement(icon as React.ReactElement, { size: 16, className: color })}
          {isStreak && (
            <motion.div 
              animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`absolute inset-0 rounded-full blur-md ${color.replace('text', 'bg')}`}
            />
          )}
        </div>
      </div>
      <p className="text-[8px] md:text-[10px] text-muted font-bold uppercase tracking-widest mb-0.5 md:mb-1 relative z-10">{label}</p>
      <p className="text-lg md:text-2xl font-black tracking-tight relative z-10">{value}</p>
      
      {progress !== undefined && (
        <div className="w-full mt-2 md:mt-3 h-0.5 md:h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative z-10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full ${color.replace('text', 'bg-current')}`}
          />
        </div>
      )}

      {/* Decorative background circle */}
      <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-5 ${color.replace('text', 'bg')}`}></div>
      </motion.div>
    </AppTooltip>
  );
}

