/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { Difficulty, Question, QuestionType } from './types';
import { storage } from './storage';

function getAI() {
  const customKey = storage.getApiKey();
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export const quizEngine = {
  async generateQuestions(difficulty: Difficulty, language: 'en' | 'bn', count: number = 10): Promise<{ questions: Question[]; source: 'ai' | 'algorithmic' | 'cache' }> {
    const ai = getAI();
    const isOnline = navigator.onLine && !!ai;

    if (isOnline) {
      const maxRetries = 2;
      let attempt = 0;

      while (attempt <= maxRetries) {
        try {
          const modelName = difficulty === 'hard' ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';
          // Increase request count to build 150-limit cache faster
          const batchCount = Math.max(count, 15);
          
          const prompt = `Generate ${batchCount} math questions for ${difficulty} difficulty in ${language === 'en' ? 'English' : 'Bengali'}. 
          Format as JSON array with items matching this structure: { "id": "uuid", "question": "...", "options": ["...", "..."], "answer": "...", "type": "mcq" | "true-false" | "fill-blank" | "calculation" | "matching", "difficulty": "${difficulty}", "explanation": "...", "pairs": [{ "left": "...", "right": "..." }] }
          
          Types Guidance:
          - mcq: Multiple choice questions (4 options).
          - true-false: True or False answer. The "answer" MUST be exactly "True" or "False".
          - fill-blank: User types the exact answer.
          - calculation: Multi-step arithmetic or complex calculation where the user must provide the numeric result.
          - matching: Provide EXACTLY 4 "pairs" where "left" and "right" are mathematically EQUIVALENT.
          
          Difficulty Details:
          - Basic: 1st-4th grade level. Arithmetic fluency.
          - Normal: 5th-8th grade level. Algebra, fractions, percentages.
          - Hard: 9th-12th grade level. Trigonometry, log, quadratic, etc.
          
          Formatting Rules:
          - For mathematical expressions (especially in 'hard' mode), wrap them in single dollar signs like $x^2$ or $\sin(x)$.
          - Use standard LaTeX notation (e.g., \\sin(30^\\circ), \\frac{1}{2}, x^2, \\sqrt{x}, \\frac{dy}{dx}).
          - Do NOT wrap math in markdown code blocks (\` \` \`).
          - Always use Bengali digits (০-৯) for Bengali questions, but English digits for mathematical formulas is acceptable if standard.
          - Ensure EXACTLY ONE correct answer is in the "options" for MCQ.
          - Keep "explanation" field helpful and in ${language === 'en' ? 'English' : 'Bengali'}.`;

          const result = await ai!.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          const text = result.text;
          if (!text) throw new Error('Empty AI response');
          
          // Clean possible markdown artifacts
          const cleanedText = text.replace(/```json|```/g, '').trim();
          const parsedQuestions: any[] = JSON.parse(cleanedText);
          
          // Ensure IDs are unique and sync matching types
          const formattedQuestions = parsedQuestions.map(q => {
             const formatted = {
                ...q,
                id: q.id || Math.random().toString(36).substring(2, 11)
              };

              // Critical: Sync matching answer key with pairs to prevent developer/AI divergence
              if (formatted.type === 'matching' && formatted.pairs) {
                formatted.answer = formatted.pairs.map((p: any) => `${p.left} = ${p.right}`).join(', ');
              }
              
              return formatted;
          });

          storage.saveToQuestionCache(formattedQuestions);
          return { questions: formattedQuestions.slice(0, count), source: 'ai' };
        } catch (error: any) {
          attempt++;
          const errorMsg = error?.message || '';
          const is429 = errorMsg.includes('429') || errorMsg.includes('Quota exceeded') || error?.status === 429;
          
          if (is429) {
            throw new Error('QUOTA_EXCEEDED');
          }
          
          if (attempt <= maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          console.error('Gemini error:', error);
          break;
        }
      }
    }

    const cache = storage.getQuestionCache();
    const available = cache.filter(q => q.difficulty === difficulty);
    
    if (available.length >= count) {
      const shuffled = available.sort(() => Math.random() - 0.5).slice(0, count);
      return { questions: shuffled, source: 'cache' };
    }

    return { 
      questions: this.generateOffline(difficulty, count, language), 
      source: 'algorithmic' 
    };
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
    const types: QuestionType[] = ['mcq', 'true-false', 'fill-blank', 'calculation'];
    // Add matching occasionally
    if (Math.random() > 0.7) types.push('matching');
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (type === 'matching') {
      return this.generateMatchingQuestion(id, difficulty, language);
    }

    if (difficulty === 'basic') {
      const category = Math.floor(Math.random() * 6);
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
      } else if (category === 3) { // Division
        b = Math.floor(Math.random() * 12) + 2;
        answer = Math.floor(Math.random() * 12) + 1;
        a = b * answer;
        questionText = `${a} ÷ ${b} = ?`;
        explanation = language === 'en'
          ? `Divide ${a} by ${b} to get ${answer}.`
          : `${a} কে ${b} দিয়ে ভাগ করলে পাওয়া যায় ${answer}।`;
      } else if (category === 4) { // Multi-step (for calculation type)
        a = Math.floor(Math.random() * 10) + 2;
        b = Math.floor(Math.random() * 5) + 1;
        const c = Math.floor(Math.random() * 20) + 1;
        answer = a * b + c;
        questionText = `(${a} × ${b}) + ${c} = ?`;
        explanation = `First ${a} × ${b} = ${a*b}, then ${a*b} + ${c} = ${answer}.`;
      } else { // Number Comparison
        a = Math.floor(Math.random() * 100);
        b = Math.floor(Math.random() * 100);
        questionText = language === 'en' ? `Which is larger: ${a} or ${b}?` : `কোনটি বড়: ${a} নাকি ${b}?`;
        answer = a > b ? a.toString() : b.toString();
        explanation = a > b ? `${a} > ${b}` : `${b} > ${a}`;
      }
      return this.formatOfflineQuestion(id, questionText, answer.toString(), type, difficulty, language, explanation);
    }

    if (difficulty === 'normal') {
      const category = Math.floor(Math.random() * 7);
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
          ? `Isolate x: ${coef}x = ${result} ${constVal >= 0 ? '-' : '+'} ${Math.abs(constVal)} = ${coef * x}. Then x = ${x}.`
          : `x কে আলাদা করুন: ${coef}x = ${result} ${constVal >= 0 ? '-' : '+'} ${Math.abs(constVal)} = ${coef * x}। সুতরাং x = ${x}।`;
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
      } else if (category === 4) { // Basic Geometry
        const side = Math.floor(Math.random() * 20) + 2;
        const isArea = Math.random() > 0.5;
        if (isArea) {
          questionText = language === 'en' ? `Area of a square with side ${side}?` : `${side} বাহু বিশিষ্ট বর্গের ক্ষেত্রফল কত?`;
          answer = (side * side).toString();
          explanation = `${side} × ${side} = ${answer}`;
        } else {
          const w = Math.floor(Math.random() * 15) + 5;
          const h = Math.floor(Math.random() * 10) + 2;
          questionText = language === 'en' ? `Perimeter of a rectangle ${w}x${h}?` : `${w}x${h} আয়তক্ষেত্রের পরিসীমা কত?`;
          answer = (2 * (w + h)).toString();
          explanation = `2 × (${w} + ${h}) = ${answer}`;
        }
      } else if (category === 5) { // Mean
        const vals = [Math.floor(Math.random()*20), Math.floor(Math.random()*20), Math.floor(Math.random()*20)];
        const sum = vals.reduce((a, b) => a + b, 0);
        questionText = language === 'en' ? `Average of ${vals.join(', ')}?` : `${vals.join(', ')} এর গড় কত?`;
        answer = (sum / vals.length).toFixed(1).replace('.0', '');
        explanation = `(${vals.join(' + ')}) / ${vals.length} = ${answer}`;
      } else { // Ratios
        const r1 = Math.floor(Math.random() * 5) + 1;
        const r2 = Math.floor(Math.random() * 5) + 1;
        const factor = Math.floor(Math.random() * 10) + 5;
        const total = (r1 + r2) * factor;
        questionText = language === 'en' 
          ? `Divide ${total} in ratio ${r1}:${r2}. Larger part?`
          : `${total} কে ${r1}:${r2} অনুপাতে ভাগ করলে বড় অংশটি কত?`;
        answer = (Math.max(r1, r2) * factor).toString();
        explanation = `Total parts = ${r1}+${r2}=${r1+r2}. One part = ${total}/${r1+r2}=${factor}. Result = ${Math.max(r1,r2)}*${factor}=${answer}`;
      }
      return this.formatOfflineQuestion(id, questionText, answer, type, difficulty, language, explanation);
    }

    // Hard Mode - Sequence/Logic/Probability/Trig
    const category = Math.floor(Math.random() * 5);
    let questionText, answer, explanation;
    
    if (category === 0) { // Probability
      const total = 10 + Math.floor(Math.random() * 20);
      const target = 3 + Math.floor(Math.random() * 5);
      questionText = language === 'en' 
        ? `Probability of drawing one of ${target} red balls from ${total} total balls? (as fraction)`
        : `${total} টি বলের মধ্যে ${target} টি লাল বল থাকলে, একটি বল তুললে সেটি লাল হওয়ার সম্ভাবনা কত? (ভগ্নাংশে)`;
      answer = `${target}/${total}`;
      explanation = `Required outcomes / Total outcomes = ${target}/${total}`;
    } else if (category === 1) { // Sequences
      const start = Math.floor(Math.random() * 10);
      const diff = Math.floor(Math.random() * 5) + 2;
      const n = 5 + Math.floor(Math.random() * 3);
      answer = (start + (n - 1) * diff).toString();
      questionText = language === 'en'
        ? `What is the ${n}th term of the sequence: ${start}, ${start+diff}, ${start+diff*2}, ...?`
        : `ধারাটির ${n}তম পদ কত: ${start}, ${start+diff}, ${start+diff*2}, ...?`;
      explanation = `a + (n-1)d = ${start} + (${n}-1)${diff} = ${answer}`;
    } else if (category === 2) { // Quadratic simple
      // (x - a)(x - b) = x^2 - (a+b)x + ab
      const a = Math.floor(Math.random() * 6) + 1;
      const b = Math.floor(Math.random() * 6) + 1;
      const sum = a + b;
      const prod = a * b;
      questionText = language === 'en'
        ? `Find the positive root of x² - ${sum}x + ${prod} = 0`
        : `x² - ${sum}x + ${prod} = 0 সমীকরণের ধনাত্মক মূল কি?`;
      answer = Math.max(a, b).toString();
      explanation = `Factors: (x - ${a})(x - ${b}) = 0. Roots are ${a} and ${b}.`;
    } else if (category === 3) { // Trig
      const angles = [30, 45, 60];
      const angle = angles[Math.floor(Math.random() * 3)];
      const side = 10 * (Math.floor(Math.random() * 5) + 1);
      if (angle === 30) {
        questionText = language === 'en' ? `Hypotenuse of triangle with angle 30° and opposite side ${side}?` : `একটি ত্রিভুজের কোণ ৩০° এবং বিপরীত বাহু ${side} হলে অতিভুজ কত?`;
        answer = (side * 2).toString();
        explanation = `sin(30°) = 0.5 = ${side} / H. So H = ${side} / 0.5 = ${side * 2}`;
      } else {
        questionText = language === 'en' ? `Solve: log₂(${Math.pow(2, 5)}) = ?` : `মান বের করো: log₂(${Math.pow(2, 5)}) = ?`;
        answer = "5";
        explanation = `2^5 = 32, so log₂(32) = 5`;
      }
    } else {
      questionText = language === 'en' ? "What is the next prime after 13?" : "১৩ এর পরবর্তী মৌলিক সংখ্যা কোনটি?";
      answer = "17";
      explanation = "Primes: 2, 3, 5, 7, 11, 13, 17...";
    }

    return this.formatOfflineQuestion(id, questionText, answer, type, difficulty, language, explanation);
  },

  generateMatchingQuestion(id: string, difficulty: Difficulty, language: 'en' | 'bn'): Question {
    const pairs: { left: string, right: string }[] = [];
    if (difficulty === 'basic') {
      const type = Math.floor(Math.random() * 3);
      if (type === 0) { // Numbers vs Words
        const items = [
          { n: '10', en: 'Ten', bn: 'দশ' },
          { n: '8', en: 'Eight', bn: 'আট' },
          { n: '5', en: 'Five', bn: 'পাঁচ' },
          { n: '2', en: 'Two', bn: 'দুই' },
          { n: '1', en: 'One', bn: 'এক' },
          { n: '4', en: 'Four', bn: 'চার' },
          { n: '6', en: 'Six', bn: 'ছয়' },
          { n: '7', en: 'Seven', bn: 'সাত' },
          { n: '9', en: 'Nine', bn: 'নয়' }
        ].sort(() => Math.random() - 0.5).slice(0, 4);
        
        items.forEach(item => {
          const left = language === 'bn' ? this.toBengaliDigits(item.n) : item.n;
          pairs.push({ left: left, right: language === 'en' ? item.en : item.bn });
        });
      } else if (type === 1) { // Simple Addition
        const start = Math.floor(Math.random() * 10);
        for (let i = 0; i < 4; i++) {
          const a = start + i;
          const b = Math.floor(Math.random() * 5) + 1;
          pairs.push({ left: `${a} + ${b}`, right: (a + b).toString() });
        }
      } else { // Shape names vs Sides
        const items = [
          { en: 'Triangle', bn: 'ত্রিভুজ', val: language === 'en' ? '3 Sides' : '৩টি বাহু' },
          { en: 'Square', bn: 'বর্গক্ষেত্র', val: language === 'en' ? '4 equal Sides' : '৪টি সমান বাহু' },
          { en: 'Pentagon', bn: 'পঞ্চভুজ', val: language === 'en' ? '5 Sides' : '৫টি বাহু' },
          { en: 'Circle', bn: 'বৃত্ত', val: language === 'en' ? 'No Sides' : 'কোন বাহু নেই' },
          { en: 'Rectangle', bn: 'আয়তক্ষেত্র', val: language === 'en' ? '4 Sides' : '৪টি বাহু' }
        ].sort(() => Math.random() - 0.5).slice(0, 4);
        
        items.forEach(item => {
          pairs.push({ left: language === 'en' ? item.en : item.bn, right: item.val });
        });
      }
    } else if (difficulty === 'normal') {
      const type = Math.floor(Math.random() * 2);
      if (type === 0) { // Squares
        const start = Math.floor(Math.random() * 10) + 2;
        for (let i = 0; i < 4; i++) {
          const n = start + i;
          pairs.push({ left: `${n}²`, right: (n * n).toString() });
        }
      } else { // Formulas
        const items = [
          { left: 'Area of Rectangle', bn: 'আয়তক্ষেত্রের ক্ষেত্রফল', right: 'L × W' },
          { left: 'Area of Square', bn: 'বর্গের ক্ষেত্রফল', right: 'side²' },
          { left: 'Perimeter of Rectangle', bn: 'আয়তক্ষেত্রের পরিসীমা', right: '2(L+W)' },
          { left: 'Area of Triangle', bn: 'ত্রিভুজের ক্ষেত্রফল', right: '½ × b × h' }
        ];
        items.forEach(item => {
          pairs.push({ left: language === 'en' ? item.left : item.bn, right: item.right });
        });
      }
    } else {
      const items = [
        { en: 'Square Area', bn: 'বর্গের ক্ষেত্রফল', val: 'a²' },
        { en: 'Circle Area', bn: 'বৃত্তের ক্ষেত্রফল', val: 'πr²' },
        { en: 'Triangle Area', bn: 'ত্রিভুজের ক্ষেত্রফল', val: '½bh' },
        { en: 'Sphere Volume', bn: 'গোলকের আয়তন', val: '⁴/₃πr³' },
        { en: 'Pythagorean', bn: 'পিথাগোরাস', val: 'a²+b²=c²' }
      ].sort(() => Math.random() - 0.5).slice(0, 4);
      items.forEach(item => {
        pairs.push({ left: language === 'en' ? item.en : item.bn, right: item.val });
      });
    }

    const answer = pairs.map(p => `${p.left} = ${p.right}`).join(', ');
    const question = language === 'en' ? 'Match the correct pairs:' : 'নিচের সঠিক জোড়াগুলো মেলাও:';
    return { id, question, answer, type: 'matching', difficulty, pairs };
  },

  toBengaliDigits(n: string | number): string {
    const s = n.toString();
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return s.split('').map(c => {
      const d = parseInt(c);
      return isNaN(d) ? c : bengaliDigits[d];
    }).join('');
  },

  formatOfflineQuestion(id: string, question: string, answer: string, type: QuestionType, difficulty: Difficulty, language: 'en' | 'bn', explanation?: string): Question {
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
      const qText = language === 'en' 
        ? `Is it true that: ${question.replace('?', '')} is ${displayAns}?`
        : `এটি কি সত্য: ${question.replace('?', '')} এর মান কি ${displayAns}?`;
      return { id, question: qText, answer: isTrue ? 'True' : 'False', type, difficulty, explanation: explanation || `Value is ${isTrue ? '' : 'not '}${displayAns}` };
    }
    return { id, question, answer, type, difficulty, explanation };
  }
};
