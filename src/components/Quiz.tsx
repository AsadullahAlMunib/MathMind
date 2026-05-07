/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Timer, 
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Dna,
  Check,
  X,
  Pause,
  Play,
  BrainCircuit,
  Zap,
  Plus,
  Minus,
  Divide,
  Percent,
  Delete
} from 'lucide-react';

import { Difficulty, Question, QuestionType } from '../lib/types';
import { quizEngine } from '../lib/quizEngine';
import { translations } from '../lib/translations';
import { soundManager } from '../lib/sounds';
import AppTooltip from './Tooltip';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface QuizProps {
  difficulty: Difficulty;
  onComplete: (points: number, correct: number, diff: Difficulty, missed: Question[], streak: number) => void;
  onCancel: () => void;
  onQuotaExceeded?: () => void;
  language: 'en' | 'bn';
  initialQuestions?: Question[];
  addToast?: (title: string, subtitle: string, icon?: React.ReactNode) => void;
}

// Normalize strings for comparison (converts Bengali digits, strips labels, extra spaces)
const normalizeStr = (str: string) => {
  if (!str) return '';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  
  // Standardize boolean strings
  const boolMap: Record<string, string> = {
    'true': 'true',
    'false': 'false',
    'সত্য': 'true',
    'সঠিক': 'true',
    'মিথ্যা': 'false',
    'ভুল': 'false',
    'ভুল হয়েছে': 'false',
    'yes': 'true',
    'no': 'false',
    'হ্যাঁ': 'true',
    'না': 'false'
  };

  let text = str.trim().toLowerCase();
  
  // Remove LaTeX wrappers if present
  text = text.replace(/^\$/, '').replace(/\$$/, '');
  
  // If it matches a boolean synonym, return standardized value
  if (boolMap[text]) return boolMap[text];

  // Strip common labels (e.g., "A. ", "1) ", "a- ")
  text = text.replace(/^[a-z1-9]\s?[\.\)\-]\s*/, '').trim();
  
  // Check again after stripping labels for booleans
  if (boolMap[text]) return boolMap[text];

  let normalized = text.split('').map(char => {
    const index = bengaliDigits.indexOf(char);
    return index !== -1 ? index.toString() : char;
  }).join('');
  
  // Convert LaTeX \frac{a}{b} to a/b for parsing
  normalized = normalized.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2');
  // Convert \sqrt{a} to √a
  normalized = normalized.replace(/\\sqrt\{([^{}]+)\}/g, '√$1');
  
  return normalized.replace(/\s+/g, ' ').trim();
};

const isAnswerCorrect = (user: string, correct: string) => {
  const u = normalizeStr(user);
  const c = normalizeStr(correct);
  
  if (u === c) return true;
  
  // Try numerical comparison for fractions/decimals/roots
  const parseVal = (s: string): number => {
    let clean = s.trim();
    
    // Handle Square Root √
    if (clean.includes('√')) {
      const parts = clean.split('√');
      if (parts[0] === '' && parts[1]) {
        return Math.sqrt(parseFloat(parts[1]));
      }
      if (parts[0] && parts[1]) {
        return parseFloat(parts[0]) * Math.sqrt(parseFloat(parts[1]));
      }
    }

    // Handle Ratio/Fraction (only if exactly 2 parts)
    const mathParts = clean.split(/[:\/]/);
    if (mathParts.length === 2) {
      const num = parseFloat(mathParts[0]);
      const den = parseFloat(mathParts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
    }
    
    if (clean.endsWith('%')) return parseFloat(clean) / 100;
    return parseFloat(clean);
  };
  
  const vU = parseVal(u);
  const vC = parseVal(c);
  
  if (!isNaN(vU) && !isNaN(vC)) {
    // Check with tolerance for rounding (e.g. 1/6 vs 0.16)
    const diff = Math.abs(vU - vC);
    // Allow 0.001 absolute error or 1% relative error
    return diff < 0.001 || (vC !== 0 && diff / Math.abs(vC) < 0.01);
  }
  
  return false;
};

const renderMathContent = (text: string | undefined | null) => {
  if (!text) return '';

  // Fix interpreting control characters from improper JSON handling or AI quirks
  let sanitized = String(text)
    .replace(/\u000c/g, '\\\\f')  
    .replace(/\u0008/g, '\\\\b')  
    .replace(/\n\r/g, ' ')
    .replace(/\n/g, ' ');

  // Robustly handle dollar signs - sometimes AI adds spaces like "$ sin(x) $" 
  // or misses closing signs. We'll try to normalize them.
  sanitized = sanitized.replace(/\$\s+/g, '$').replace(/\s+\$/g, '$');

  // Auto-wrap segments that look like LaTeX but missed the $ delimiters
  // We split by existing $...$ to avoid double wrapping
  let tempSegments = sanitized.split(/(\$.*?\$)/g);
  const complexMathPattern = /((?:\d+[.,]?\d*\s*)?\\(?:frac|sqrt|sin|cos|tan|theta|alpha|beta|deg|circ|pi|times|div|pm|angle|triangle|approx|neq|leq|geq|times|div)(?:\{[^{}]*\}|\[[^\]]*\]|(?:\^|_)\d+|(?:\^|_)\{[^{}]*\}|\d|(?:\d+[\s]*[=><][\s]*\d+)|[\s]*[a-zA-Z0-9])*)/g;

  sanitized = tempSegments.map(seg => {
    if (seg.startsWith('$') && seg.endsWith('$')) return seg;
    return seg.replace(complexMathPattern, (match) => {
      if (!match || match.length < 2) return match;
      return `$${match.trim()}$`;
    });
  }).join('');

  // Handle remaining exponents like x^2 or y_1 that aren't wrapped
  sanitized = sanitized.replace(/(?<!\$)([a-zA-Z0-9](\^|_)\d+)(?!\$)/g, '$$$1$$');

  // Use a regex to split text by $...$ delimiters
  const segments = sanitized.split(/(\$.*?\$)/g);
  
  if (segments.length === 1 && !/\\|[\^_]|\{|\}|deg|^\d+\/\d+$|sin|cos|tan|log|pi/.test(sanitized)) {
    return sanitized;
  }

  return (
    <>
      {segments.map((segment, i) => {
        if (segment.startsWith('$') && segment.endsWith('$')) {
          let content = segment.slice(1, -1); 
          if (!content.trim()) return null;

          try {
            // Convert Bengali digits inside math formulas to English digits 
            const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            content = content.split('').map(char => {
              const idx = bengaliDigits.indexOf(char);
              return idx !== -1 ? idx.toString() : char;
            }).join('');

            // Clean up common things that might break simple latex
            const cleaned = content
              .replace(/(\d+)°/g, '$1^\\circ')
              .replace(/deg/g, '^\\circ')
              .replace(/(\d+)\/(\d+)/g, '\\\\frac{$1}{$2}') // Auto-fraction for simple numbers
              .trim();
            
            if (!cleaned) return null;
            return <InlineMath key={i} math={cleaned} />;
          } catch (e) {
            return <span key={i} className="font-mono text-amber-600">{segment}</span>;
          }
        }
        return <span key={i}>{segment}</span>;
      })}
    </>
  );
};

export default function Quiz({ difficulty, onComplete, onCancel, onQuotaExceeded, language, initialQuestions, addToast }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!initialQuestions);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [source, setSource] = useState<'ai' | 'algorithmic' | 'cache' | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine || !quizEngine.getApiKey());
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [points, setPoints] = useState(0);
  const [scoreAnimate, setScoreAnimate] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<{ id: number; value: number }[]>([]);
  const [missedQuestions, setMissedQuestions] = useState<Question[]>([]);
  const [inputValue, setInputValue] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const result = await quizEngine.generateQuestions(difficulty, language, 10);
      setQuestions(result.questions);
      setSource(result.source);
      setIsOffline(result.source !== 'ai');
      setLoading(false);
      startTimer();
    } catch (e: any) {
      console.error('Quiz generation error:', e);
      
      if (addToast) {
        addToast(
          language === 'en' ? "AI Connection Error" : "AI সংযোগ ত্রুটি",
          language === 'en' ? `Gemini Error: ${e.message || 'Unknown'}` : `জেমিনি ত্রুটি: ${e.message || 'অজানা'}`,
          <ShieldAlert className="text-amber-500" />
        );
      }

      if (e.message === 'QUOTA_EXCEEDED') {
        if (onQuotaExceeded) {
          onQuotaExceeded();
        } else {
          // Fallback to offline if no handler
          const result = await quizEngine.generateQuestions(difficulty, language, 10);
          setQuestions(result.questions);
          setSource(result.source);
          setLoading(false);
          startTimer();
        }
      } else {
        // General error fallback to algorithmic
        const questions = quizEngine.generateOffline(difficulty, 10, language);
        setQuestions(questions);
        setSource('algorithmic');
        setLoading(false);
        startTimer();
      }
    }
  };

  useEffect(() => {
    if (initialQuestions) return;
    fetchQuestions();
    return () => stopTimer();
  }, [difficulty, language, initialQuestions]);

  useEffect(() => {
    if (initialQuestions && questions.length > 0 && loading) {
       setLoading(false);
       startTimer();
    }
  }, [initialQuestions, questions, loading]);

  useEffect(() => {
    if (timeLeft === 0 && !showResult && !isPaused) {
      handleAnswer('');
    }
  }, [timeLeft, isPaused]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timerRef.current!);
          return 0;
        }
        // Play countdown sound in final 3 seconds
        if (prev <= 3 && prev > 0) {
          soundManager.play('countdown');
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTogglePause = () => {
    if (showResult) return;
    if (isPaused) {
      startTimer();
      setIsPaused(false);
    } else {
      stopTimer();
      setIsPaused(true);
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    

    stopTimer();
    setIsPaused(false);
    setSelectedAnswer(answer);
    const currentQ = questions[currentIndex];
    
    const isCorrect = isAnswerCorrect(answer, currentQ.answer);
    
    setShowResult(isCorrect ? 'correct' : 'incorrect');
    setResults(prev => [...prev, { id: currentQ.id, correct: isCorrect }]);
    
    if (isCorrect) {
      soundManager.play('correct');
      const basePoints = difficulty === 'basic' ? 10 : difficulty === 'normal' ? 25 : 50;
      const speedBonus = Math.floor(timeLeft * (difficulty === 'hard' ? 2.5 : 1.5));
      const totalAwarded = basePoints + speedBonus;
      
      setPoints(prev => prev + totalAwarded);
      setScoreAnimate(true);
      setTimeout(() => setScoreAnimate(false), 500);
      
      const id = Date.now();
      setFloatingPoints(prev => [...prev, { id, value: totalAwarded }]);
      setTimeout(() => {
        setFloatingPoints(prev => prev.filter(p => p.id !== id));
      }, 1000);
    } else {
      soundManager.play('incorrect');
      setMissedQuestions(prev => [...prev, currentQ]);
    }

    // Manual completion/next logic
    if (currentIndex >= questions.length - 1 && !isCorrect) {
       // if it was the last question and incorrect, we still give it a moment
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(null);
      setInputValue('');
      if (questions[currentIndex + 1]) {
        setTimeLeft(30);
        startTimer();
      }
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const correctCount = results.filter(r => r.correct).length;
    
    // Calculate max streak in this session
    let maxStreak = 0;
    let currentStreak = 0;
    results.forEach(r => {
      if (r.correct) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    onComplete(points, correctCount, difficulty, missedQuestions, maxStreak);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[Plus, Minus, Divide, Percent].map((Icon, idx) => (
            <motion.div
              key={idx}
              initial={{ 
                opacity: 0, 
                x: Math.random() * 400 - 200, 
                y: Math.random() * 400 - 200,
                rotate: 0 
              }}
              animate={{ 
                opacity: [0, 1, 0],
                y: [null, Math.random() * -100 - 50],
                rotate: 360,
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                repeat: Infinity,
                delay: idx * 0.5
              }}
              className="absolute text-primary/20"
              style={{ 
                left: `${20 + Math.random() * 60}%`, 
                top: `${40 + Math.random() * 40}%` 
              }}
            >
              <Icon size={32} />
            </motion.div>
          ))}
        </div>

        <div className="relative">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotateZ: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="p-8 bg-gradient-to-br from-primary to-indigo-600 rounded-[2.5rem] text-white shadow-2xl relative z-10"
          >
            <BrainCircuit size={64} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          </motion.div>
          
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-x-0 -bottom-4 h-8 bg-primary/20 blur-3xl -z-10 rounded-full"
          />
        </div>

        <div className="text-center space-y-4 relative z-10">
          <h3 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
            {language === 'en' ? 'Formulating Challenges' : 'চ্যালেঞ্জগুলো তৈরি করা হচ্ছে'}
          </h3>
          <div className="w-64 h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mx-auto">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            {language === 'en' ? 'Synthesizing math puzzles...' : 'গণিত কৌতুকগুলো সমন্বয় করা হচ্ছে...'}
          </p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <AppTooltip content={t.quitQuiz} position="right">
          <button onClick={onCancel} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-1.5 transition-opacity">
            <X size={14} /> {language === 'en' ? 'Quit' : 'বন্ধ করুন'}
          </button>
        </AppTooltip>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="px-2 py-1 bg-muted/10 text-muted rounded-lg text-[10px] font-black uppercase tracking-wider border border-muted/20 animate-pulse">
              {language === 'en' ? 'Checking...' : 'চেক করা হচ্ছে...'}
            </div>
          ) : source === 'ai' ? (
            <AppTooltip content={language === 'en' ? 'Questions generated by Gemini AI' : 'প্রশ্নগুলো জেমিনি AI দ্বারা তৈরি'}>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-xs font-black uppercase tracking-wider border border-indigo-500/20">
                <Dna size={14} className="animate-pulse" />
                AI
              </div>
            </AppTooltip>
          ) : (
            <AppTooltip content={language === 'en' ? 'Switch to AI mode for enhanced questions' : 'উন্নত প্রশ্নের জন্য AI মোড চালু করুন'}>
              <button 
                onClick={() => {
                  if (!quizEngine.getApiKey()) {
                    if (onQuotaExceeded) onQuotaExceeded();
                  } else {
                    fetchQuestions();
                  }
                }}
                className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                disabled={loading}
              >
                <Zap size={10} className="fill-current" />
                Use AI
              </button>
            </AppTooltip>
          )}

          <div className="flex items-center gap-1.5">
            <AppTooltip content={isPaused ? (language === 'en' ? 'Resume Timer' : 'সময় আবার শুরু করুন') : (language === 'en' ? 'Pause Timer' : 'সময় থামান')}>
              <button 
                onClick={handleTogglePause}
                disabled={!!showResult}
                className={`p-1.5 rounded-xl transition-all ${
                  isPaused 
                    ? 'bg-emerald-500 text-white animate-pulse' 
                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                } disabled:opacity-30`}
              >
                {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
              </button>
            </AppTooltip>

            <AppTooltip content={language === 'en' ? 'Time remaining' : 'বাকি সময়'}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-300 border ${
                timeLeft <= 5 
                  ? 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/20' 
                  : isPaused 
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500' 
                    : 'bg-amber-500/5 border-amber-500/10 text-amber-500'
              }`}>
                <Timer size={14} className={timeLeft <= 5 ? 'animate-pulse' : ''} />
                <span className={timeLeft <= 3 && !isPaused ? 'animate-ping' : ''}>{timeLeft}s</span>
              </div>
            </AppTooltip>
          </div>
          
          <AppTooltip content={language === 'en' ? 'Current points' : 'বর্তমান পয়েন্ট'}>
            <div className="relative">
              <motion.div 
                animate={scoreAnimate ? { 
                  scale: [1, 1.2, 1],
                  color: ['#6366f1', '#10b981', '#6366f1'] 
                } : {}}
                className="font-mono text-sm font-black text-primary px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10"
              >
                {points}
              </motion.div>
              
              <AnimatePresence>
                {floatingPoints.map(fp => (
                  <motion.div
                    key={fp.id}
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -40, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex justify-center items-center pointer-events-none"
                  >
                    <span className="text-emerald-500 font-black text-lg whitespace-nowrap">
                      +{fp.value}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </AppTooltip>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative pt-1 px-1">
        <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative shadow-inner p-[1px] border border-black/5 dark:border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="h-full relative bg-gradient-to-r from-primary via-indigo-500 to-emerald-400 rounded-full"
          >
            {/* Glossy top layer */}
            <div className="absolute inset-x-0 top-0 h-[40%] bg-white/20 rounded-full mx-1" />
            
            {/* Animated pulse at the leading edge */}
            <motion.div 
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent"
            />
          </motion.div>
        </div>
        
        {/* Subtle sparkle indicator at the tip */}
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="absolute top-0 -translate-x-1/2 z-10 pointer-events-none"
        >
          <div className="w-5 h-5 bg-primary/20 rounded-full blur-[8px]"></div>
          <div className="w-1.5 h-6 bg-white/40 blur-[1px] -translate-y-1"></div>
        </motion.div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ 
            opacity: isPaused ? 0.2 : 1, 
            x: showResult === 'incorrect' ? [0, -10, 10, -10, 10, 0] : 0, 
            scale: showResult === 'correct' ? 1.02 : isPaused ? 0.98 : 1,
            borderColor: showResult === 'correct' ? 'rgba(16, 185, 129, 0.5)' : showResult === 'incorrect' ? 'rgba(244, 63, 94, 0.5)' : 'var(--border)'
          }}
          transition={{ 
            x: { duration: 0.4, ease: "easeInOut" },
            opacity: { duration: 0.3 },
            scale: { duration: 0.2 }
          }}
          exit={{ opacity: 0, x: -50 }}
          className={`math-card p-6 md:p-8 flex flex-col items-center text-center gap-4 md:gap-6 relative overflow-hidden border-2 transition-all duration-500 ${
            isPaused ? 'grayscale pointer-events-none' : ''
          }`}
        >
          {isPaused && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="p-5 bg-surface rounded-3xl shadow-2xl flex flex-col items-center gap-3 border border-white/10"
               >
                 <Pause size={32} className="text-primary" />
                 <p className="text-lg font-black uppercase tracking-tight">{language === 'en' ? 'Paused' : 'বিরতি'}</p>
                 <button 
                  onClick={handleTogglePause}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
                 >
                   {language === 'en' ? 'Resume' : 'চালু করুন'}
                 </button>
               </motion.div>
            </div>
          )}

          {showResult && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute top-3 right-3 z-20 flex items-center justify-center p-2.5 rounded-xl shadow-lg border pointer-events-none ${
                showResult === 'correct' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {showResult === 'correct' ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span className="font-black text-[10px] uppercase tracking-widest">{language === 'en' ? 'Nice!' : 'সাবাস!'}</span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    <span className="font-black text-[10px] uppercase tracking-widest">{language === 'en' ? 'Oops!' : 'উফ!'}</span>
                  </>
                )}
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg border border-transparent">
              {t[difficulty]}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 px-3 py-1 bg-primary/5 text-primary rounded-lg border border-primary/10">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          
          <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight px-4">
            {renderMathContent(currentQ.question)}
          </h2>

          <div className="grid grid-cols-2 gap-3 w-full">
            {currentQ.type === 'mcq' && currentQ.options?.map((opt, i) => (
              <div key={i} className="relative">
                <AnswerButton 
                  label={renderMathContent(opt) as any}
                  onClick={() => handleAnswer(opt)}
                  active={selectedAnswer === opt}
                  correct={showResult && opt === currentQ.answer}
                  wrong={showResult === 'incorrect' && opt === selectedAnswer}
                  disabled={!!showResult}
                />
                {showResult && opt === currentQ.answer && (
                  <motion.div 
                    initial={{ scale: 0, x: -10 }} 
                    animate={{ scale: 1, x: 0 }}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 text-emerald-500 p-1.5 rounded-full shadow-lg z-10 border-2 border-emerald-500"
                  >
                    <Check size={16} strokeWidth={4} />
                  </motion.div>
                )}
              </div>
            ))}
            {currentQ.type === 'true-false' && [
              { key: 'True', label: t.true },
              { key: 'False', label: t.false }
            ].map((opt) => (
              <div key={opt.key} className="relative">
                <AnswerButton 
                  label={opt.label}
                  onClick={() => handleAnswer(opt.key)}
                  active={selectedAnswer === opt.key}
                  correct={showResult && normalizeStr(opt.key) === normalizeStr(currentQ.answer)}
                  wrong={showResult === 'incorrect' && opt.key === selectedAnswer}
                  disabled={!!showResult}
                />
                {showResult && normalizeStr(opt.key) === normalizeStr(currentQ.answer) && (
                  <motion.div 
                    initial={{ scale: 0, x: -10 }} 
                    animate={{ scale: 1, x: 0 }}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 text-emerald-500 p-1.5 rounded-full shadow-lg z-10 border-2 border-emerald-500"
                  >
                    <Check size={16} strokeWidth={4} />
                  </motion.div>
                )}
              </div>
            ))}
            {(currentQ.type === 'fill-blank' || currentQ.type === 'calculation') && (
              <div className="col-span-full space-y-6">
                <form 
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!showResult && inputValue.trim()) {
                      handleAnswer(inputValue);
                    }
                  }}
                >
                  <div className="relative">
                    <input 
                      ref={inputRef}
                      name="blank-answer"
                      type="text" 
                      inputMode="none"
                      autoFocus
                      autoComplete="off"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className={`w-full text-center text-3xl md:text-4xl p-4 bg-transparent border-b-4 focus:outline-none transition-all duration-300 ${
                        showResult === 'correct' ? 'border-emerald-500 text-emerald-500' : 
                        showResult === 'incorrect' ? 'border-rose-500 text-rose-500' : 'border-primary/30 focus:border-primary'
                      }`}
                      placeholder={currentQ.type === 'calculation' ? (language === 'en' ? "Calculate Result" : "ফলাফল বের করো") : "?"}
                      disabled={!!showResult}
                    />
                    {!showResult && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-primary/30 pointer-events-none"
                      >
                        <ArrowRight size={24} />
                      </motion.div>
                    )}
                  </div>

                  {!showResult && (
                    <NumericKeyboard 
                      onInput={(val) => setInputValue(prev => prev + val)}
                      onDelete={() => setInputValue(prev => prev.slice(0, -1))}
                      onSubmit={() => handleAnswer(inputValue)}
                      language={language}
                    />
                  )}

                  {!showResult && (
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 rounded-2xl bg-primary text-white font-black text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={20} />
                      {language === 'en' ? 'Submit Answer' : 'উত্তর জমা দিন'}
                    </motion.button>
                  )}

                  {showResult === 'incorrect' && (
                    <motion.p 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-rose-500 font-black text-xl flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} />
                      {language === 'en' ? 'Correct Ans:' : 'সঠিক উত্তর:'} {currentQ.answer}
                    </motion.p>
                  )}
                </form>
              </div>
            )}

            {currentQ.type === 'matching' && (
              <div className="col-span-full">
                <motion.div key={currentQ.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <MatchingQuestion 
                    pairs={currentQ.pairs || []}
                    onComplete={(isCorrect) => handleAnswer(isCorrect ? currentQ.answer : 'wrong')}
                    disabled={!!showResult}
                    language={language}
                  />
                </motion.div>
                
                {showResult === 'incorrect' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 font-bold"
                  >
                    <div className="flex items-center gap-2 mb-2">
                       <HelpCircle size={14} />
                       {language === 'en' ? 'Correct Pairings:' : 'সঠিক মিলগুলো:'}
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-[11px] text-left opacity-90 font-medium">
                      {currentQ.answer.split(',').map((pair, idx) => {
                        const [l, r] = pair.includes('=') ? pair.split('=') : pair.includes('-') ? pair.split('-') : [pair, ''];
                        return (
                          <div key={idx} className="flex items-center gap-2 py-0.5 border-b border-rose-500/10 last:border-0">
                            <span className="shrink-0 w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                            <span className="truncate">{l?.trim()}</span>
                            <ArrowRight size={10} className="shrink-0 opacity-50" />
                            <span className="truncate text-rose-700 dark:text-rose-400 font-black">{r?.trim()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showResult && currentQ.explanation && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-2 p-3.5 rounded-xl text-xs text-left w-full border-l-4 shadow-sm ${
                  showResult === 'correct' 
                    ? 'bg-emerald-500/5 border-emerald-500 text-emerald-800 dark:text-emerald-200' 
                    : 'bg-rose-500/5 border-rose-500 text-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-black uppercase tracking-widest opacity-80">
                  <HelpCircle size={12} /> 
                  {language === 'en' ? 'Core Logic' : 'মূল যুক্তি'}
                </div>
                <div className="leading-relaxed font-medium opacity-90 prose-sm dark:prose-invert">
                  {renderMathContent(currentQ.explanation || '')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {showResult && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className={`mt-2 w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 group transition-all ${
                  showResult === 'correct' 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600' 
                    : 'bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600'
                }`}
              >
                {currentIndex < questions.length - 1 
                  ? (language === 'en' ? 'Next' : 'পরবর্তী')
                  : (language === 'en' ? 'Finish' : 'শেষ করুন')
                }
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-2">
        {results.map((r, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${r.correct ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        ))}
      </div>
    </div>
  );
}

function MatchingQuestion({ pairs, onComplete, disabled, language }: { 
  pairs: { left: string; right: string }[];
  onComplete: (correct: boolean) => void;
  disabled: boolean;
  language: 'en' | 'bn';
}) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [incorrectFlash, setIncorrectFlash] = useState<number | null>(null);
  const [lives, setLives] = useState(5); 
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Shuffle items once and keep track of original indices
  const [shuffledLeft] = useState(() => 
    [...pairs.map((p, i) => ({ ...p, originalIndex: i }))].sort(() => Math.random() - 0.5)
  );
  const [shuffledRight] = useState(() => 
    [...pairs.map((p, i) => ({ value: p.right, originalIndex: i }))].sort(() => Math.random() - 0.5)
  );

  const handlePairSelection = (side: 'left' | 'right', index: number) => {
    if (disabled || isEvaluating || lives <= 0) return;

    // Check if item is already matched
    const alreadyMatched = side === 'left' 
      ? !!matches[index] 
      : Object.values(matches).includes(index);
    
    if (alreadyMatched) return;

    if (side === 'left') {
      setSelectedLeft(index === selectedLeft ? null : index);
    } else {
      if (selectedLeft !== null) {
        setIsEvaluating(true);
        
        // Match is correct if original indices match
        if (selectedLeft === index) {
          const newMatches = { ...matches, [selectedLeft]: index };
          setMatches(newMatches);
          setSelectedLeft(null);
          soundManager.play('click');
          setIsEvaluating(false);
          
          if (Object.keys(newMatches).length === pairs.length) {
            onComplete(true);
          }
        } else {
          setIncorrectFlash(index);
          const newLives = lives - 1;
          setLives(newLives);
          soundManager.play('incorrect');
          
          setTimeout(() => {
            setIncorrectFlash(null);
            setSelectedLeft(null);
            setIsEvaluating(false);
            if (newLives <= 0) {
              onComplete(false);
            }
          }, 400);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Lives/Attempts display */}
      {!disabled && (
        <div className="flex justify-center gap-1.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-2 h-2 rounded-full ${i < lives ? 'bg-primary' : 'bg-rose-500/30'}`}
            />
          ))}
          <span className="text-[9px] font-black uppercase tracking-widest text-muted ml-2">
            {language === 'en' ? 'Attempts' : 'চেষ্টা'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:gap-8 w-full mx-auto py-2">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 truncate">
            {language === 'en' ? 'Match' : 'মিল করো'}
          </p>
          {shuffledLeft.map((p, i) => {
            const isMatched = !!matches[p.originalIndex];
            return (
              <motion.button
                key={i}
                whileTap={!disabled && !isMatched ? { scale: 0.95 } : {}}
                onClick={() => handlePairSelection('left', p.originalIndex)}
                disabled={disabled || isMatched || isEvaluating}
                className={`w-full p-3 md:p-4 rounded-xl border-2 font-bold text-xs md:text-sm transition-all text-center h-14 md:h-16 flex items-center justify-center ${
                  isMatched 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                    : selectedLeft === p.originalIndex
                      ? 'border-primary bg-primary text-white shadow-lg'
                      : 'bg-surface border-theme/10 hover:border-primary/30'
                } ${disabled ? 'opacity-50' : ''}`}
              >
                {renderMathContent(p.left)}
                {isMatched && <Check size={14} className="ml-2" />}
              </motion.button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 truncate">
            {language === 'en' ? 'With' : 'সাথে'}
          </p>
          {shuffledRight.map((r, i) => {
            const isMatched = Object.values(matches).includes(r.originalIndex);
            const isIncorrect = incorrectFlash === r.originalIndex;
            
            return (
              <motion.button
                key={i}
                whileTap={!disabled && !isMatched ? { scale: 0.95 } : {}}
                animate={isIncorrect ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                onClick={() => handlePairSelection('right', r.originalIndex)}
                disabled={disabled || isMatched || isEvaluating}
                className={`w-full p-3 md:p-4 rounded-xl border-2 font-bold text-xs md:text-sm transition-all text-center h-14 md:h-16 flex items-center justify-center ${
                  isMatched 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                    : isIncorrect
                      ? 'border-rose-500 bg-rose-500/10 text-rose-600'
                      : 'bg-surface border-theme/10 hover:border-primary/30'
                } ${disabled ? 'opacity-50' : ''}`}
              >
                {renderMathContent(r.value)}
                {isMatched && <CheckCircle2 size={14} className="ml-2" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AnswerButton({ label, onClick, active, correct, wrong, disabled }: { 
  label: React.ReactNode; 
  onClick: () => void; 
  active: boolean;
  correct: boolean;
  wrong: boolean;
  disabled: boolean;
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01, backgroundColor: 'rgba(0,0,0,0.02)', color: 'inherit' } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      animate={wrong ? { x: [0, -3, 3, -3, 3, 0] } : {}}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full p-4 rounded-xl border font-black text-sm transition-all text-center flex items-center justify-center gap-2 min-h-[60px] ${
        correct ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' :
        wrong ? 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/20' :
        active ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-black/10 dark:border-white/10 glass hover:border-primary/40 text-current'
      }`}
    >
      {label}
      {correct && <CheckCircle2 size={18} className="shrink-0" />}
      {wrong && <XCircle size={18} className="shrink-0" />}
    </motion.button>
  );
}

function NumericKeyboard({ onInput, onDelete, onSubmit, language }: { 
  onInput: (digit: string) => void; 
  onDelete: () => void;
  onSubmit: () => void;
  language: 'en' | 'bn';
}) {
  const digitsMap: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };

  const layout = [
    '1', '2', '3', '√',
    '4', '5', '6', '/',
    '7', '8', '9', '-',
    '.', '0', ':', 'backspace'
  ];

  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-[320px] mx-auto mt-4 quiz-keypad">
      {layout.map((key) => {
        if (key === 'backspace') {
          return (
            <motion.button
              key="backspace"
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="h-14 bg-rose-500/5 border border-rose-500/10 text-rose-500 rounded-xl font-black flex items-center justify-center hover:bg-rose-500/10 transition-all shadow-sm"
            >
              <Delete size={22} strokeWidth={3} />
            </motion.button>
          );
        }

        let display: React.ReactNode = language === 'bn' && digitsMap[key] ? digitsMap[key] : key;
        
        if (key === '-') {
          display = <Minus size={22} strokeWidth={3} />;
        } else if (key === '/') {
          display = <Divide size={22} strokeWidth={3} />;
        }

        return (
          <motion.button
            key={key}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onInput(language === 'bn' && digitsMap[key] ? digitsMap[key] : key)}
            className="h-14 bg-surface/50 border border-theme/10 rounded-xl font-black text-xl flex items-center justify-center hover:bg-primary/5 hover:border-primary/20 transition-all shadow-sm"
          >
            {display}
          </motion.button>
        );
      })}
    </div>
  );
}
