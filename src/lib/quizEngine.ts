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
          - Basic: Simple arithmetic (+, -, *, / up to 100).
          - Normal: Middle school math, algebra (e.g., Solve for x), word problems, squares, percentages, and fractions.
          - Hard: High school level, complex multi-step word problems, geometry (area/volume), logic puzzles, and simple calculus/trigonometry concepts.
          
          Question Types:
          - mcq: 4 options.
          - true-false: answer is "True" or "False".
          - fill-blank: a direct number or simple string.
          
          Ensure word problems are included. The "explanation" field should explain HOW to solve it in ${language === 'en' ? 'English' : 'Bengali'}.
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
    const suitableFromCache = cache.filter(q => q.difficulty === difficulty).slice(0, count);
    
    if (suitableFromCache.length >= count) {
      // Shuffle the cache subset so it's not always the same questions if we have extra
      return suitableFromCache.sort(() => Math.random() - 0.5).slice(0, count);
    }

    // 2. If not enough cached questions, generate algorithmically
    return this.generateOffline(difficulty, count);
  },

  generateOffline(difficulty: Difficulty, count: number): Question[] {
    const questions: Question[] = [];
    for (let i = 0; i < count; i++) {
      questions.push(this.createRandomQuestion(difficulty));
    }
    return questions;
  },

  createRandomQuestion(difficulty: Difficulty): Question {
    const id = Math.random().toString(36).substr(2, 9);
    const types: QuestionType[] = ['mcq', 'true-false', 'fill-blank'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (difficulty === 'basic') {
      const category = Math.floor(Math.random() * 4);
      let a, b, answer, op, questionText;

      if (category === 0) { // Addition
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 50) + 10;
        answer = a + b;
        questionText = `${a} + ${b} = ?`;
      } else if (category === 1) { // Subtraction
        a = Math.floor(Math.random() * 100) + 50;
        b = Math.floor(Math.random() * 50) + 1;
        answer = a - b;
        questionText = `${a} - ${b} = ?`;
      } else if (category === 2) { // Multiplication
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        answer = a * b;
        questionText = `${a} × ${b} = ?`;
      } else { // Division
        b = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 10) + 1;
        a = b * answer;
        questionText = `${a} ÷ ${b} = ?`;
      }
      return this.formatOfflineQuestion(id, questionText, answer.toString(), type, difficulty);
    }

    if (difficulty === 'normal') {
      const category = Math.floor(Math.random() * 5);
      if (category === 0) { // Algebra
        const x = Math.floor(Math.random() * 12) + 1;
        const coef = Math.floor(Math.random() * 8) + 2;
        const constVal = Math.floor(Math.random() * 30) - 15;
        const result = coef * x + constVal;
        const sign = constVal >= 0 ? '+' : '-';
        return this.formatOfflineQuestion(id, `Solve for x: ${coef}x ${sign} ${Math.abs(constVal)} = ${result}`, x.toString(), type, difficulty);
      } else if (category === 1) { // Squares/Roots
        const n = Math.floor(Math.random() * 20) + 2;
        const isSquare = Math.random() > 0.5;
        if (isSquare) return this.formatOfflineQuestion(id, `What is ${n} squared?`, (n * n).toString(), type, difficulty);
        return this.formatOfflineQuestion(id, `Square root of ${n * n} is?`, n.toString(), type, difficulty);
      } else if (category === 2) { // Percentages
        const total = [80, 120, 150, 200, 250, 400][Math.floor(Math.random() * 6)];
        const percent = (Math.floor(Math.random() * 15) + 1) * 5;
        const answer = (total * percent) / 100;
        return this.formatOfflineQuestion(id, `Calculate ${percent}% of ${total}`, answer.toString(), type, difficulty);
      } else if (category === 3) { // Fractions
        const den = [4, 5, 8, 10][Math.floor(Math.random() * 4)];
        const num = Math.floor(Math.random() * (den - 1)) + 1;
        const total = den * (Math.floor(Math.random() * 10) + 2);
        const answer = (total / den) * num;
        return this.formatOfflineQuestion(id, `What is ${num}/${den} of ${total}?`, answer.toString(), type, difficulty);
      } else { // Basic Geometry
        const side = Math.floor(Math.random() * 15) + 2;
        const isArea = Math.random() > 0.5;
        if (isArea) return this.formatOfflineQuestion(id, `Area of a square with side ${side}?`, (side * side).toString(), type, difficulty);
        return this.formatOfflineQuestion(id, `Perimeter of a square with side ${side}?`, (side * 4).toString(), type, difficulty);
      }
    }

    // Hard Mode
    const hardCategory = Math.floor(Math.random() * 5);
    if (hardCategory === 0) { // Circle Geometry
      const r = Math.floor(Math.random() * 10) + 2;
      const isCircum = Math.random() > 0.5;
      if (isCircum) return this.formatOfflineQuestion(id, `Circumference of a circle with radius ${r}? (Use π ≈ 3.14)`, (2 * 3.14 * r).toFixed(2), type, difficulty);
      return this.formatOfflineQuestion(id, `Area of a circle with radius ${r}? (Use π ≈ 3.14)`, (3.14 * r * r).toFixed(2), type, difficulty);
    } else if (hardCategory === 1) { // Compound Word Problems
      const p = Math.floor(Math.random() * 500) + 100;
      const d1 = 20;
      const d2 = 10;
      const final = p * (1 - d1/100) * (1 - d2/100);
      return this.formatOfflineQuestion(id, `A $${p} coat is on sale for ${d1}% off. An extra ${d2}% is taken off at the register. What is the final price?`, final.toFixed(2), type, difficulty);
    } else if (hardCategory === 2) { // Simultaneous Equations (Simple)
      const x = Math.floor(Math.random() * 5) + 1;
      const y = Math.floor(Math.random() * 5) + 1;
      const res1 = x + y;
      const res2 = x - y;
      return this.formatOfflineQuestion(id, `If x + y = ${res1} and x - y = ${res2}, what is the value of x?`, x.toString(), type, difficulty);
    } else if (hardCategory === 3) { // Exponents
      const base = 2;
      const exp = Math.floor(Math.random() * 4) + 3;
      return this.formatOfflineQuestion(id, `Calculate ${base} to the power of ${exp}?`, Math.pow(base, exp).toString(), type, difficulty);
    } else { // Averages
      const n1 = Math.floor(Math.random() * 20);
      const n2 = Math.floor(Math.random() * 20);
      const n3 = Math.floor(Math.random() * 20);
      const avg = (n1 + n2 + n3) / 3;
      return this.formatOfflineQuestion(id, `What is the average of ${n1}, ${n2}, and ${n3}? (Round to 2 decimal places)`, avg.toFixed(2), type, difficulty);
    }
  },

  formatOfflineQuestion(id: string, question: string, answer: string, type: QuestionType, difficulty: Difficulty): Question {
    if (type === 'mcq') {
      const ansNum = parseFloat(answer);
      const options = [
        answer,
        isNaN(ansNum) ? "None" : (ansNum + 5).toString(),
        isNaN(ansNum) ? "All" : (ansNum - 3).toString(),
        isNaN(ansNum) ? "Maybe" : (ansNum * 2).toString(),
      ].sort(() => Math.random() - 0.5);
      return { id, question, options, answer, type, difficulty };
    } else if (type === 'true-false') {
      const isTrue = Math.random() > 0.5;
      const displayAns = isTrue ? answer : (parseFloat(answer) + 1).toString();
      return { id, question: `Is it true that: ${question.replace('?', '')} is ${displayAns}?`, answer: isTrue ? 'True' : 'False', type, difficulty };
    }
    return { id, question, answer, type, difficulty };
  }
};
