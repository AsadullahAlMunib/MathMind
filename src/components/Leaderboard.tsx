/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy,
  ChevronRight
} from 'lucide-react';
import { translations } from '../lib/translations';
import { Difficulty, LeaderboardRival } from '../lib/types';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  score: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export type RankingType = Difficulty;

interface LeaderboardProps {
  userName: string;
  userAvatar: string;
  rivals: LeaderboardRival[];
  language: 'en' | 'bn';
  highScores: Record<Difficulty, number>;
  totalPoints: number;
  lifetimeLevelScores: Record<Difficulty, number>;
}

export default function Leaderboard({ userName, userAvatar, rivals, language, highScores, totalPoints, lifetimeLevelScores }: LeaderboardProps) {
  const t = translations[language];
  const [rankingType, setRankingType] = React.useState<RankingType>('basic');

  const currentLeaderboard = useMemo(() => {
    const userEntry: LeaderboardEntry = {
      id: 'current-user',
      rank: 0,
      name: userName || (language === 'en' ? 'You' : 'আপনি'),
      score: lifetimeLevelScores[rankingType] || 0,
      avatar: userAvatar,
      isCurrentUser: true
    };

    const rivalEntries: LeaderboardEntry[] = rivals.map(r => ({
      id: r.id,
      rank: 0,
      name: r.name,
      score: r.lifetimeLevelScores?.[rankingType] || r.scores[rankingType] || 0,
      avatar: r.avatar
    }));

    const sorted = [...rivalEntries, userEntry]
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    // If user is not in top 10, search for them and show top 10 + user
    const top10 = sorted.slice(0, 10);
    const isUserInTop10 = top10.some(e => e.isCurrentUser);

    if (!isUserInTop10) {
      const userFullEntry = sorted.find(e => e.isCurrentUser);
      if (userFullEntry) {
        return [...top10, userFullEntry];
      }
    }

    return top10;
  }, [userName, userAvatar, rivals, language, highScores, rankingType, lifetimeLevelScores]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-black tracking-tight text-text/90">
          {language === 'en' ? `${t[rankingType]} Lifetime` : `${t[rankingType]} লাইফটাইম`}
        </h2>
        <p className="text-xs text-muted font-medium opacity-50 uppercase tracking-widest">
          {language === 'en' ? 'Global Rankings' : 'গ্লোবাল র‍্যাঙ্কিং'}
        </p>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex justify-center gap-1 p-1 bg-surface/20 border border-theme/10 rounded-xl w-fit mx-auto shadow-sm">
        {(['basic', 'normal', 'hard'] as Difficulty[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setRankingType(tab)}
            className={`px-5 py-2 rounded-lg font-bold uppercase transition-all relative text-[10px] tracking-wider ${
              rankingType === tab ? 'text-white' : 'text-muted hover:text-text'
            }`}
          >
            {rankingType === tab && (
              <motion.div layoutId="activeRankBg" className="absolute inset-0 bg-primary rounded-lg shadow-sm" />
            )}
            <span className="relative z-10">
              {t[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3 relative pb-20">
        <AnimatePresence mode="popLayout">
          {currentLeaderboard.map((entry) => (
            <motion.div 
              key={`${rankingType}-${entry.id}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <LeaderboardRow 
                entry={entry} 
                language={language}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, language }: { entry: LeaderboardEntry; language: 'en' | 'bn' }) {
  // Custom rank display for user outside top 10
  const rankDisplay = (entry.isCurrentUser && entry.rank > 10) ? '10+' : entry.rank;
  const isTop3 = entry.rank <= 3;

  return (
    <div
      className={`p-4 flex items-center justify-between group rounded-xl transition-all duration-300 border relative overflow-hidden ${
        entry.isCurrentUser 
          ? 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/10' 
          : isTop3 
            ? 'bg-surface/70 border-theme/10 shadow-md'
            : 'bg-surface/40 border-theme/5 hover:border-theme/10 hover:shadow-md'
      }`}
    >
      {/* Top 3 Animated Background */}
      {isTop3 && (
        <motion.div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          animate={{
            background: [
              'linear-gradient(90deg, var(--primary) 0%, transparent 50%, var(--primary) 100%)',
              'linear-gradient(270deg, var(--primary) 0%, transparent 50%, var(--primary) 100%)',
              'linear-gradient(90deg, var(--primary) 0%, transparent 50%, var(--primary) 100%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="flex items-center gap-6 relative z-10">
        <div className="w-8 flex flex-col items-center">
          <span className={`text-[10px] font-black tracking-widest ${
            entry.rank === 1 ? 'text-amber-500 scale-125' : 
            entry.rank === 2 ? 'text-slate-400 scale-110' : 
            entry.rank === 3 ? 'text-amber-700' : 
            entry.isCurrentUser ? 'text-primary' : 'opacity-40'
          }`}>
            {rankDisplay}
          </span>
        </div>

        <div className="flex flex-col">
          <span className={`font-black tracking-tight text-sm ${
            entry.isCurrentUser ? 'text-primary' : 
            entry.rank === 1 ? 'text-text' : 'text-text/80'
          }`}>
            {entry.name}
          </span>
          {entry.isCurrentUser && (
            <span className="text-[7px] font-black uppercase tracking-widest text-primary/60">
              {language === 'en' ? 'YOU' : 'আপনি'}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 relative z-10">
        <div className="text-right">
          <span className={`text-sm font-black tabular-nums ${
            entry.rank === 1 ? 'text-amber-500' :
            entry.isCurrentUser ? 'text-primary' : 'text-text/70'
          }`}>
            {entry.score.toLocaleString()}
          </span>
          <span className="text-[8px] font-bold opacity-30 uppercase ml-1 tracking-tighter">pts</span>
        </div>
        <ChevronRight size={14} className="text-muted opacity-0 group-hover:opacity-30 transition-opacity" />
      </div>
    </div>
  );
}

