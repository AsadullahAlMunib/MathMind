/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Medal, 
  Star, 
  Crown,
  History
} from 'lucide-react';
import { translations } from '../lib/translations';
import { Difficulty } from '../lib/types';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  highScores: Record<string, number>;
  userName: string;
  language: 'en' | 'bn';
}

export default function Leaderboard({ highScores, userName, language }: LeaderboardProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = React.useState<Difficulty>('basic');

  // Hardcoded "Legendary" players for a feel of competition
  // In a real app, these would come from a backend (Firebase)
  const getLeaderboardData = (difficulty: Difficulty): LeaderboardEntry[] => {
    const legends: Omit<LeaderboardEntry, 'rank'>[] = [
      { name: 'Euler_Math', score: difficulty === 'hard' ? 12500 : difficulty === 'normal' ? 8200 : 4500 },
      { name: 'Pythagoras', score: difficulty === 'hard' ? 11200 : difficulty === 'normal' ? 7800 : 4200 },
      { name: 'Gauss_99', score: difficulty === 'hard' ? 10800 : difficulty === 'normal' ? 7500 : 4100 },
      { name: 'Hypatia_X', score: difficulty === 'hard' ? 9500 : difficulty === 'normal' ? 6900 : 3800 },
      { name: 'Newton_Apple', score: difficulty === 'hard' ? 8900 : difficulty === 'normal' ? 6500 : 3500 },
      { name: 'Ada_L', score: difficulty === 'hard' ? 8200 : difficulty === 'normal' ? 6100 : 3300 },
      { name: 'Ramanujan', score: difficulty === 'hard' ? 7800 : difficulty === 'normal' ? 5800 : 3100 },
      { name: 'Descartes', score: difficulty === 'hard' ? 7200 : difficulty === 'normal' ? 5200 : 2900 },
      { name: 'Fibonacci', score: difficulty === 'hard' ? 6800 : difficulty === 'normal' ? 4900 : 2700 },
    ];

    const currentScore = highScores[difficulty] || 0;
    const allEntries = [
      ...legends,
      { name: userName || (language === 'en' ? 'You' : 'আপনি'), score: currentScore, isCurrentUser: true }
    ];

    return allEntries
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  };

  const currentLeaderboard = getLeaderboardData(activeTab);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-amber-500/10 text-amber-500 rounded-3xl mb-2 glass border border-amber-500/20">
           <Trophy size={40} />
        </div>
        <h2 className="text-4xl font-black tracking-tight">{t.leaderboard}</h2>
        <p className="text-muted font-medium opacity-60">
          {language === 'en' ? 'Top mathematical minds of the arena' : 'এই অঙ্গনের সেরা গণিতবিদগণ'}
        </p>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex justify-center p-1 bg-surface border border-theme rounded-2xl w-fit mx-auto shadow-sm">
        {(['basic', 'normal', 'hard'] as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => setActiveTab(diff)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === diff 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-muted hover:bg-muted/10'
            }`}
          >
            {t[diff]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 relative">
        <div className="absolute inset-x-0 -top-6 flex justify-between px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-30">
          <div className="flex gap-8">
            <span>{language === 'en' ? 'Rank' : 'র‍্যাঙ্ক'}</span>
            <span>{language === 'en' ? 'Player' : 'খেলোয়াড়'}</span>
          </div>
          <span>{language === 'en' ? 'Score' : 'স্কোর'}</span>
        </div>

        {currentLeaderboard.map((entry, idx) => (
          <LeaderboardRow 
            key={`${idx}-${entry.name}`} 
            entry={entry} 
            difficulty={activeTab}
            language={language}
          />
        ))}

        {currentLeaderboard.length === 0 && (
          <div className="py-20 text-center text-muted opacity-40 italic">
            {language === 'en' ? 'No scores recorded yet' : 'এখনো কোনো স্কোর রেকর্ড করা হয়নি'}
          </div>
        )}
      </div>

      <section className="math-card overflow-hidden relative glass border-theme p-6 group">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-primary/10 rounded-2xl text-primary">
               <History size={24} />
             </div>
             <div>
               <h3 className="font-bold">{language === 'en' ? 'Global Connectivity' : 'বৈশ্বিক সংযোগ'}</h3>
               <p className="text-xs text-muted">
                 {language === 'en' 
                   ? 'Integrate Firebase for real-time global leaderboards!' 
                   : 'রিয়েল-টাইম গ্লোবাল লিডারবোর্ডের জন্য ফায়ারবেস ইন্টিগ্রেট করুন!'}
               </p>
             </div>
           </div>
           <div className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-50 cursor-not-allowed">
              Coming Soon
           </div>
         </div>
      </section>
    </div>
  );
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  difficulty: Difficulty;
  language: 'en' | 'bn';
  key?: string | number;
}

function LeaderboardRow({ entry, difficulty, language }: LeaderboardRowProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-400 text-amber-950 border-amber-300';
    if (rank === 2) return 'bg-slate-300 text-slate-900 border-slate-200';
    if (rank === 3) return 'bg-orange-400 text-orange-950 border-orange-300';
    return 'bg-muted/5 text-muted border-theme';
  };

  const getDifficultyColor = (diff: Difficulty) => {
    if (diff === 'basic') return 'text-emerald-500';
    if (diff === 'normal') return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: entry.rank * 0.05 }}
      className={`math-card p-4 flex items-center justify-between group overflow-hidden relative ${
        entry.isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg shadow-xl bg-primary/5' : 'glass'
      }`}
    >
      {entry.isCurrentUser && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
      )}
      
      <div className="flex items-center gap-4 md:gap-8 z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border-b-2 transition-transform group-hover:scale-110 ${getRankColor(entry.rank)}`}>
          {entry.rank}
        </div>
        
        <div className="flex flex-col">
          <span className={`font-black text-sm md:text-base tracking-tight ${entry.isCurrentUser ? 'text-primary' : ''}`}>
            {entry.name}
            {entry.isCurrentUser && (
              <span className="ml-2 text-[8px] px-1.5 py-0.5 bg-primary text-white rounded-full uppercase">You</span>
            )}
          </span>
          <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
            {difficulty} Level
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-1 z-10">
        <span className={`text-xl md:text-2xl font-black tabular-nums transition-all group-hover:scale-110 ${getDifficultyColor(difficulty)}`}>
          {entry.score.toLocaleString()}
        </span>
        <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter">pts</span>
      </div>
    </motion.div>
  );
}

