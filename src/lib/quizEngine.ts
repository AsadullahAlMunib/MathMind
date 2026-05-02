/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { Difficulty, Question, QuestionType } from './types';
import { storage } from './storage';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const quizEngine = {
  async generateQuestions(difficulty: Difficulty, language: 'en' | 'bn', count: number = 5): Promise<Question[]> {
    const isOnline = navigator.onLine && !!process.env.GEMINI_API_KEY;

    if (isOnline) {
      const maxRetries = 2;
      let attempt = 0;

      while (attempt <= maxRetries) {
        try {
          const prompt = `Generate ${count} math questions for ${difficulty} difficulty in ${language === 'en' ? 'English' : 'Bengali'}. 
          Format as JSON array: [{ "id": "uuid", "question": "...", "options": ["...", "..."], "answer": "...", "type": "mcq" | "true-false" | "fill-blank", "difficulty": "${difficulty}", "explanation": "..." }]
          
          Difficulty Guidelines:
          - Basic: Fun and engaging arithmetic (+, -, *, / up to 100). Use some small numbers and some larger ones.
          - Normal: Middle school math, algebra (e.g., Solve for x), creative word problems, squares, percentages, and simple fractions.
          - Hard: Advanced logical math, multi-step problems, geometry, sequences, and clever puzzles.
          
          CRITICAL: Do NOT be repetitive. Avoid common numbers like 15 or 25 if possible. Be creative with word problems.
          
          Question Types:
          - mcq: 4 options.
          - true-false: answer is "True" or "False".
          - fill-blank: a direct number or simple string.
          
          The "explanation" field should explain HOW to solve it in ${language === 'en' ? 'English' : 'Bengali'}.
          If language is Bengali, write all text in Bengali except logical/math symbols.`;

          const result = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-preview',
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          const text = result.text;
          if (!text) throw new Error('Empty AI response');
          const cleanedText = text.replace(/```json|```/g, '').trim();
          const parsedQuestions: Question[] = JSON.parse(cleanedText);
          
          // Cache the AI generated questions for future offline use
          storage.saveToQuestionCache(parsedQuestions);
          
          return parsedQuestions;
        } catch (error: any) {
          attempt++;
          const is429 = error?.message?.includes('429') || error?.status === 429 || error?.code === 429;
          
          if (is429 && attempt <= maxRetries) {
            console.warn(`Gemini 429 detected. Retrying attempt ${attempt}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential-ish backoff
            continue;
          }
          
          console.error('Gemini error, falling back to cache/offline:', error);
          break; // Exit retry loop and fall through to fallback logic
        }
      }
    }

    // Fallback Logic: 
    // 1. Try to find suitable questions in the local cache
    const cache = storage.getQuestionCache();
    const available = cache.filter(q => q.difficulty === difficulty);
    
    if (available.length >= count) {
      // Shuffle the entire available pool and pick random subset
      return available.sort(() => Math.random() - 0.5).slice(0, count);
    }

    // 2. If not enough cached questions, generate algorithmically
    return this.generateOffline(difficulty, count, language);
  },

  generateOffline(difficulty: Difficulty, count: number, language: 'en' | 'bn'): Question[] {
    const questions: Question[] = [];
    for (let i = 0; i < count; i++) {
      questions.push(this.createRandomQuestion(difficulty, language));
    }
    return questions;
  },

  createRandomQuestion(difficulty: Difficulty, language: 'en' | 'bn'): Question {
    const id = Math.random().toString(36).substr(2, 9);
    const types: QuestionType[] = ['mcq', 'true-false', 'fill-blank'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (difficulty === 'basic') {
      const category = Math.floor(Math.random() * 4);
      let a, b, answer, questionText, explanation;

      if (category === 0) { // Addition
        a = Math.floor(Math.random() * 90) + 5;
        b = Math.floor(Math.random() * 90) + 5;
        answer = a + b;
        questionText = `${a} + ${b} = ?`;
        explanation = language === 'en' 
          ? `Add ${a} and ${b} to get ${answer}.` 
          : `${a} এবং ${b} যোগ করলে পাওয়া যায় ${answer}।`;
      } else if (category === 1) { // Subtraction
        a = Math.floor(Math.random() * 100) + 40;
        b = Math.floor(Math.random() * 39) + 1;
        answer = a - b;
        questionText = `${a} - ${b} = ?`;
        explanation = language === 'en'
          ? `Subtract ${b} from ${a} to get ${answer}.`
          : `${a} থেকে ${b} বিয়োগ করলে পাওয়া যায় ${answer}।`;
      } else if (category === 2) { // Multiplication
        a = Math.floor(Math.random() * 15) + 2;
        b = Math.floor(Math.random() * 10) + 2;
        answer = a * b;
        questionText = `${a} × ${b} = ?`;
        explanation = language === 'en'
          ? `Multiply ${a} by ${b} to get ${answer}.`
          : `${a} কে ${b} দিয়ে গুণ করলে পাওয়া যায় ${answer}।`;
      } else { // Division
        b = Math.floor(Math.random() * 12) + 2;
        answer = Math.floor(Math.random() * 12) + 1;
        a = b * answer;
        questionText = `${a} ÷ ${b} = ?`;
        explanation = language === 'en'
          ? `Divide ${a} by ${b} to get ${answer}.`
          : `${a} কে ${b} দিয়ে ভাগ করলে পাওয়া যায় ${answer}।`;
      }
      return this.formatOfflineQuestion(id, questionText, answer.toString(), type, difficulty, explanation);
    }

    if (difficulty === 'normal') {
      const category = Math.floor(Math.random() * 5);
      let questionText, answer, explanation;

      if (category === 0) { // Algebra
        const x = Math.floor(Math.random() * 15) + 1;
        const coef = Math.floor(Math.random() * 9) + 2;
        const constVal = Math.floor(Math.random() * 40) - 20;
        const result = coef * x + constVal;
        const sign = constVal >= 0 ? '+' : '-';
        questionText = language === 'en'
          ? `Solve for x: ${coef}x ${sign} ${Math.abs(constVal)} = ${result}`
          : `x এর মান কত: ${coef}x ${sign} ${Math.abs(constVal)} = ${result}`;
        answer = x.toString();
        explanation = language === 'en'
          ? `Subtract ${constVal} from both sides, then divide by ${coef}.`
          : `উভয় পক্ষ থেকে ${constVal} বিয়োগ করুন, তারপর ${coef} দিয়ে ভাগ করুন।`;
      } else if (category === 1) { // Squares/Roots
        const n = Math.floor(Math.random() * 25) + 2;
        const isSquare = Math.random() > 0.5;
        if (isSquare) {
          questionText = language === 'en' ? `What is ${n} squared?` : `${n} এর বর্গ কত?`;
          answer = (n * n).toString();
          explanation = `${n} × ${n} = ${answer}`;
        } else {
          questionText = language === 'en' ? `Square root of ${n * n} is?` : `${n * n} এর বর্গমূল কত?`;
          answer = n.toString();
          explanation = `√${n * n} = ${n}`;
        }
      } else if (category === 2) { // Percentages
        const total = [50, 80, 100, 120, 150, 200, 300, 500][Math.floor(Math.random() * 8)];
        const percent = (Math.floor(Math.random() * 19) + 1) * 5;
        answer = ((total * percent) / 100).toString();
        questionText = language === 'en' 
          ? `Calculate ${percent}% of ${total}`
          : `${total} এর ${percent}% কত?`;
        explanation = `(${percent} / 100) × ${total} = ${answer}`;
      } else if (category === 3) { // Fractions
        const den = [3, 4, 5, 6, 8, 10][Math.floor(Math.random() * 6)];
        const num = Math.floor(Math.random() * (den - 1)) + 1;
        const multiplier = Math.floor(Math.random() * 10) + 2;
        const total = den * multiplier;
        const ansVal = multiplier * num;
        answer = ansVal.toString();
        questionText = language === 'en' 
          ? `What is ${num}/${den} of ${total}?`
          : `${total} এর ${num}/${den} অংশ কত?`;
        explanation = `(${total} ÷ ${den}) × ${num} = ${answer}`;
      } else { // Basic Geometry
        const side = Math.floor(Math.random() * 20) + 2;
        const isArea = Math.random() > 0.5;
        if (isArea) {
          questionText = language === 'en' ? `Area of a square with side ${side}?` : `${side} বাহু বিশিষ্ট বর্গের ক্ষেত্রফল কত?`;
          answer = (side * side).toString();
          explanation = `${side} × ${side} = ${answer}`;
        } else {
          questionText = language === 'en' ? `Perimeter of a square with side ${side}?` : `${side} বাহু বিশিষ্ট বর্গের পরিসীমা কত?`;
          answer = (side * 4).toString();
          explanation = `${side} × 4 = ${answer}`;
        }
      }
      return this.formatOfflineQuestion(id, questionText, answer, type, difficulty, explanation);
    }

    // Hard Mode - Similar structure with English/Bengali
    const q = this.formatOfflineQuestion(id, "Solve: 2^4 + 5", "21", type, difficulty, "2^4 = 16, 16 + 5 = 21");
    if (language === 'bn') {
      q.question = "সমাধান করো: 2^4 + 5";
      q.explanation = "2^4 = 16, এবং 16 + 5 = 21";
    }
    return q;
  },

  formatOfflineQuestion(id: string, question: string, answer: string, type: QuestionType, difficulty: Difficulty, explanation?: string): Question {
    if (type === 'mcq') {
      const ansNum = parseFloat(answer);
      const options = [
        answer,
        isNaN(ansNum) ? "10" : (ansNum + Math.floor(Math.random() * 5) + 1).toString(),
        isNaN(ansNum) ? "20" : (ansNum - Math.floor(Math.random() * 3) - 1).toString(),
        isNaN(ansNum) ? "30" : (ansNum * 2).toString(),
      ].sort(() => Math.random() - 0.5);
      return { id, question, options, answer, type, difficulty, explanation };
    } else if (type === 'true-false') {
      const isTrue = Math.random() > 0.5;
      const displayAns = isTrue ? answer : (parseFloat(answer) + Math.floor(Math.random() * 5) + 1).toString();
      const qText = `Is it true that: ${question.replace('?', '')} is ${displayAns}?`;
      return { id, question: qText, answer: isTrue ? 'True' : 'False', type, difficulty, explanation };
    }
    return { id, question, answer, type, difficulty, explanation };
  }
};
