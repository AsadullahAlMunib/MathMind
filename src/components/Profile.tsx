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
  BookOpen
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
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4">
      {/* User Info Section */}
      <section className="math-card p-10 flex flex-col md:flex-row items-center gap-8 ring-1 ring-black/5 dark:ring-white/10">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-primary/10 ring-4 ring-primary ring-offset-4 ring-offset-transparent">
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={16} />
          </button>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
             <input 
               type="text" 
               value={user.name}
               onChange={(e) => onUpdateUser({ ...user, name: e.target.value })}
               className="text-3xl font-bold bg-transparent border-none focus:ring-2 ring-primary/20 rounded-lg outline-none w-full"
             />
             <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 opacity-50 text-sm">
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <Calendar size={14} />
                  Joined {new Date(user.joinedAt).toLocaleDateString()}
                </p>
                <div className="hidden md:block w-1 h-1 bg-current rounded-full"></div>
                <p className="flex items-center justify-center gap-2">
                  <BookOpen size={14} />
                  {stats.missedQuestions?.length || 0} Review Questions
                </p>
             </div>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
             <span className="px-4 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
               Level {stats.level}
             </span>
             <span className="px-4 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase tracking-wider">
               {stats.totalPoints} Points
             </span>
             {stats.missedQuestions && stats.missedQuestions.length > 0 && (
               <Tooltip content={t.clearHistory} position="bottom">
                 <button 
                   onClick={onClearReview}
                   className="px-4 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
                 >
                   Clear Review History
                 </button>
               </Tooltip>
             )}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-black text-white rounded-lg"><Code2 size={20} /></div>
           <h3 className="text-xl font-bold">Developer Credits</h3>
        </div>
        
        <div className="math-card bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-none p-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-black/5 dark:divide-white/5">
          <div className="p-8 flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
             <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl">
                <img src="https://avatars.githubusercontent.com/u/163411448" alt="Md Asadullah Al Munib" />
             </div>
             <div>
                <h4 className="text-lg font-bold">Md Asadullah Al Munib</h4>
                <p className="text-sm opacity-60">Lead Developer & Designer</p>
             </div>
             <div className="flex items-center gap-2">
               <Tooltip content="GitHub Profile">
                 <a 
                   href="https://github.com/AsadullahAlMunib" 
                   target="_blank" 
                   className="p-2 bg-black text-white rounded-xl hover:scale-110 transition-transform"
                 >
                   <Github size={20} />
                 </a>
               </Tooltip>
               <Tooltip content="Send Email">
                 <a 
                   href="mailto:asadullahalmunib9@gmail.com" 
                   className="p-2 bg-primary text-white rounded-xl hover:scale-110 transition-transform"
                 >
                   <Mail size={20} />
                 </a>
               </Tooltip>
               <Tooltip content="Visit Portfolio website">
                 <a 
                   href="https://github.com/AsadullahAlMunib" 
                   target="_blank" 
                   className="flex items-center gap-2 text-sm font-bold text-primary px-4 py-2 hover:bg-primary/5 rounded-xl transition-colors"
                 >
                   View Portfolio <ExternalLink size={14} />
                 </a>
               </Tooltip>
             </div>
          </div>
          
          <div className="p-8 flex-1 grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5">
                <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Version</p>
                <p className="text-sm font-bold font-mono">1.0.0-beta</p>
             </div>
             <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5">
                <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Engine</p>
                <p className="text-sm font-bold font-mono">Vite + Gemini</p>
             </div>
             <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5">
                <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Stack</p>
                <p className="text-sm font-bold font-mono">React 19</p>
             </div>
             <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5">
                <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Region</p>
                <p className="text-sm font-bold font-mono">Global</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
