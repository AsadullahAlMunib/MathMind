/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Brain, 
  Trophy, 
  ShoppingBag, 
  ChevronRight,
  ArrowRight,
  CheckCircle,
  X,
  Zap,
  Target,
  LineChart,
  Award,
  Crown
} from 'lucide-react';
import { translations } from '../lib/translations';
import Tooltip from './Tooltip';

interface TutorialProps {
  onComplete: () => void;
  language: 'en' | 'bn';
}

export default function Tutorial({ onComplete, language }: TutorialProps) {
  const [step, setStep] = useState(0);
  const t = translations[language];

  const steps = [
    {
      title: language === 'en' ? 'Welcome to Math Mind!' : 'ম্যাথ মাইন্ডে স্বাগতম!',
      desc: language === 'en' 
        ? 'The ultimate interactive math quiz playground. Boost your logic while having fun!' 
        : 'সেরা ইন্টারঅ্যাক্টিভ ম্যাথ কুইজ প্ল্যাটফর্ম। মজার মাধ্যমে আপনার যুক্তিশক্তি বাড়ান!',
      icon: <Brain className="text-primary" size={64} />,
      color: 'bg-primary/10'
    },
    {
      title: language === 'en' ? 'Dynamic Difficulty' : 'ডাইনামিক ডিফিকাল্টি',
      desc: language === 'en' 
        ? 'Choose between Basic, Normal, and Hard modes. AI generates unique questions every time!' 
        : 'বেসিক, নরমাল বা হার্ড মোড থেকে বেছে নিন। এআই প্রতিবার আপনার জন্য নতুন প্রশ্ন তৈরি করবে!',
      icon: <Gamepad2 className="text-emerald-500" size={64} />,
      color: 'bg-emerald-500/10'
    },
    {
      title: language === 'en' ? 'Stay on Fire!' : 'আগুনে থাকুন!',
      desc: language === 'en' 
        ? 'Maintain your Daily Streak by playing every day. Don\'t let the flame go out!' 
        : 'প্রতিদিন খেলে আপনার ডেইলি স্ট্রিক বজায় রাখুন। আগুনের শিখা নিভে যেতে দেবেন না!',
      icon: <Zap className="text-amber-500" size={64} />,
      color: 'bg-amber-500/10'
    },
    {
      title: language === 'en' ? 'Achievements & Themes' : 'অ্যাচিভমেন্ট এবং থিম',
      desc: language === 'en' 
        ? 'Earn points to reach milestones. Unlock premium themes in the Store to personalize your experience!' 
        : 'মাইলফলকগুলোতে পৌঁছাতে পয়েন্ট অর্জন করুন। আপনার অভিজ্ঞতাকে আরও সুন্দর করতে স্টোর থেকে প্রিমিয়াম থিম আনলক করুন!',
      icon: <Award className="text-purple-500" size={64} />,
      color: 'bg-purple-500/10'
    },
    {
      title: language === 'en' ? 'Advanced Analytics' : 'অ্যাডভান্সড অ্যানালিটিক্স',
      desc: language === 'en' 
        ? 'Toggle between Accuracy and Mastery Profile to see your growth and identify areas for improvement.' 
        : 'আপনি কতটা উন্নতি করছেন তা দেখতে সঠিকতা এবং দক্ষতার প্রোফাইলের মধ্যে টগল করে দেখুন।',
      icon: <LineChart className="text-indigo-500" size={64} />,
      color: 'bg-indigo-500/10'
    },
    {
      title: language === 'en' ? 'Global Leaderboard' : 'গ্লোবাল লিডারবোর্ড',
      desc: language === 'en' 
        ? 'Compare your scores with other players worldwide. Rise to the top and become a Math Master!' 
        : 'সারা বিশ্বের অন্যান্য খেলোয়াড়দের সাথে আপনার স্কোরের তুলনা করুন। শীর্ষে উঠুন এবং একজন ম্যাথ মাস্টার হয়ে উঠুন!',
      icon: <Crown className="text-yellow-500" size={64} />,
      color: 'bg-yellow-500/10'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="math-card bg-white dark:bg-slate-900 p-8 md:p-12 max-w-xl w-full relative overflow-hidden shadow-2xl border-none ring-1 ring-white/10"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <Tooltip content={language === 'en' ? 'Skip' : 'স্কিপ করুন'} position="bottom">
          <button onClick={onComplete} className="absolute top-6 right-6 p-2 text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all z-20">
             <X size={24} />
          </button>
        </Tooltip>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="flex flex-col items-center text-center gap-8"
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className={`w-32 h-32 rounded-[2.5rem] ${steps[step].color} flex items-center justify-center mb-2 shadow-inner ring-1 ring-white/10`}
              >
                {steps[step].icon}
              </motion.div>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">{steps[step].title}</h2>
                <p className="opacity-70 text-lg md:text-xl leading-relaxed max-w-md mx-auto font-medium">{steps[step].desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex gap-3">
               {steps.map((_, i) => (
                 <motion.div 
                   key={i} 
                   animate={{ 
                     width: i === step ? 32 : 12,
                     backgroundColor: i === step ? 'var(--primary)' : 'rgba(0,0,0,0.1)'
                   }}
                   className="h-2.5 rounded-full dark:bg-white/10" 
                 />
               ))}
             </div>
             
             <div className="flex items-center gap-4 w-full md:w-auto">
               {step > 0 && (
                 <button 
                   onClick={() => setStep(step - 1)}
                   className="flex-1 md:flex-none px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                 >
                   {language === 'en' ? 'Back' : 'পেছনে'}
                 </button>
               )}
               
               {step < steps.length - 1 ? (
                 <motion.button 
                   whileHover={{ scale: 1.05, x: 5 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => setStep(step + 1)}
                   className="flex-1 md:flex-none bg-primary text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all"
                 >
                   {t.next} <ArrowRight size={20} />
                 </motion.button>
               ) : (
                 <motion.button 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   initial={{ backgroundColor: '#10b981' }}
                   onClick={onComplete}
                   className="flex-1 md:flex-none text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                 >
                   {t.finish} <CheckCircle size={20} />
                 </motion.button>
               )}
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
