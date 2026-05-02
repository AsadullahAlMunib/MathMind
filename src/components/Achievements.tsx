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

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-y-12 gap-x-6 px-2">
        {ACHIEVEMENTS.map((achievement, idx) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          return (
            <motion.div 
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.6,
                delay: 0.02 * idx,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              className="flex flex-col items-center group"
            >
              <Tooltip content={achievement.description} delay={100}>
                <div className="relative flex flex-col items-center">
                  {/* The Medallion */}
                  <motion.div 
                    whileHover={isUnlocked ? { scale: 1.1, y: -10 } : {}}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-700 ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-800 shadow-[0_20px_50px_-15px_rgba(245,158,11,0.4)] ring-[6px] ring-amber-500/10' 
                        : 'bg-black/5 dark:bg-white/5 border-2 border-dashed border-theme opacity-30 grayscale'
                    }`}
                  >
                    {/* Inner Texture & Visual Effects */}
                    {isUnlocked && (
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4)_0%,transparent_70%)]"></div>
                        <div className="absolute inset-[3px] rounded-full border border-white/30"></div>
                        <motion.div 
                          animate={{ x: [-120, 120] }}
                          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                        />
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`relative z-10 transition-transform duration-500 group-hover:scale-110 ${isUnlocked ? 'text-white' : 'text-muted/50'}`}>
                      {isUnlocked ? (
                        <AchievementIcon name={achievement.icon} size={32} className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" />
                      ) : (
                        <Lock size={24} strokeWidth={1} />
                      )}
                    </div>

                    {/* Achievement Status Badge */}
                    {isUnlocked && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-[3px] border-surface flex items-center justify-center shadow-xl z-20"
                      >
                        <CheckCircle size={10} className="text-white" strokeWidth={5} />
                      </motion.div>
                    )}

                    {/* Atmospheric Underglow */}
                    {isUnlocked && (
                      <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl -z-10 group-hover:bg-amber-500/40 transition-all duration-700"></div>
                    )}
                  </motion.div>

                  {/* Labels Section */}
                  <div className="mt-5 space-y-1.5 text-center px-1">
                    <h4 className={`text-[11px] font-black uppercase tracking-tight leading-tight transition-all duration-500 ${
                      isUnlocked ? 'text-foreground' : 'text-muted'
                    }`}>
                      {achievement.title}
                    </h4>
                    
                    {isUnlocked ? (
                       <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                         <span className="text-[7px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest whitespace-nowrap">
                           {language === 'en' ? 'Unlocked' : 'অর্জিত'}
                         </span>
                       </div>
                    ) : (
                       <span className="text-[7px] font-black uppercase tracking-widest opacity-30 whitespace-nowrap">
                         {language === 'en' ? 'Locked' : 'লকড'}
                       </span>
                    )}
                  </div>

                  {/* Shelf Reflection */}
                  <div className={`absolute -bottom-4 w-12 h-1.5 bg-black/5 dark:bg-white/5 blur-md rounded-full transition-all duration-700 group-hover:scale-[2] group-hover:opacity-40 ${isUnlocked ? 'opacity-100' : 'opacity-0'}`}></div>
                </div>
              </Tooltip>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
