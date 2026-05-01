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
  X
} from 'lucide-react';
import { translations } from '../lib/translations';

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
    },
    {
      title: language === 'en' ? 'Dynamic Difficulty' : 'ডাইনামিক ডিফিকাল্টি',
      desc: language === 'en' 
        ? 'Choose between Basic, Normal, and Hard modes. AI generates unique questions every time!' 
        : 'বেসিক, নরমাল বা হার্ড মোড থেকে বেছে নিন। এআই প্রতিবার আপনার জন্য নতুন প্রশ্ন তৈরি করবে!',
      icon: <Gamepad2 className="text-emerald-500" size={64} />,
    },
    {
      title: language === 'en' ? 'Earn & Unlock' : 'অর্জুন এবং আনলক',
      desc: language === 'en' 
        ? 'Correct answers give you points. Use them in the Store to unlock amazing new themes.' 
        : 'সঠিক উত্তর আপনাকে পয়েন্ট দেবে। স্টোর থেকে চমৎকার থিম আনলক করতে এই পয়েন্টগুলি ব্যবহার করুন।',
      icon: <ShoppingBag className="text-amber-500" size={64} />,
    },
    {
      title: language === 'en' ? 'Track Progress' : 'অগ্রগতি ট্র্যাক করুন',
      desc: language === 'en' 
        ? 'View your activity graph and hit new milestones. Compete with yourself and climbing the high scores!' 
        : 'আপনার অ্যাক্টিভিটি গ্রাফ দেখুন এবং নতুন মাইলফলক ছুঁয়ে নিন। নিজের সঙ্গে প্রতিযোগিতা করুন এবং নতুন রেকর্ড গড়ুন!',
      icon: <Trophy className="text-rose-500" size={64} />,
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="math-card bg-white dark:bg-black p-10 max-w-lg w-full relative overflow-hidden"
      >
        <button onClick={onComplete} className="absolute top-4 right-4 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
           <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center text-center gap-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
              {steps[step].icon}
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{steps[step].title}</h2>
            <p className="opacity-60 text-lg leading-relaxed">{steps[step].desc}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-between">
           <div className="flex gap-2">
             {steps.map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-primary' : 'w-2 bg-black/10 dark:bg-white/10'}`} />
             ))}
           </div>
           
           {step < steps.length - 1 ? (
             <button 
               onClick={() => setStep(step + 1)}
               className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg transition-all"
             >
               {t.next} <ChevronRight size={20} />
             </button>
           ) : (
             <button 
               onClick={onComplete}
               className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg transition-all"
             >
               {t.finish} <CheckCircle size={20} />
             </button>
           )}
        </div>
      </motion.div>
    </motion.div>
  );
}
