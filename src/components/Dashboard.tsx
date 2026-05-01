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
      <section className="math-card bg-primary text-white overflow-hidden relative border-none shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {language === 'en' ? `Hello, ${user.name}!` : `হ্যালো, ${user.name}!`}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/60">
                <span>{t.level} {stats.level}</span>
                <span>{pointsToNextLevel} {language === 'en' ? 'PTS TO NEXT LEVEL' : 'পয়েন্ট লেভেল আপ'}</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              </div>
            </div>
            <p className="text-white/80 max-w-md pt-2">
              {language === 'en' 
                ? "Ready to exercise your brain today? Keep your streak going and climb the leaderboard!"
                : "আজ আপনার মস্তিষ্ককে ব্যায়াম করতে প্রস্তুত? আপনার ধারাবাহিকতা বজায় রাখুন এবং লিডারবোর্ডে এগিয়ে যান!"}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => onStartQuiz('basic')}
                className="bg-white text-primary px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center gap-2 group"
              >
                <BrainCircuit size={20} className="group-hover:rotate-12 transition-transform" />
                {t.startQuiz}
              </button>
              
              {hasMissed && (
                <button 
                  onClick={onStartReview}
                  className="bg-primary-dark/40 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2 group"
                >
                  <BookOpen size={20} className="group-hover:scale-110 transition-transform" />
                  {language === 'en' ? 'Review Mode' : 'রিভিউ মোড'}
                  <span className="bg-rose-500 text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                    {stats.missedQuestions?.length}
                  </span>
                </button>
              )}
            </div>
          </div>
          <div className="hidden md:block">
             <motion.div 
               animate={{ 
                 rotate: [0, 10, -10, 0],
                 scale: [1, 1.1, 1]
               }}
               transition={{ duration: 4, repeat: Infinity }}
               className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-2xl ring-1 ring-white/20"
             >
               <div className="relative">
                 <Flame size={80} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                 {stats.bestStreak > 0 && (
                   <motion.div 
                     animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-white rounded-full blur-xl"
                   />
                 )}
               </div>
             </motion.div>
          </div>
        </div>
        {/* Background shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-secondary/30 rounded-full blur-3xl"></div>
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
          <button 
            onClick={onStartReview}
            className="w-full md:w-auto bg-rose-500 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-2 group"
          >
            {language === 'en' ? 'Master These Questions' : 'এই প্রশ্নগুলো আয়ত্ত করুন'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
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
  );
}

