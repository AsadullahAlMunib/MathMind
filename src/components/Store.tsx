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

import { THEMES, UserProfile } from '../lib/types';
import { translations } from '../lib/translations';
import Tooltip from './Tooltip';

interface StoreProps {
  user: UserProfile;
  unlockedThemes: string[];
  balance: number;
  currentTheme: string;
  onUnlock: (themeId: string) => void;
  onSelect: (themeId: string) => void;
  onUpdateUser: (user: UserProfile) => void;
  language: 'en' | 'bn';
}

export default function Store({ user, unlockedThemes, balance, currentTheme, onUnlock, onSelect, onUpdateUser, language }: StoreProps) {
  const t = translations[language] as any;
  const coreT = translations[language];

  const CUSTOM_THEME_COST = 40000;
  const isCustomUnlocked = unlockedThemes.includes('custom');
  const isCustomSelected = currentTheme === 'custom';

  const updateCustomColor = (type: 'primary' | 'secondary', color: string) => {
    const currentCustom = user.customTheme || { primary: '#6366f1', secondary: '#4f46e5' };
    onUpdateUser({
      ...user,
      customTheme: {
        ...currentCustom,
        [type]: color
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{coreT.store}</h2>
          <p className="text-muted font-medium">{language === 'en' ? 'Use your balance to unlock new visual styles!' : 'আপনার ব্যালেন্স ব্যবহার করে নতুন ভিজ্যুয়াল স্টাইল আনলক করুন!'}</p>
        </div>
        <Tooltip content={language === 'en' ? 'Your spendable balance' : 'আপনার খরচযোগ্য ব্যালেন্স'}>
          <div className="bg-amber-500/10 text-amber-500 px-6 py-3 rounded-2xl flex items-center gap-3 font-bold text-xl border border-amber-500/20 glass shadow-sm">
            <Coins size={24} />
            {balance}
          </div>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {THEMES.map((theme) => {
          const isUnlocked = unlockedThemes.includes(theme.id);
          const isSelected = currentTheme === theme.id;
          const canAfford = balance >= theme.cost;

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
                <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 w-fit border border-black/5">
                  {theme.cost > 0 ? (
                    <>
                      <Coins size={12} className="text-amber-500" />
                      <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                        {theme.cost} {coreT.points}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      {coreT.free}
                    </span>
                  )}
                </div>
              </div>

              {isUnlocked ? (
                <Tooltip content={coreT.selectTheme} position="bottom">
                  <button 
                    onClick={() => onSelect(theme.id)}
                    disabled={isSelected}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      isSelected ? 'bg-primary/10 text-primary cursor-default' : 'bg-primary text-white hover:shadow-lg'
                    }`}
                  >
                    {isSelected ? (language === 'en' ? 'Active' : 'সক্রিয়') : (language === 'en' ? 'Use Theme' : 'ব্যবহার করুন')}
                  </button>
                </Tooltip>
              ) : (
                <Tooltip content={canAfford ? (language === 'en' ? 'Unlock this theme' : 'এই থিমটি আনলক করুন') : (language === 'en' ? 'Not enough points' : 'পর্যাপ্ত পয়েন্ট নেই')} position="bottom">
                  <button 
                    onClick={() => onUnlock(theme.id)}
                    disabled={!canAfford}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      canAfford ? 'bg-amber-500 text-white hover:shadow-lg' : 'bg-gray-200 text-gray-500 dark:bg-white/5 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles size={18} />
                    {coreT.unlock}
                  </button>
                </Tooltip>
              )}
            </motion.div>
          );
        })}

        {/* Custom Theme Creator Card */}
        <motion.div
          whileHover={{ y: -8 }}
          className={`math-card p-8 flex flex-col gap-6 relative overflow-hidden group border-2 border-dashed ${
            isCustomSelected ? 'ring-4 ring-primary border-primary' : 'border-primary/20'
          }`}
        >
          {isCustomSelected && (
            <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full shadow-lg z-20">
              <Check size={16} strokeWidth={4} />
            </div>
          )}

          <div className="w-full h-32 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden relative border border-theme bg-gradient-to-br from-black/5 to-white/5">
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex gap-2">
                <div 
                  className="w-10 h-10 rounded-full border-4 border-white shadow-lg" 
                  style={{ backgroundColor: user.customTheme?.primary || '#6366f1' }}
                ></div>
                <div 
                  className="w-10 h-10 rounded-full border-4 border-white shadow-lg" 
                  style={{ backgroundColor: user.customTheme?.secondary || '#4f46e5' }}
                ></div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary">{t.customThemeCreator}</div>
            </div>
            {!isCustomUnlocked && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-2">
                <Lock size={32} />
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">{t.buyCustomTheme}</span>
              </div>
            )}
          </div>

          <div>
             <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" />
              {t.customThemeCreator}
            </h3>
            {!isCustomUnlocked ? (
              <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-500/10 w-fit border border-amber-500/20">
                <Coins size={12} className="text-amber-500" />
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                  {CUSTOM_THEME_COST} {coreT.points}
                </span>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-60">{t.primaryColor}</label>
                    <input 
                      type="color" 
                      value={user.customTheme?.primary || '#6366f1'}
                      onChange={(e) => updateCustomColor('primary', e.target.value)}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-60">{t.secondaryColor}</label>
                    <input 
                      type="color" 
                      value={user.customTheme?.secondary || '#4f46e5'}
                      onChange={(e) => updateCustomColor('secondary', e.target.value)}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {isCustomUnlocked ? (
            <button 
              onClick={() => onSelect('custom')}
              disabled={isCustomSelected}
              className={`w-full py-3 rounded-xl font-bold mt-auto transition-all ${
                isCustomSelected ? 'bg-primary/10 text-primary cursor-default' : 'bg-primary text-white hover:shadow-lg'
              }`}
            >
              {isCustomSelected ? (language === 'en' ? 'Active' : 'সক্রিয়') : (language === 'en' ? 'Use Custom Theme' : 'নিজস্ব থিম ব্যবহার করুন')}
            </button>
          ) : (
             <button 
              onClick={() => onUnlock('custom')}
              disabled={balance < CUSTOM_THEME_COST}
              className={`w-full py-3 rounded-xl font-bold mt-auto flex items-center justify-center gap-2 transition-all ${
                balance >= CUSTOM_THEME_COST ? 'bg-amber-500 text-white hover:shadow-lg' : 'bg-gray-200 text-gray-500 dark:bg-white/5 cursor-not-allowed'
              }`}
            >
              <Sparkles size={18} />
              {t.buyCustomTheme}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
