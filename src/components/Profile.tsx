/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle,
  CheckCircle2,
  ShieldAlert,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  HelpCircle,
  ShieldCheck,
  X,
  ArrowRight,
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

import { UserStats, UserProfile, ACHIEVEMENTS, Achievement } from '../lib/types';
import { translations } from '../lib/translations';
import { storage } from '../lib/storage';
import AppTooltip from './Tooltip';
import Achievements, { AchievementIcon } from './Achievements';

interface ProfileProps {
  user: UserProfile;
  stats: UserStats;
  onUpdateUser: (user: UserProfile) => void;
  onClearReview: () => void;
  onStartTutorial: () => void;
  language: 'en' | 'bn';
  addToast: (title: string, subtitle: string, icon?: React.ReactNode) => void;
}

export default function Profile({ user, stats, onUpdateUser, onClearReview, onStartTutorial, language, addToast }: ProfileProps) {
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const [showApiTips, setShowApiTips] = useState(false);
  const [activeCustomTab, setActiveCustomTab] = useState<'style' | 'color' | 'text'>('style');
  const [showResetScroll, setShowResetScroll] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const t = (translations[language] as any);
  const coreT = translations[language];

  const avatarStyles = [
    'avataaars', 
    'bottts', 
    'adventurer', 
    'pixel-art', 
    'lorelei', 
    'notionists', 
    'miniavs', 
    'big-smile',
    'croodles',
    'micah',
    'open-peeps',
    'shapes'
  ];

  const avatarColors = [
    'b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'c0f2f1', 
    '000000', 'ffffff', 'f1f5f9', '4f46e5', '059669', 'd97706'
  ];

  const handleUpdateAvatar = (style?: string, color?: string, seed?: string) => {
    const currentStyle = style || user.avatarStyle || 'avataaars';
    const currentColor = color || user.avatarColor || 'b6e3f4,c0aede,d1d4f9';
    const currentSeed = seed || user.avatar.split('seed=')[1]?.split('&')[0] || Math.random().toString(36).substring(2, 10);
    
    const newAvatar = `https://api.dicebear.com/9.x/${currentStyle}/svg?seed=${currentSeed}&backgroundColor=${currentColor}`;
    onUpdateUser({ 
      ...user, 
      avatar: newAvatar,
      avatarStyle: currentStyle,
      avatarColor: currentColor
    });
  };

  const handleRandomAvatar = () => {
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    const randomSeed = Math.random().toString(36).substring(2, 10);
    handleUpdateAvatar(randomStyle, randomColor, randomSeed);
  };

  // Prepare chart data from history
  const chartData = [...(stats.history || [])].reverse().map(item => {
    const d = new Date(item.date);
    return {
      score: item.score,
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      difficulty: item.difficulty,
      timeSpent: item.timeSpent,
      correctCount: item.correctCount,
      totalQuestions: item.totalQuestions
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface/90 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 mb-2">
            <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">{data.date}</p>
            <p className="text-[9px] font-black opacity-40 tracking-widest">{data.time}</p>
          </div>
          <div className="space-y-1.5 min-w-[120px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                {language === 'en' ? 'Score' : 'স্কোর'}
              </span>
              <span className="text-xs font-black text-primary">{data.score}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                {language === 'en' ? 'Level' : 'লেভেল'}
              </span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                data.difficulty === 'basic' ? 'bg-emerald-500/10 text-emerald-500' :
                data.difficulty === 'normal' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {t[data.difficulty]}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
              <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                {language === 'en' ? 'Correct' : 'সঠিক'}
              </span>
              <span className="text-[9px] font-black opacity-60">
                {data.correctCount}/{data.totalQuestions}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Scroll to the end of the chart (latest records) on mount and data change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [chartData.length]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const distanceToRight = scrollWidth - (scrollLeft + clientWidth);
    
    // Roughly estimate points hidden on the right. 
    // If we assume exactly 20 points fit in clientWidth, then width per point is clientWidth / 20.
    const pointWidth = clientWidth / 20;
    const pointsHiddenOnRight = distanceToRight / pointWidth;
    
    // Show arrow if at least 15 points are hidden on the right
    setShowResetScroll(pointsHiddenOnRight >= 15);
  };

  const resetScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 10px;
          opacity: 0.5;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      {/* User Info Section */}
      <section className="math-card glass p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-primary/10 ring-2 ring-primary ring-offset-4 ring-offset-transparent transition-transform group-hover:scale-105 duration-300">
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex flex-col gap-2">
              <AppTooltip content={language === 'en' ? 'Randomize Look' : 'এলোমেলো রূপ'}>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRandomAvatar}
                  className="p-2 bg-primary text-white rounded-full shadow-lg hover:shadow-primary/50 transition-all z-10"
                >
                  <RefreshCcw size={16} />
                </motion.button>
              </AppTooltip>
              <AppTooltip content={language === 'en' ? 'Select Style' : 'স্টাইল নির্বাচন করুন'}>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsChangingAvatar(!isChangingAvatar)}
                  className="p-2 bg-amber-500 text-white rounded-full shadow-lg hover:shadow-amber-500/50 transition-all z-10"
                >
                  <Palette size={16} />
                </motion.button>
              </AppTooltip>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
               <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                 <input 
                   type="text" 
                   value={user.name}
                   onChange={(e) => onUpdateUser({ ...user, name: e.target.value })}
                   className="text-2xl md:text-3xl font-black bg-transparent border-none focus:ring-2 ring-primary/20 rounded-lg outline-none w-full text-center md:text-left tracking-tight"
                   placeholder={t.username}
                 />
               </div>
               
               <textarea
                 value={user.bio || ''}
                 onChange={(e) => onUpdateUser({ ...user, bio: e.target.value })}
                 className="text-xs md:text-sm opacity-70 w-full bg-transparent border-none focus:ring-1 ring-primary/10 rounded-lg outline-none resize-none h-12 md:h-16 text-center md:text-left"
                 placeholder={t.bio}
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
               <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/5">
                 <span className="opacity-50">#</span> {coreT.level} {stats.level}
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/5">
                 <Coins size={11} className="shrink-0" /> {coreT.balance}: {stats.balance}
               </div>
            </div>
          </div>
        </div>

        {/* Enhanced Avatar Customization Panel */}
        <AnimatePresence>
          {isChangingAvatar && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-8 pt-6 border-t border-white/10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                  {(['style', 'color'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveCustomTab(tab)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeCustomTab === tab 
                          ? 'bg-surface shadow-sm text-primary' 
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      {tab === 'style' ? t.avatarStyle : t.backgroundColor}
                    </button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRandomAvatar}
                  className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                >
                  <RefreshCcw size={12} />
                  {language === 'en' ? 'Shuffle' : 'সাফল'}
                </motion.button>
              </div>

              {activeCustomTab === 'style' ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                  {avatarStyles.map((style) => (
                    <motion.button
                      key={style}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUpdateAvatar(style)}
                      className={`w-full aspect-square rounded-2xl bg-surface border-2 transition-all p-1.5 flex items-center justify-center overflow-hidden h-14 md:h-16 ${
                        user.avatar.includes(style) ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent hover:border-white/20'
                      }`}
                    >
                      <img 
                        src={`https://api.dicebear.com/9.x/${style}/svg?seed=preview&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                        alt={style} 
                        className="w-full h-full object-contain"
                      />
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-3">
                  {avatarColors.map((color) => (
                    <div key={color}>
                      <AppTooltip content={`Color: #${color}`}>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateAvatar(undefined, color)}
                          className={`w-full aspect-square rounded-full border-4 transition-all shadow-sm ${
                            user.avatar.includes(color) ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-white/20 hover:border-white/40'
                          }`}
                          style={{ backgroundColor: `#${color === 'ffffff' ? 'fff' : color}` }}
                        />
                      </AppTooltip>
                    </div>
                  ))}
                </div>
              )}
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
              {language === 'en' ? `Last ${stats.history?.length || 0}` : `শেষ ${stats.history?.length || 0} টি`}
            </div>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
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
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="w-full h-full overflow-x-auto hide-scrollbar"
              >
                <div 
                  style={{ 
                    // Calculate width if more than 20 records.
                    // This ensures the view window always accommodates 20 records.
                    width: chartData.length > 20 
                      ? `${(chartData.length / 20) * 100}%` 
                      : '100%',
                    height: '100%'
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis 
                        dataKey="date" 
                        hide 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        hide 
                        axisLine={false}
                        tickLine={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="var(--primary)" 
                        strokeWidth={4} 
                        dot={{ fill: 'var(--primary)', r: 4 }} 
                        activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                        animationDuration={1500}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 transform -rotate-12">
                 <TrendingUp size={64} />
                 <p className="text-[10px] font-black uppercase tracking-widest mt-2">{language === 'en' ? 'Need more data' : 'আরো তথ্য প্রয়োজন'}</p>
              </div>
            )}

            {/* Reset Scroll Button */}
            <AnimatePresence>
              {showResetScroll && (
                <motion.button
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  onClick={resetScroll}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-primary/50 transition-all mr-1"
                >
                  <ArrowRight size={16} />
                </motion.button>
              )}
            </AnimatePresence>
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

      <Achievements stats={stats} language={language} onSelectAchievement={setSelectedAchievement} />

      {/* App Settings Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
          <SettingsIcon size={14} />
          {language === 'en' ? 'App Settings' : 'অ্যাপ সেটিংস'}
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="math-card glass p-6 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${user.soundsEnabled ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'}`}>
                {user.soundsEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </div>
              <div>
                <p className="font-black tracking-tight">{language === 'en' ? 'Sound Effects' : 'শব্দ ইফেক্ট'}</p>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                  {user.soundsEnabled 
                    ? (language === 'en' ? 'Enabled' : 'চালু') 
                    : (language === 'en' ? 'Disabled' : 'বন্ধ')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onUpdateUser({ ...user, soundsEnabled: !user.soundsEnabled })}
              className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative ${user.soundsEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <motion.div 
                animate={{ x: user.soundsEnabled ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-md"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          <div className="math-card glass p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Lock size={24} />
                </div>
                <div>
                  <p className="font-black tracking-tight">{language === 'en' ? 'Gemini AI API Key' : 'জেমিনি AI API Key'}</p>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                    {storage.getApiKey() ? (language === 'en' ? 'Custom Key Active' : 'কাস্টম কি সক্রিয়') : (language === 'en' ? 'Using Public Quota' : 'পাবলিক কোটা ব্যবহার হচ্ছে')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowApiTips(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all"
                >
                  <HelpCircle size={12} />
                  {language === 'en' ? 'Tips' : 'টিপ্স'}
                </button>
                {storage.getApiKey() && (
                <button 
                  onClick={() => {
                    storage.clearApiKey();
                    window.location.reload();
                  }}
                  className="text-[9px] font-black uppercase text-rose-500 hover:bg-rose-500/5 px-2 py-1 rounded-lg"
                >
                  {language === 'en' ? 'Remove Key' : 'কি রিমুভ করুন'}
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
              <input 
                type="password"
                defaultValue={storage.getApiKey() || ''}
                id="api-key-input"
                className="flex-1 bg-black/5 dark:bg-white/5 border border-theme/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-all font-mono"
                placeholder="AIza..."
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('api-key-input') as HTMLInputElement;
                  const key = input.value.trim();
                  if (key.startsWith('AIza')) {
                    storage.saveApiKey(key);
                    addToast(
                      language === 'en' ? "API Key Saved" : "API কী সংরক্ষিত হয়েছে",
                      language === 'en' ? "Reloading to apply changes..." : "পরিবর্তনগুলো প্রয়োগ করতে রিলোড হচ্ছে...",
                      <CheckCircle2 className="text-emerald-500" />
                    );
                    setTimeout(() => window.location.reload(), 1500);
                  } else {
                    addToast(
                      language === 'en' ? "Invalid Key Format" : "ভুল কী ফরম্যাট",
                      language === 'en' ? "Gemini API keys typically start with 'AIza'" : "জেমিনি API কী সাধারণত 'AIza' দিয়ে শুরু হয়",
                      <ShieldAlert className="text-rose-500" />
                    );
                  }
                }}
                className="px-4 bg-primary text-white text-xs font-black uppercase rounded-xl hover:bg-primary/90 transition-all"
              >
                {language === 'en' ? 'Save' : 'সেভ'}
              </button>
            </div>
            
            <p className="text-[10px] opacity-40 font-medium italic">
              {language === 'en' 
                ? "Providing your own key ensures you're never blocked by daily limits." 
                : "আপনার নিজস্ব 'Gemini API Key' ব্যবহার করলে ডেইলি লিমিট নিয়ে চিন্তা থাকবে না।"
              }
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
          <BookOpen size={14} />
          {language === 'en' ? 'Help & Resources' : 'সাহায্য ও রিসোর্স'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={onStartTutorial}
            className="math-card glass p-6 flex items-center gap-4 hover:bg-primary/5 transition-all duration-500 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
              <Zap size={24} />
            </div>
            <div className="text-left">
              <p className="font-black tracking-tight">{language === 'en' ? 'App Walkthrough' : 'অ্যাপ টিউটোরিয়াল'}</p>
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
        
        <div className="math-card glass border-none overflow-hidden p-0 shadow-xl">
          <div className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-transparent">
             <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10 shrink-0"
             >
                <img src="https://avatars.githubusercontent.com/u/163411448" alt="Md Asadullah Al Munib" />
             </motion.div>
             
             <div className="space-y-1.5 flex-1 text-center md:text-left">
                <h4 className="text-xl font-black tracking-tight">Md Asadullah Al Munib</h4>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest leading-relaxed">
                  {language === 'en' ? 'Lead Developer & Digital Architect' : 'প্রধান ডেভেলপার এবং ডিজিটাল আর্কিটেক্ট'}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-2.5">
                  <a 
                    href="https://munib.rf.gd" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary px-3 py-1.5 bg-primary/5 hover:bg-primary/10 rounded-xl transition-all border border-primary/10"
                  >
                    Portfolio <ExternalLink size={10} />
                  </a>
                  <AppTooltip content="Send Email">
                    <a 
                      href="mailto:asadullahweb1@gmail.com" 
                      className="w-8 h-8 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Mail size={14} />
                    </a>
                  </AppTooltip>
                </div>
             </div>
             
             <div className="shrink-0 flex flex-col items-center gap-2">
                <AppTooltip content="Official GitHub Profile">
                  <a 
                    href="https://github.com/AsadullahAlMunib" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/30 group"
                  >
                    <Github size={18} className="group-hover:rotate-12 transition-transform" />
                    <span>Follow on GitHub</span>
                  </a>
                </AppTooltip>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-20">@AsadullahAlMunib</p>
             </div>
          </div>
        </div>
      </section>
      {/* Modals and Overlays */}
      <AnimatePresence>
        {selectedAchievement && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAchievement(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border border-white/10"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-end">
                   <button onClick={() => setSelectedAchievement(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-700 relative ${
                    stats.unlockedAchievements?.includes(selectedAchievement.id)
                      ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-800 shadow-[0_20px_50px_-15px_rgba(245,158,11,0.4)] ring-[6px] ring-amber-500/10'
                      : 'bg-black/5 dark:bg-white/5 border-2 border-dashed border-theme opacity-30'
                  }`}>
                    <AchievementIcon 
                      name={selectedAchievement.icon} 
                      size={48} 
                      className={stats.unlockedAchievements?.includes(selectedAchievement.id) ? 'text-white' : 'text-muted/50'} 
                    />
                    {stats.unlockedAchievements?.includes(selectedAchievement.id) && (
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-[4px] border-surface flex items-center justify-center shadow-xl">
                        <CheckCircle size={14} className="text-white" strokeWidth={4} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight">{language === 'bn' ? selectedAchievement.titleBn : selectedAchievement.title}</h2>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                      stats.unlockedAchievements?.includes(selectedAchievement.id)
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {stats.unlockedAchievements?.includes(selectedAchievement.id) 
                        ? (language === 'en' ? 'Achievement Unlocked' : 'অ্যাচিভমেন্ট আনলকড')
                        : (language === 'en' ? 'Locked' : 'লকড')}
                    </span>
                  </div>

                  <div className="space-y-3 flex flex-col items-center">
                    <p className="text-sm font-medium opacity-70 leading-relaxed italic">
                      "{language === 'bn' ? selectedAchievement.descriptionBn : selectedAchievement.description}"
                    </p>
                    
                    {/* Detailed Explanation */}
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/5 w-full text-center">
                      <p className="text-[11px] leading-relaxed opacity-60 font-medium">
                        {language === 'bn' ? selectedAchievement.longDescriptionBn : selectedAchievement.longDescription}
                      </p>
                    </div>
                  </div>

                  {/* Multiplier for specific achievements */}
                  {(selectedAchievement.id === 'unstoppable' || selectedAchievement.id === 'marathoner' || selectedAchievement.id === 'light_speed' || selectedAchievement.id === 'perfect_basic') && stats.unlockedAchievements?.includes(selectedAchievement.id) && (() => {
                    let multiplier = 0;
                    if (selectedAchievement.id === 'unstoppable') multiplier = Math.floor((stats.achievementCounts?.['unstoppable'] || 0) / 10);
                    else if (selectedAchievement.id === 'marathoner') multiplier = Math.floor((stats.activity?.length || 0) / 10);
                    else if (selectedAchievement.id === 'light_speed') multiplier = Math.floor((stats.bestLightSpeedStreak || 0) / 5);
                    else if (selectedAchievement.id === 'perfect_basic') multiplier = Math.floor((stats.highScores.basic || 0) / 600);
                    
                    if (multiplier > 1) {
                      return (
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                          <Zap size={14} fill="currentColor" />
                          <span className="text-[11px] font-black uppercase tracking-widest">
                            {multiplier}x Multiplier
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  {selectedAchievement.id === 'light_speed' ? (
                     <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                            {language === 'en' ? 'Best Consecutive Fast Answers' : 'পরপর দ্রুত উত্তরের সর্বোচ্চ সংখ্যা'}
                          </span>
                          <span className="text-xs font-black">
                            {stats.bestLightSpeedStreak || 0} / {selectedAchievement.targetValue}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, ((stats.bestLightSpeedStreak || 0) / (selectedAchievement.targetValue || 1)) * 100)}%` }}
                            className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                          />
                        </div>
                     </div>
                  ) : selectedAchievement.id === 'elite_calculator' ? (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                            {language === 'en' ? 'Core Quiz Challenge Progress' : 'প্রধান কুইজ চ্যালেঞ্জের অগ্রগতি'}
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                             {(['basic', 'normal', 'hard'] as const).map(d => (
                               <div key={d} className="flex flex-col items-center p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5">
                                 <span className="text-[8px] font-black uppercase opacity-40">{language === 'en' ? d : (d === 'basic' ? 'সহজ' : d === 'normal' ? 'মধ্যম' : 'কঠিন')}</span>
                                 <span className={`text-[10px] font-black ${ (stats.lifetimeQuizzesByDifficulty?.[d] || 0) >= 25 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                   {stats.lifetimeQuizzesByDifficulty?.[d] || 0} / 25
                                 </span>
                               </div>
                             ))}
                          </div>
                      </div>
                      <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, ((stats.totalQuizzes || 0) / 100) * 100)}%` }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                  ) : !stats.unlockedAchievements?.includes(selectedAchievement.id) ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                          {language === 'en' ? 'Next Goal' : 'পরবর্তী লক্ষ্য'}
                        </span>
                        <span className="text-xs font-black">
                          {(selectedAchievement.getValue ? selectedAchievement.getValue(stats) : 0).toLocaleString()} / {(selectedAchievement.targetValue || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, ((selectedAchievement.getValue ? selectedAchievement.getValue(stats) : 0) / (selectedAchievement.targetValue || 1)) * 100)}%` }}
                          className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-center opacity-40 uppercase tracking-widest">
                        {language === 'en' ? 'Keep playing to unlock!' : 'আনলক করতে খেলতে থাকুন!'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 flex flex-col items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        {language === 'en' ? 'Achieved On' : 'অর্জিত হয়েছে'}
                      </span>
                      <span className="text-xs font-black text-emerald-500">
                        {stats.achievementUnlocks?.[selectedAchievement.id] ? new Date(stats.achievementUnlocks[selectedAchievement.id]).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '---'}
                      </span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedAchievement(null)}
                  className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
                >
                  {language === 'en' ? 'Close' : 'বন্ধ করুন'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showApiTips && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApiTips(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border border-white/10"
            >
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <Zap size={24} className="text-indigo-500" />
                    {language === 'en' ? 'API Key Tips' : 'এপিআই কি টিপ্স'}
                  </h2>
                  <button onClick={() => setShowApiTips(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <section className="space-y-2">
                    <h4 className="text-sm font-black text-indigo-500 uppercase tracking-widest">
                      {language === 'en' ? 'Why use a custom key?' : 'কেন কাস্টম কি ব্যবহার করবেন?'}
                    </h4>
                    <p className="text-xs font-medium opacity-70 leading-relaxed">
                      {language === 'en' 
                        ? "Our app provides a shared quota for everyone. When many users play at once, this quota can run out. Using your own key means you have your own dedicated limits."
                        : "আমাদের অ্যাপটি সবার জন্য একটি কমন কোটা শেয়ার করে। যখন একসাথে অনেক ইউজার খেলে, তখন এই কোটা শেষ হয়ে যেতে পারে। নিজের কি ব্যবহার করলে আপনার নিজস্ব আলাদা লিমিট থাকবে।"
                      }
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-sm font-black text-indigo-500 uppercase tracking-widest">
                      {language === 'en' ? 'How to get it for free?' : 'কিভাবে ফ্রিতে পাবেন?'}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                        <p className="text-xs font-medium opacity-70 italic">
                          {language === 'en' ? "Visit Google AI Studio (link below)." : "নিচের লিঙ্কে ক্লিক করে গুগল এআই স্টুডিওতে যান।"}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                        <p className="text-xs font-medium opacity-70 italic">
                          {language === 'en' ? "Login with any Google account." : "যেকোনো একটি গুগল একাউন্ট দিয়ে লগইন করুন।"}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                        <p className="text-xs font-medium opacity-70 italic">
                          {language === 'en' ? "Click 'Get API key' then 'Create API key in new project'." : "'Get API key' এ ক্লিক করে 'Create API key' বাটনে চাপ দিন।"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    <ExternalLink size={14} />
                    {language === 'en' ? 'Google AI Studio' : 'এআই স্টুডিও লিংক'}
                  </a>

                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3">
                    <ShieldCheck size={20} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">
                        {language === 'en' ? 'Security Note' : 'সিকিউরিটি নোট'}
                      </p>
                      <p className="text-[10px] font-medium opacity-60 leading-tight">
                        {language === 'en' 
                          ? "Your key is saved only in your browser's private storage (Local Storage). It is never sent to our server."
                          : "আপনার কি শুধুমাত্র আপনার ব্রাউজারের প্রাইভেট স্টোরেজে সেভ থাকে। আমাদের সার্ভারে এটি পাঠানো হয় না।"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowApiTips(false)}
                  className="w-full py-4 bg-black/5 dark:bg-white/5 border border-theme/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                >
                  {language === 'en' ? 'Got it, thanks' : 'বুঝেছি, ধন্যবাদ'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
