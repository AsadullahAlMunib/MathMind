/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
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
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Welcome Banner */}
      <section className="math-card bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 text-white overflow-hidden relative border-none shadow-2xl shadow-indigo-500/30 p-8 md:p-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-md"
              >
                {language === 'en' ? `Hello, ${user.name}!` : `হ্যালো, ${user.name}!`}
              </motion.h2>
              <p className="text-white/80 max-w-md font-medium leading-relaxed text-lg">
                {language === 'en' 
                  ? "Ready to exercise your brain today?"
                  : "আজ আপনার মস্তিষ্ককে ব্যায়াম করতে প্রস্তুত?"}
              </p>
            </div>

            <div className="space-y-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 inline-block w-full max-w-sm">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white">
                <span className="flex items-center gap-1.5">
                  <Award size={14} className="text-amber-400" /> {t.level} {stats.level}
                </span>
                <span className="text-white/70">{pointsToNextLevel} {language === 'en' ? 'PTS TO NEXT' : 'পয়েন্ট লেভেল আপ'}</span>
              </div>
              <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <AppTooltip content={t.startQuiz}>
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartQuiz('basic')}
                  className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black hover:shadow-2xl transition-all flex items-center gap-3 group shadow-lg shadow-indigo-900/20"
                >
                  <BrainCircuit size={22} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-lg">{t.startQuiz}</span>
                </motion.button>
              </AppTooltip>
              
              {hasMissed && (
                <AppTooltip content={language === 'en' ? 'Review questions you missed' : 'ভুল করা প্রশ্নগুলো আবার দেখুন'}>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onStartReview}
                    className="bg-white/15 backdrop-blur-xl border border-white/30 text-white px-8 py-4 rounded-2xl font-black hover:bg-white/20 transition-all flex items-center gap-3 group shadow-xl"
                  >
                    <BookOpen size={22} className="group-hover:scale-110 transition-transform" />
                    <span className="text-lg">{language === 'en' ? 'Review Mode' : 'রিভিউ মোড'}</span>
                    <span className="bg-rose-500 text-xs px-2.5 py-1 rounded-full ring-4 ring-rose-500/20 font-black">
                      {stats.missedQuestions?.length}
                    </span>
                  </motion.button>
                </AppTooltip>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
             <motion.div 
               animate={{ 
                 rotate: [0, 5, -5, 0],
                 y: [0, -10, 0]
               }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="w-56 h-56 bg-white/10 rounded-[3rem] flex items-center justify-center backdrop-blur-3xl ring-1 ring-white/30 relative"
             >
               <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-[3rem]"></div>
               <div className="relative">
                 <Flame size={100} className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
                 {stats.bestStreak > 0 && (
                   <motion.div 
                     animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                     transition={{ duration: 3, repeat: Infinity }}
                     className="absolute inset-0 bg-amber-400 rounded-full blur-3xl -z-10"
                   />
                 )}
               </div>
             </motion.div>
          </div>
        </div>
        
        {/* Abstract background decorations */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-400/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.1"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </section>

      {/* Review Banner for specific attention if missed many */}
      {hasMissed && stats.missedQuestions!.length >= 5 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="math-card glass border-rose-500/20 p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem icon={<TrendingUp />} label={t.points} value={stats.totalPoints} color="text-amber-500" />
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
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="math-card glass border-emerald-500/20 p-6 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted uppercase">{language === 'en' ? 'Basic Best' : 'বেসিক সেরা'}</p>
            <p className="text-2xl font-black">{stats.highScores.basic} pts</p>
          </div>
        </div>
        <div className="math-card glass border-amber-500/20 p-6 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Medal size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted uppercase">{language === 'en' ? 'Normal Best' : 'সাধারণ সেরা'}</p>
            <p className="text-2xl font-black">{stats.highScores.normal} pts</p>
          </div>
        </div>
        <div className="math-card glass border-rose-500/20 p-6 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted uppercase">{language === 'en' ? 'Hard Best' : 'হার্ড সেরা'}</p>
            <p className="text-2xl font-black">{stats.highScores.hard} pts</p>
          </div>
        </div>
      </section>

      {/* Activity Graph and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contribution Graph */}
        <div className="math-card md:col-span-2 space-y-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              {t.activity}
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold opacity-40 uppercase tracking-tighter">
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
        <div className="math-card flex flex-col">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-primary" />
            Performance
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
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="math-card p-4 shadow-sm hover:shadow-xl transition-all text-center flex flex-col items-center justify-center relative overflow-hidden"
      >
      <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-opacity-10 flex items-center justify-center relative z-10 ${color.replace('text', 'bg')}`}>
        <div className="relative">
          {React.cloneElement(icon as React.ReactElement, { size: 24, className: color })}
          {isStreak && (
            <motion.div 
              animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`absolute inset-0 rounded-full blur-md ${color.replace('text', 'bg')}`}
            />
          )}
        </div>
      </div>
      <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1 relative z-10">{label}</p>
      <p className="text-2xl font-black tracking-tight relative z-10">{value}</p>
      
      {progress !== undefined && (
        <div className="w-full mt-3 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative z-10">
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

