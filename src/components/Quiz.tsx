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
  X
} from 'lucide-react';

import { Difficulty, Question, QuestionType } from '../lib/types';
import { quizEngine } from '../lib/quizEngine';
import { translations } from '../lib/translations';

interface QuizProps {
  difficulty: Difficulty;
  onComplete: (points: number, correct: number, diff: Difficulty, missed: Question[]) => void;
  onCancel: () => void;
  language: 'en' | 'bn';
  initialQuestions?: Question[];
}

export default function Quiz({ difficulty, onComplete, onCancel, language, initialQuestions }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!initialQuestions);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [points, setPoints] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<Question[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language];

  useEffect(() => {
    if (initialQuestions) return;
    async function fetchQuestions() {
      setLoading(true);
      const q = await quizEngine.generateQuestions(difficulty, language, 10);
      setQuestions(q);
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
    if (timeLeft === 0 && !showResult) {
      handleAnswer('');
    }
  }, [timeLeft]);

  const startTimer = () => {
    setTimeLeft(difficulty === 'hard' ? 20 : 30);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    stopTimer();
    setSelectedAnswer(answer);
    const currentQ = questions[currentIndex];
    const isCorrect = answer.toLowerCase().trim() === currentQ.answer.toLowerCase().trim();
    
    setShowResult(isCorrect ? 'correct' : 'incorrect');
    setResults(prev => [...prev, { id: currentQ.id, correct: isCorrect }]);
    
    if (!isCorrect) {
      setMissedQuestions(prev => [...prev, currentQ]);
    }

    if (isCorrect) {
      const basePoints = difficulty === 'basic' ? 10 : difficulty === 'normal' ? 25 : 50;
      const speedBonus = Math.floor(timeLeft * (difficulty === 'hard' ? 2.5 : 1.5));
      setPoints(prev => prev + basePoints + speedBonus);
    }

    // Auto-advance after showing explanation/result
    const delay = currentQ.explanation ? 4000 : 2000;
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(null);
        if (questions[currentIndex + 1]) {
           startTimer();
        }
      } else {
        finishQuiz();
      }
    }, delay);
  };

  const finishQuiz = () => {
    const correctCount = results.filter(r => r.correct).length;
    onComplete(points, correctCount, difficulty, missedQuestions);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-4 bg-primary rounded-full text-white"
        >
          <Dna size={48} />
        </motion.div>
        <p className="text-xl font-bold animate-pulse">Generating your math challenges...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-sm font-medium opacity-60 hover:opacity-100 flex items-center gap-1">
          <X size={16} /> Quit Game
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-sm font-bold">
            <Timer size={16} />
            <span className={timeLeft < 5 ? 'animate-ping' : ''}>{timeLeft}s</span>
          </div>
          <div className="font-mono text-lg font-bold text-primary">
            {points} pts
          </div>
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
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="math-card p-10 flex flex-col items-center text-center gap-8 relative overflow-hidden border-2 border-theme"
        >
          {showResult && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm ${
                showResult === 'correct' ? 'bg-emerald-500/5' : 'bg-rose-500/5'
              }`}
            >
              <div className={`p-4 rounded-full ${showResult === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'} text-white shadow-2xl`}>
                {showResult === 'correct' ? <Check size={48} strokeWidth={4} /> : <X size={48} strokeWidth={4} />}
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
              <AnswerButton 
                key={i}
                label={opt}
                onClick={() => handleAnswer(opt)}
                active={selectedAnswer === opt}
                correct={showResult && opt === currentQ.answer}
                wrong={showResult === 'incorrect' && opt === selectedAnswer}
                disabled={!!showResult}
              />
            ))}
            {currentQ.type === 'true-false' && ['True', 'False'].map((opt) => (
              <AnswerButton 
                key={opt}
                label={opt}
                onClick={() => handleAnswer(opt)}
                active={selectedAnswer === opt}
                correct={showResult && opt === currentQ.answer}
                wrong={showResult === 'incorrect' && opt === selectedAnswer}
                disabled={!!showResult}
              />
            ))}
            {currentQ.type === 'fill-blank' && (
              <div className="col-span-full space-y-4">
                <input 
                  type="text" 
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                       handleAnswer((e.currentTarget as HTMLInputElement).value);
                       (e.currentTarget as HTMLInputElement).value = '';
                    }
                  }}
                  className={`w-full text-center text-4xl p-4 bg-transparent border-b-4 focus:outline-none transition-colors ${
                    showResult === 'correct' ? 'border-emerald-500 text-emerald-500' : 
                    showResult === 'incorrect' ? 'border-rose-500 text-rose-500' : 'border-primary'
                  }`}
                  placeholder="?"
                  disabled={!!showResult}
                />
                {showResult === 'incorrect' && (
                  <p className="text-rose-500 font-bold animate-bounce">
                    Ans: {currentQ.answer}
                  </p>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showResult && currentQ.explanation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`mt-4 p-4 rounded-2xl text-sm italic text-left w-full border border-current bg-opacity-5 ${
                  showResult === 'correct' ? 'text-emerald-600 bg-emerald-500' : 'text-rose-600 bg-rose-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 font-bold">
                  <HelpCircle size={14} /> 
                  {language === 'en' ? 'Explanation' : 'ব্যাখ্যা'}
                </div>
                {currentQ.explanation}
              </motion.div>
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
      whileHover={!disabled ? { scale: 1.02, backgroundColor: 'var(--primary)', color: 'white' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`p-6 rounded-2xl border-2 font-bold text-lg transition-all text-center ${
        correct ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' :
        wrong ? 'bg-rose-500 border-rose-500 text-white shadow-lg' :
        active ? 'border-primary bg-primary text-white' : 'border-theme glass hover:border-primary/40'
      }`}
    >
      {label}
    </motion.button>
  );
}
