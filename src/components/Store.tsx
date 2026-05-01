/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Check, 
  Coins, 
  Palette,
  Sparkles
} from 'lucide-react';

import { THEMES } from '../lib/types';
import { translations } from '../lib/translations';

interface StoreProps {
  unlockedThemes: string[];
  totalPoints: number;
  currentTheme: string;
  onUnlock: (themeId: string, cost: number) => void;
  onSelect: (themeId: string) => void;
  language: 'en' | 'bn';
}

export default function Store({ unlockedThemes, totalPoints, currentTheme, onUnlock, onSelect, language }: StoreProps) {
  const t = translations[language];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.store}</h2>
          <p className="text-muted font-medium">{language === 'en' ? 'Unlock new visual styles with your points!' : 'আপনার পয়েন্ট দিয়ে নতুন ভিজ্যুয়াল স্টাইল আনলক করুন!'}</p>
        </div>
        <div className="bg-amber-500/10 text-amber-500 px-6 py-3 rounded-2xl flex items-center gap-3 font-bold text-xl border border-amber-500/20 glass shadow-sm">
          <Coins size={24} />
          {totalPoints}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {THEMES.filter(t => t.id !== 'dark').map((theme) => {
          const isUnlocked = unlockedThemes.includes(theme.id);
          const isSelected = currentTheme === theme.id;
          const canAfford = totalPoints >= theme.cost;

          return (
            <motion.div
              key={theme.id}
              whileHover={{ y: -8 }}
              className={`math-card p-8 flex flex-col gap-6 relative overflow-hidden group ${isSelected ? 'ring-4 ring-primary' : ''}`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full shadow-lg z-20">
                  <Check size={16} strokeWidth={4} />
                </div>
              )}

              {/* Theme Preview */}
              <div 
                className="w-full h-32 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden relative border border-theme"
                style={{ backgroundColor: theme.colors.bg }}
              >
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-20 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                  <div className="w-12 h-4 rounded-full opacity-50" style={{ backgroundColor: theme.colors.secondary }}></div>
                  <div className="text-[10px] font-black uppercase tracking-tighter" style={{ color: theme.colors.text }}>Sample UI</div>
                </div>
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center text-white">
                    <Lock size={32} />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Palette size={20} className="text-primary" />
                  {theme.name}
                </h3>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">
                  {theme.cost > 0 ? `${theme.cost} ${t.points}` : 'Free'}
                </p>
              </div>

              {isUnlocked ? (
                <button 
                  onClick={() => onSelect(theme.id)}
                  disabled={isSelected}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    isSelected ? 'bg-primary/10 text-primary cursor-default' : 'bg-primary text-white hover:shadow-lg'
                  }`}
                >
                  {isSelected ? (language === 'en' ? 'Active' : 'সক্রিয়') : (language === 'en' ? 'Use Theme' : 'ব্যবহার করুন')}
                </button>
              ) : (
                <button 
                  onClick={() => onUnlock(theme.id, theme.cost)}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    canAfford ? 'bg-amber-500 text-white hover:shadow-lg' : 'bg-gray-200 text-gray-500 dark:bg-white/5 cursor-not-allowed'
                  }`}
                >
                  <Sparkles size={18} />
                  {t.unlock}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
