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
  Plus,
  Minus,
  Divide,
  Percent
} from 'lucide-react';

import { Difficulty, Question, QuestionType } from '../lib/types';
import { quizEngine } from '../lib/quizEngine';
import { translations } from '../lib/translations';
import { soundManager } from '../lib/sounds';
import Tooltip from './Tooltip';

interface QuizProps {
  difficulty: Difficulty;
  onComplete: (points: number, correct: number, diff: Difficulty, missed: Question[], streak: number) => void;
  onCancel: () => void;
  language: 'en' | 'bn';
  initialQuestions?: Question[];
}

export default function Quiz({ difficulty, onComplete, onCancel, language, initialQuestions }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!initialQuestions);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine || !process.env.GEMINI_API_KEY);
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [points, setPoints] = useState(0);
  const [scoreAnimate, setScoreAnimate] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<{ id: number; value: number }[]>([]);
  const [missedQuestions, setMissedQuestions] = useState<Question[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language];

  useEffect(() => {
    if (initialQuestions) return;
    async function fetchQuestions() {
      setLoading(true);
      const q = await quizEngine.generateQuestions(difficulty, language, 10);
      setQuestions(q);
      setIsOffline(!navigator.onLine || !process.env.GEMINI_API_KEY || (q.length > 0 && q[0].id.length <= 9)); // Algorithmic IDs are short
      setLoading(false);
      startTimer();
    }
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
    
    // Normalize Bengali digits to English for comparison
    const normalizeDigits = (str: string) => {
      const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return str.split('').map(char => {
        const index = bengaliDigits.indexOf(char);
        return index !== -1 ? index.toString() : char;
      }).join('');
    };

    stopTimer();
    setIsPaused(false);
    setSelectedAnswer(answer);
    const currentQ = questions[currentIndex];
    
    const normalizedInput = normalizeDigits(answer.toLowerCase().trim());
    const normalizedCorrect = normalizeDigits(currentQ.answer.toLowerCase().trim());
    const isCorrect = normalizedInput === normalizedCorrect;
    
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
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <Tooltip content={t.quitQuiz} position="right">
          <button onClick={onCancel} className="text-sm font-medium opacity-60 hover:opacity-100 flex items-center gap-1">
            <X size={16} /> {language === 'en' ? 'Quit Game' : 'খেলা বন্ধ করুন'}
          </button>
        </Tooltip>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Tooltip content={isPaused ? (language === 'en' ? 'Resume Timer' : 'সময় আবার শুরু করুন') : (language === 'en' ? 'Pause Timer' : 'সময় থামান')}>
              <button 
                onClick={handleTogglePause}
                disabled={!!showResult}
                className={`p-2 rounded-full transition-all ${
                  isPaused 
                    ? 'bg-emerald-500 text-white animate-pulse' 
                    : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
                } disabled:opacity-30`}
              >
                {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
              </button>
            </Tooltip>

            <Tooltip content={language === 'en' ? 'Time remaining' : 'বাকি সময়'}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black transition-all duration-300 shadow-sm ${
                timeLeft <= 5 
                  ? 'bg-rose-500 text-white shadow-rose-500/30' 
                  : isPaused 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' 
                    : 'bg-amber-500/10 text-amber-500'
              }`}>
                <Timer size={18} className={timeLeft <= 5 ? 'animate-pulse' : ''} />
                <span className={timeLeft <= 3 && !isPaused ? 'animate-ping' : ''}>{timeLeft}s</span>
              </div>
            </Tooltip>
          </div>
          
          <Tooltip content={language === 'en' ? 'Current points' : 'বর্তমান পয়েন্ট'}>
            <div className="relative">
              <motion.div 
                animate={scoreAnimate ? { 
                  scale: [1, 1.2, 1],
                  color: ['#6366f1', '#10b981', '#6366f1'] 
                } : {}}
                className="font-mono text-xl font-black text-primary px-3 py-1 bg-primary/5 rounded-xl border border-primary/10"
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
          </Tooltip>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary"
        />
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
          className={`math-card p-10 flex flex-col items-center text-center gap-8 relative overflow-hidden border-2 transition-all duration-500 ${
            isPaused ? 'grayscale pointer-events-none' : ''
          }`}
        >
          {isPaused && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl">
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex flex-col items-center gap-4"
               >
                 <Pause size={48} className="text-primary" />
                 <p className="text-xl font-black">{language === 'en' ? 'Game Paused' : 'খেলা থামানো হয়েছে'}</p>
                 <button 
                  onClick={handleTogglePause}
                  className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
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
              className={`absolute top-4 right-4 z-20 flex items-center justify-center p-3 rounded-2xl shadow-xl border-2 pointer-events-none ${
                showResult === 'correct' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
              }`}
            >
              <div className="flex items-center gap-2">
                {showResult === 'correct' ? (
                  <>
                    <CheckCircle2 size={24} />
                    <span className="font-black text-sm">{language === 'en' ? 'Excellent!' : 'চমৎকার!'}</span>
                  </>
                ) : (
                  <>
                    <XCircle size={24} />
                    <span className="font-black text-sm">{language === 'en' ? 'Try Again!' : 'আবার চেষ্টা করুন!'}</span>
                  </>
                )}
              </div>
            </motion.div>
          )}

          <span className="text-xs font-bold uppercase tracking-widest opacity-40 px-3 py-1 border rounded-full">
            {t[difficulty]} • {currentIndex + 1} / {questions.length}
          </span>
          
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">
            {currentQ.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {currentQ.type === 'mcq' && currentQ.options?.map((opt, i) => (
              <div key={i} className="relative">
                <AnswerButton 
                  label={opt}
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
            {currentQ.type === 'true-false' && ['True', 'False'].map((opt) => (
              <div key={opt} className="relative">
                <AnswerButton 
                  label={opt}
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
            {currentQ.type === 'fill-blank' && (
              <form 
                className="col-span-full space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.elements.namedItem('blank-answer') as HTMLInputElement);
                  if (input && !showResult && input.value.trim()) {
                    handleAnswer(input.value);
                  }
                }}
              >
                <div className="relative">
                  <input 
                    name="blank-answer"
                    type="text" 
                    autoFocus
                    autoComplete="off"
                    className={`w-full text-center text-4xl p-4 bg-transparent border-b-4 focus:outline-none transition-all duration-300 ${
                      showResult === 'correct' ? 'border-emerald-500 text-emerald-500' : 
                      showResult === 'incorrect' ? 'border-rose-500 text-rose-500' : 'border-primary/30 focus:border-primary'
                    }`}
                    placeholder="?"
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
            )}
          </div>

          <AnimatePresence>
            {showResult && currentQ.explanation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-2xl text-sm text-left w-full border-l-4 shadow-sm ${
                  showResult === 'correct' 
                    ? 'bg-emerald-500/5 border-emerald-500 text-emerald-800 dark:text-emerald-200' 
                    : 'bg-rose-500/5 border-rose-500 text-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-black uppercase tracking-widest opacity-80">
                  <HelpCircle size={14} /> 
                  {language === 'en' ? 'Logic Breakdown' : 'যুক্তি বিশ্লেষণ'}
                </div>
                <p className="leading-snug font-medium opacity-90">
                  {currentQ.explanation}
                </p>
                {showResult === 'incorrect' && (
                  <div className="mt-2 pt-2 border-t border-rose-500/20 flex items-baseline gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 shrink-0">
                      {language === 'en' ? 'Correct Answer:' : 'সঠিক উত্তর:'}
                    </span>
                    <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                      {currentQ.answer}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {showResult && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className={`mt-6 w-full py-5 rounded-3xl font-black text-xl shadow-2xl flex items-center justify-center gap-3 group transition-all ${
                  showResult === 'correct' 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/40 hover:bg-emerald-600' 
                    : 'bg-rose-500 text-white shadow-rose-500/40 hover:bg-rose-600'
                }`}
              >
                {currentIndex < questions.length - 1 
                  ? (language === 'en' ? 'Next Question' : 'পরবর্তী প্রশ্ন')
                  : (language === 'en' ? 'See Results' : 'ফলাফল দেখুন')
                }
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
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

function AnswerButton({ label, onClick, active, correct, wrong, disabled }: { 
  label: string; 
  onClick: () => void; 
  active: boolean;
  correct: boolean;
  wrong: boolean;
  disabled: boolean;
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, backgroundColor: 'rgba(0,0,0,0.05)', color: 'inherit' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      animate={wrong ? { x: [0, -5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full p-6 rounded-2xl border-2 font-black text-lg transition-all text-center flex items-center justify-center gap-3 ${
        correct ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' :
        wrong ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/20' :
        active ? 'border-primary bg-primary text-white' : 'border-theme glass hover:border-primary/40 text-current'
      }`}
    >
      {label}
      {correct && <CheckCircle2 size={24} className="shrink-0" />}
      {wrong && <XCircle size={24} className="shrink-0" />}
    </motion.button>
  );
}
