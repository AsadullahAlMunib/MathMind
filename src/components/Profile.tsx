/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  ExternalLink, 
  User as UserIcon,
  Calendar,
  Code2,
  Mail,
  Camera,
  BookOpen,
  Trophy,
  History,
  TrendingUp,
  BrainCircuit,
  Zap,
  Target,
  RefreshCcw,
  User,
  Flame,
  Coins,
  Palette,
  Crown,
  Lock,
  CheckCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';

import { UserStats, UserProfile, ACHIEVEMENTS } from '../lib/types';
import { translations } from '../lib/translations';
import { storage } from '../lib/storage';
import Tooltip from './Tooltip';
import Achievements from './Achievements';

interface ProfileProps {
  user: UserProfile;
  stats: UserStats;
  onUpdateUser: (user: UserProfile) => void;
  onClearReview: () => void;
  language: 'en' | 'bn';
}

export default function Profile({ user, stats, onUpdateUser, onClearReview, language }: ProfileProps) {
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const t = translations[language];

  const avatarStyles = [
    'avataaars', 
    'bottts', 
    'adventurer', 
    'pixel-art', 
    'lorelei', 
    'notionists', 
    'miniavs', 
    'big-smile',
    'croodles'
  ];

  const handleRandomAvatar = () => {
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    const randomSeed = Math.random().toString(36).substring(2, 10);
    onUpdateUser({ ...user, avatar: `https://api.dicebear.com/9.x/${randomStyle}/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9` });
  };

  const handleSetStyle = (style: string) => {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    onUpdateUser({ ...user, avatar: `https://api.dicebear.com/9.x/${style}/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9` });
  };

  // Prepare chart data from history
  const chartData = [...(stats.history || [])].reverse().map(item => ({
    score: item.score,
    date: new Date(item.date).toLocaleDateString()
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
      {/* User Info Section */}
      <section className="math-card glass p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-primary/10 ring-2 ring-primary ring-offset-4 ring-offset-transparent transition-transform group-hover:scale-105 duration-300">
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex flex-col gap-2">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRandomAvatar}
                className="p-2 bg-primary text-white rounded-full shadow-lg hover:shadow-primary/50 transition-all z-10"
                title={language === 'en' ? 'Randomize Look' : 'এলোমেলো রূপ'}
              >
                <RefreshCcw size={16} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsChangingAvatar(!isChangingAvatar)}
                className="p-2 bg-amber-500 text-white rounded-full shadow-lg hover:shadow-amber-500/50 transition-all z-10"
                title={language === 'en' ? 'Select Style' : 'স্টাইল নির্বাচন করুন'}
              >
                <Palette size={16} />
              </motion.button>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="space-y-0.5">
               <input 
                 type="text" 
                 value={user.name}
                 onChange={(e) => onUpdateUser({ ...user, name: e.target.value })}
                 className="text-2xl md:text-3xl font-black bg-transparent border-none focus:ring-2 ring-primary/20 rounded-lg outline-none w-full text-center md:text-left tracking-tight"
               />
               <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-1.5 md:gap-4 opacity-70 text-[11px] md:text-xs font-bold uppercase tracking-wide">
                  <p className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-primary" />
                    {language === 'en' ? 'Joined' : 'যোগদান'}: {new Date(user.joinedAt).toLocaleDateString()}
                  </p>
                  <div className="hidden md:block w-1 h-1 bg-current rounded-full opacity-30"></div>
                  <p className="flex items-center gap-1.5">
                    <BookOpen size={12} className="text-primary" />
                    {stats.missedQuestions?.length || 0} {language === 'en' ? 'Review Questions' : 'রিভিউ প্রশ্ন'}
                  </p>
               </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
               <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">
                 <span className="opacity-50">#</span> {t.level} {stats.level}
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                 <Coins size={11} className="shrink-0" /> {t.balance}: {stats.balance}
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                 <TrendingUp size={11} className="shrink-0" /> {t.lifetimePoints}: {stats.totalPoints}
               </div>
            </div>
          </div>
        </div>

        {/* Avatar Style Selector Grid */}
        <AnimatePresence>
          {isChangingAvatar && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-8 pt-6 border-t border-white/10 overflow-hidden"
            >
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 text-center md:text-left">Choose Your Aesthetic</h4>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
                {avatarStyles.map((style) => (
                  <motion.button
                    key={style}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSetStyle(style)}
                    className={`w-full aspect-square rounded-xl bg-white/5 border-2 transition-all p-1 flex items-center justify-center overflow-hidden h-12 md:h-14 ${
                      user.avatar.includes(style) ? 'border-primary bg-primary/5' : 'border-transparent hover:border-white/20'
                    }`}
                  >
                    <img 
                      src={`https://api.dicebear.com/9.x/${style}/svg?seed=preview`} 
                      alt={style} 
                      className="w-full h-full object-contain"
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Recent Activity Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 math-card glass p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
              <History size={14} />
              {language === 'en' ? 'Recent Quiz History' : 'সাম্প্রতিক কুইজ ইতিহাস'}
            </h3>
            <div className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-md">
              {language === 'en' ? 'Last 10' : 'শেষ ১০ টি'}
            </div>
          </div>

          <div className="space-y-3">
            {stats.history && stats.history.length > 0 ? (
              stats.history.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id} 
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                      item.difficulty === 'basic' ? 'bg-emerald-500' :
                      item.difficulty === 'normal' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}>
                      <Zap size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-black capitalize tracking-tight">{t[item.difficulty]}</p>
                      <p className="text-[9px] opacity-40 font-bold uppercase">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">+{item.score}</p>
                    <p className="text-[9px] font-bold opacity-40 uppercase">
                      {item.correctCount}/{item.totalQuestions} {language === 'en' ? 'Correct' : 'সঠিক'} • {Math.round((item.correctCount / item.totalQuestions) * 100)}%
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center opacity-30 italic text-sm">
                <History size={32} className="mb-2" />
                <p>{language === 'en' ? 'No recent activity found' : 'কোনো সাম্প্রতিক কাজ পাওয়া যায়নি'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="math-card glass p-6 flex flex-col space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
              <TrendingUp size={14} />
              {language === 'en' ? 'Performance' : 'পারফরম্যান্স'}
            </h3>
            <p className="text-[10px] font-bold opacity-40 leading-none">
              {language === 'en' ? 'Score progression' : 'স্কোরের অগ্রগতি'}
            </p>
          </div>

          <div className="flex-1 min-h-[150px] relative">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--primary)" 
                    strokeWidth={4} 
                    dot={{ fill: 'var(--primary)', r: 4 }} 
                    activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 transform -rotate-12">
                 <TrendingUp size={64} />
                 <p className="text-[10px] font-black uppercase tracking-widest mt-2">{language === 'en' ? 'Need more data' : 'আরো তথ্য প্রয়োজন'}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{language === 'en' ? 'Accuracy' : 'সঠিকতা'}</span>
                <span className="text-xs font-black text-emerald-500">
                  {stats.totalQuizzes > 0 ? Math.round((stats.correctAnswers / (stats.totalQuizzes * 10)) * 100) : 0}%
                </span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalQuizzes > 0 ? (stats.correctAnswers / (stats.totalQuizzes * 10)) * 100 : 0}%` }}
                  className="h-full bg-emerald-500"
                />
             </div>
          </div>
        </div>
      </section>

      <Achievements stats={stats} language={language} />

      {/* Help & Settings Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
          <BookOpen size={14} />
          {language === 'en' ? 'Help & Resources' : 'সাহায্য ও রিসোর্স'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => {
              storage.save({ ...storage.load(), isFirstTime: true });
              window.location.reload();
            }}
            className="math-card glass p-6 flex items-center gap-4 hover:bg-primary/5 transition-all duration-500 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
              <BookOpen size={24} />
            </div>
            <div className="text-left">
              <p className="font-black tracking-tight">{language === 'en' ? 'Restart Tutorial' : 'টিউটোরিয়াল পুনরায় চালু করুন'}</p>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{language === 'en' ? 'Learn the basics' : 'নিয়মাবলী শিখুন'}</p>
            </div>
          </button>

          <a 
            href="https://github.com/AsadullahAlMunib/MathMind" 
            target="_blank" 
            rel="noreferrer"
            className="math-card glass p-6 flex items-center gap-4 hover:bg-primary/5 transition-all duration-500 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Github size={24} />
            </div>
            <div className="text-left">
              <p className="font-black tracking-tight">{language === 'en' ? 'Documentation' : 'ডকুমেন্টেশন'}</p>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{language === 'en' ? 'View on GitHub' : 'গিটহাবে দেখুন'}</p>
            </div>
          </a>
        </div>
      </section>

      {/* Developer Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
             <Code2 size={14} />
             {language === 'en' ? 'Built By' : 'তৈরি করেছেন'}
           </h3>
        </div>
        
        <div className="math-card glass border-none overflow-hidden p-0 flex flex-col md:flex-row shadow-xl">
          <div className="p-6 md:p-8 flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4 bg-gradient-to-br from-indigo-500/[0.03] to-transparent">
             <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20"
             >
                <img src="https://avatars.githubusercontent.com/u/163411448" alt="Md Asadullah Al Munib" />
             </motion.div>
             <div className="space-y-1">
                <h4 className="text-xl font-black tracking-tight">Md Asadullah Al Munib</h4>
                <p className="text-xs font-bold opacity-50 uppercase tracking-widest">Lead Developer & Designer</p>
             </div>
             <div className="flex items-center gap-2">
                <Tooltip content="GitHub Profile">
                  <a 
                    href="https://github.com/AsadullahAlMunib" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-9 h-9 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Github size={18} />
                  </a>
                </Tooltip>
                <Tooltip content="Send Email">
                  <a 
                    href="mailto:asadullahweb1@gmail.com" 
                    className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Mail size={18} />
                  </a>
                </Tooltip>
                <a 
                  href="https://munib.rf.gd" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary px-4 py-2.5 bg-primary/5 hover:bg-primary/10 rounded-xl transition-all"
                >
                  Portfolio <ExternalLink size={12} />
                </a>
             </div>
          </div>
          
          <div className="p-6 md:p-8 flex-1 grid grid-cols-2 gap-3 bg-white/5 md:border-l border-white/10">
             <div className="p-3.5 rounded-xl bg-slate-500/5 border border-white/5">
                <p className="text-[9px] uppercase font-black opacity-30 mb-1">Version</p>
                <p className="text-xs font-black font-mono">1.0.0-PRO</p>
             </div>
             <div className="p-3.5 rounded-xl bg-slate-500/5 border border-white/5">
                <p className="text-[9px] uppercase font-black opacity-30 mb-1">Engine</p>
                <p className="text-xs font-black font-mono text-indigo-500">Vite + Gemini</p>
             </div>
             <div className="p-3.5 rounded-xl bg-slate-500/5 border border-white/5">
                <p className="text-[9px] uppercase font-black opacity-30 mb-1">Stack</p>
                <p className="text-xs font-black font-mono">React 19</p>
             </div>
             <div className="p-3.5 rounded-xl bg-slate-500/5 border border-white/5">
                <p className="text-[9px] uppercase font-black opacity-30 mb-1">Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                   <p className="text-xs font-black font-mono uppercase">Stable</p>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
