/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { Difficulty, Question, QuestionType } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const quizEngine = {
  async generateQuestions(difficulty: Difficulty, language: 'en' | 'bn', count: number = 5): Promise<Question[]> {
    const isOnline = navigator.onLine && !!process.env.GEMINI_API_KEY;

    if (isOnline) {
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
          model: 'gemini-2.0-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = result.text;
        if (!text) throw new Error('Empty AI response');
        const cleanedText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedText);
      } catch (error) {
        console.error('Gemini error, falling back to offline:', error);
        return this.generateOffline(difficulty, count);
      }
    }

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
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const ops = ['+', '-', '*'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let answer: number;
      
      switch(op) {
        case '+': answer = a + b; break;
        case '-': answer = a - b; break;
        case '*': answer = Math.floor(a/2) * (b % 10); break;
        default: answer = a + b;
      }

      const questionText = `${a} ${op} ${b} = ?`;
      return this.formatOfflineQuestion(id, questionText, answer.toString(), type, difficulty);
    }

    if (difficulty === 'normal') {
      const category = Math.floor(Math.random() * 3);
      if (category === 0) { // Algebra
        const x = Math.floor(Math.random() * 10) + 1;
        const coef = Math.floor(Math.random() * 5) + 2;
        const constVal = Math.floor(Math.random() * 20);
        const result = coef * x + constVal;
        return this.formatOfflineQuestion(id, `Solve for x: ${coef}x + ${constVal} = ${result}`, x.toString(), type, difficulty);
      } else if (category === 1) { // Squares/Roots
        const n = Math.floor(Math.random() * 15) + 2;
        const isSquare = Math.random() > 0.5;
        if (isSquare) return this.formatOfflineQuestion(id, `What is ${n} squared?`, (n * n).toString(), type, difficulty);
        return this.formatOfflineQuestion(id, `Square root of ${n * n} is?`, n.toString(), type, difficulty);
      } else { // Percentages
        const total = [100, 200, 50, 500][Math.floor(Math.random() * 4)];
        const percent = (Math.floor(Math.random() * 10) + 1) * 10;
        const answer = (total * percent) / 100;
        return this.formatOfflineQuestion(id, `What is ${percent}% of ${total}?`, answer.toString(), type, difficulty);
      }
    }

    // Hard Mode
    const hardCategory = Math.floor(Math.random() * 3);
    if (hardCategory === 0) { // Geometry
      const r = Math.floor(Math.random() * 5) + 2;
      return this.formatOfflineQuestion(id, `Area of a circle with radius ${r} (Use π ≈ 3.14)`, (3.14 * r * r).toFixed(2), type, difficulty);
    } else if (hardCategory === 1) { // Word Problems
      const p = Math.floor(Math.random() * 100) + 50;
      const d = Math.floor(Math.random() * 20) + 5;
      const final = p - (p * d / 100);
      return this.formatOfflineQuestion(id, `An item costs $${p}. If it is on ${d}% discount, what is the new price?`, final.toFixed(2), type, difficulty);
    } else { // Complex Algebra
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const x = 2;
      const result = a * x * x + b * x;
      return this.formatOfflineQuestion(id, `If f(x) = ${a}x² + ${b}x, what is f(2)?`, result.toString(), type, difficulty);
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
