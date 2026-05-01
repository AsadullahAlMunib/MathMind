/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Github, 
  ExternalLink, 
  User as UserIcon,
  Calendar,
  Code2,
  Mail,
  Camera,
  BookOpen,
  Trophy
} from 'lucide-react';

import { UserStats, UserProfile } from '../lib/types';
import { translations } from '../lib/translations';
import Tooltip from './Tooltip';

interface ProfileProps {
  user: UserProfile;
  stats: UserStats;
  onUpdateUser: (user: UserProfile) => void;
  onClearReview: () => void;
  language: 'en' | 'bn';
}

export default function Profile({ user, stats, onUpdateUser, onClearReview, language }: ProfileProps) {
  const t = translations[language];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
      {/* User Info Section */}
      <section className="math-card p-5 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 group">
        <div className="relative group">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-primary/10 ring-2 ring-primary ring-offset-4 ring-offset-transparent transition-transform group-hover:scale-105 duration-300">
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={14} />
          </button>
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
               <Trophy size={11} className="shrink-0" /> {stats.totalPoints} {language === 'en' ? 'PTS' : 'পয়েন্ট'}
             </div>
             
             {stats.missedQuestions && stats.missedQuestions.length > 0 && (
               <button 
                 onClick={onClearReview}
                 className="px-3 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
               >
                 {language === 'en' ? 'Clear History' : 'মুছে ফেলুন'}
               </button>
             )}
          </div>
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
                    href="mailto:asadullahalmunib9@gmail.com" 
                    className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Mail size={18} />
                  </a>
                </Tooltip>
                <a 
                  href="https://github.com/AsadullahAlMunib" 
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
