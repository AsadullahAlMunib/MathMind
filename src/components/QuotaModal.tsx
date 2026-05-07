import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Key, 
  ExternalLink, 
  Check, 
  X, 
  AlertCircle, 
  Gamepad2,
  Copy,
  Info,
  Zap
} from 'lucide-react';
import { storage } from '../lib/storage';

interface QuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseOffline: () => void;
  language: 'en' | 'bn';
}

export default function QuotaModal({ isOpen, onClose, onUseOffline, language }: QuotaModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError(language === 'en' ? 'Please enter a valid key' : 'দয়া করে একটি সঠিক কি প্রদান করুন');
      return;
    }
    if (!apiKey.startsWith('AIza')) {
      setError(language === 'en' ? 'Invalid Gemini format key' : 'জেমিনি কি ফরম্যাট সঠিক নয়');
      return;
    }
    
    storage.saveApiKey(apiKey.trim());
    setIsSaved(true);
    setError('');
    setTimeout(() => {
      onClose();
      // Reload is often best to reset the AI instance or trigger a re-fetch
      window.location.reload();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-surface w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border border-white/10"
        >
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 relative">
                <ShieldAlert size={40} />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full -z-10"
                />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">
                  {!storage.getApiKey() 
                    ? (language === 'en' ? 'Online AI Activation' : 'অনলাইন AI সক্রিয় করুন')
                    : (language === 'en' ? 'AI Quota Limit' : 'AI লিমিট শেষ')
                  }
                </h2>
                <p className="text-sm font-medium opacity-60">
                  {!storage.getApiKey() 
                    ? (language === 'en' 
                        ? "To generate premium math challenges with Gemini AI, please provide your own API key." 
                        : "জেমিনি AI ব্যবহার করে উন্নত গণিত চ্যালেঞ্জ তৈরি করতে আপনার নিজস্ব API Key প্রদান করুন।")
                    : (language === 'en' 
                        ? "Our free AI service has reached its daily limit. You can use your own API key to continue playing online." 
                        : "আমাদের ফ্রি AI সার্ভিসের লিমিট শেষ হয়ে গেছে। আপনি কন্টিনিউ করতে নিজের API Key ব্যবহার করতে পারেন।")
                  }
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">
                  {language === 'en' ? 'Your Gemini API Key' : 'আপনার জেমিনি API Key'}
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary">
                    <Key size={18} />
                  </div>
                  <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setError('');
                    }}
                    placeholder="AIza..."
                    className="w-full bg-black/5 dark:bg-white/5 border border-theme/10 focus:border-primary rounded-2xl py-4 pl-12 pr-4 text-sm font-mono outline-none transition-all"
                  />
                  {isSaved && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                      <Check size={20} />
                    </div>
                  )}
                </div>
                {error && (
                  <p className="text-[10px] text-rose-500 font-bold ml-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {error}
                  </p>
                )}
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0">
                    <Info size={14} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold leading-tight">
                      {language === 'en' ? "How to get a free key?" : "কিভাবে ফ্রি কি পাবেন?"}
                    </p>
                    <p className="text-[10px] opacity-60 leading-relaxed">
                      {language === 'en' 
                        ? "Search 'Google AI Studio Generate API Key' or click the link below. It's free and takes 30 seconds." 
                        : "'Google AI Studio' এ যান, লগইন করুন এবং 'Create API key' বাটনে ক্লিক করুন। এটি সম্পূর্ণ ফ্রি।"}
                    </p>
                  </div>
                </div>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink size={12} />
                  {language === 'en' ? 'Go to Google AI Studio' : 'গুগল AI স্টুডিওতে যান'}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={onUseOffline}
                className="py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-theme/10 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1"
              >
                <div className="flex items-center gap-2">
                  <Gamepad2 size={16} />
                  {language === 'en' ? 'Offline' : 'অফলাইন'}
                </div>
                <span className="text-[8px] opacity-40 lowercase">
                  {language === 'en' ? 'Pre-built questions' : 'আগের জমানো প্রশ্ন'}
                </span>
              </button>
              
              <button 
                onClick={handleSave}
                className="py-4 bg-primary text-white shadow-lg shadow-primary/20 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-primary/90 flex items-center justify-center gap-2"
              >
                {isSaved ? (
                  <>
                    <Check size={18} />
                    {language === 'en' ? 'Saved' : 'সেভ হয়েছে'}
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    {language === 'en' ? 'Activate' : 'চালু করুন'}
                  </>
                )}
              </button>
            </div>

            <button 
              onClick={onClose}
              className="w-full text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
            >
              {language === 'en' ? 'Cancel' : 'বাতিল'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
