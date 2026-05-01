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

interface LeaderboardProps {
  highScores: Record<string, number>;
  language: 'en' | 'bn';
}

export default function Leaderboard({ highScores, language }: LeaderboardProps) {
  const t = translations[language];

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-amber-500/10 text-amber-500 rounded-2xl mb-4 glass border border-amber-500/20">
           <Trophy size={32} />
        </div>
        <h2 className="text-4xl font-black tracking-tight">{t.leaderboard}</h2>
        <p className="text-muted font-medium">{language === 'en' ? 'Your personal bests across all difficulties' : 'সব ধরনের ডিফিকাল্টিতে আপনার সেরা স্কোরসমূহ'}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ScoreTile 
          label={t.basic} 
          score={highScores.basic} 
          icon={<Star size={32} />} 
          color="emerald" 
          rank={1}
        />
        <ScoreTile 
          label={t.normal} 
          score={highScores.normal} 
          icon={<Medal size={32} />} 
          color="amber" 
          rank={2}
        />
        <ScoreTile 
          label={t.hard} 
          score={highScores.hard} 
          icon={<Crown size={32} />} 
          color="rose" 
          rank={3}
        />
      </div>

      <section className="math-card text-center p-12 overflow-hidden relative glass border-theme">
         <div className="relative z-10 space-y-4">
           <History size={48} className="mx-auto opacity-20" />
           <h3 className="text-xl font-bold opacity-40">Coming Soon: Global Ranks</h3>
           <p className="text-sm opacity-30 max-w-xs mx-auto">Soon you will be able to compete with players worldwide and climb the global hall of fame!</p>
         </div>
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"></div>
      </section>
    </div>
  );
}

function ScoreTile({ label, score, icon, color, rank }: { label: string, score: number, icon: React.ReactNode, color: string, rank: number }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
    rose: 'bg-rose-500/10 text-rose-500',
  };

  return (
    <motion.div
      whileHover={{ x: 10, scale: 1.01 }}
      className="math-card p-2 flex items-center gap-6 group pr-10 border-theme glass shadow-md hover:shadow-2xl"
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colors[color]} border border-current bg-opacity-5`}>
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
      </div>
      
      <div className="flex-1">
         <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">{label}</h3>
         <p className="text-3xl font-black tracking-tighter">{score}</p>
      </div>

      <div className="hidden md:flex flex-col items-end text-muted opacity-30 group-hover:opacity-100 transition-opacity">
         <span className="text-[10px] font-black uppercase tracking-tighter">Personal Rank</span>
         <span className="text-4xl italic font-black">#{rank}</span>
      </div>
    </motion.div>
  );
}
