import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Lock, 
  CheckCircle,
  Target,
  Zap,
  Flame,
  Coins,
  Palette,
  Crown
} from 'lucide-react';
import { ACHIEVEMENTS, UserStats } from '../lib/types';
import Tooltip from './Tooltip';

interface AchievementIconProps {
  name: string;
  size?: number;
  className?: string;
}

const AchievementIcon = ({ name, size = 24, className = "" }: AchievementIconProps) => {
  const iconProps = { size, className };
  switch (name) {
    case 'target': return <Target {...iconProps} />;
    case 'zap': return <Zap {...iconProps} />;
    case 'flame': return <Flame {...iconProps} />;
    case 'coins': return <Coins {...iconProps} />;
    case 'palette': return <Palette {...iconProps} />;
    case 'crown': return <Crown {...iconProps} />;
    default: return <Trophy {...iconProps} />;
  }
};

interface AchievementsProps {
  stats: UserStats;
  language: 'en' | 'bn';
}

export default function Achievements({ stats, language }: AchievementsProps) {
  const unlockedAchievements = stats.unlockedAchievements || [];

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
            <Trophy size={14} className="text-amber-500" />
            {language === 'en' ? 'Achievements' : 'অ্যাচিভমেন্টস'}
          </h3>
          <p className="text-2xl font-black tracking-tight text-foreground">
            {language === 'en' ? 'Hall of Excellence' : 'শ্রেষ্ঠত্বের গ্যালারি'}
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-surface border border-theme rounded-2xl shadow-sm">
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-full border-2 border-surface bg-amber-500/${20 + (i * 20)} flex items-center justify-center`}>
                <Trophy size={10} className="text-amber-600" />
              </div>
            ))}
          </div>
          <div className="h-8 w-px bg-theme mx-1"></div>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-tighter leading-none">
              {unlockedAchievements.length} / {ACHIEVEMENTS.length}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-none mt-1">
              {language === 'en' ? 'Unlocked' : 'আনলকড'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {ACHIEVEMENTS.map((achievement, idx) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          return (
            <motion.div 
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * idx }}
            >
              <Tooltip content={achievement.description}>
                <motion.div 
                  whileHover={isUnlocked ? { scale: 1.05 } : {}}
                  className={`relative p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition-all duration-300 border h-full group cursor-help ${
                    isUnlocked 
                      ? 'bg-surface border-amber-500/30 shadow-sm' 
                      : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent opacity-40 grayscale'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 relative ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md' 
                      : 'bg-slate-500/10 text-slate-400/50'
                  }`}>
                    {isUnlocked ? (
                      <AchievementIcon name={achievement.icon} size={20} />
                    ) : (
                      <Lock size={18} />
                    )}
                  </div>

                  <div className="space-y-0.5 w-full overflow-hidden">
                    <h4 className={`text-[9px] font-black tracking-tight leading-tight uppercase transition-colors truncate ${
                      isUnlocked ? 'text-foreground' : 'text-muted'
                    }`}>
                      {achievement.title}
                    </h4>
                    
                    {isUnlocked ? (
                       <p className="text-[7px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest opacity-60">
                         {language === 'en' ? 'Earned' : 'অর্জিত'}
                       </p>
                    ) : (
                       <span className="text-[7px] font-black opacity-20 uppercase tracking-widest">
                         {language === 'en' ? 'Locked' : 'লকড'}
                       </span>
                    )}
                  </div>
                </motion.div>
              </Tooltip>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
