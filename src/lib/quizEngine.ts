/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { Difficulty, Question, QuestionType } from './types';
import { storage } from './storage';
import { OFFLINE_TEMPLATES } from './offlineQuestions';

function getAI() {
  const customKey = storage.getApiKey();
  const apiKey = (customKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined))?.trim();
  
  if (!apiKey || apiKey === '' || apiKey === 'undefined' || apiKey === 'null') return null;
  return new GoogleGenAI({ apiKey });
}

// Helper for timeout
const withTimeout = (promise: Promise<any>, timeoutMs: number) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), timeoutMs))
  ]);
};

export const quizEngine = {
  getApiKey() {
    return (storage.getApiKey() || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined))?.trim();
  },

  async generateQuestions(difficulty: Difficulty, language: 'en' | 'bn', count: number = 10): Promise<{ questions: Question[]; source: 'ai' | 'algorithmic' | 'cache' }> {
    const ai = getAI();
    
    // Improved detection: If we have an AI client, we should try it regardless of navigator.onLine which is sometimes unreliable
    const canTryAI = !!ai;

    if (canTryAI) {
      const maxRetries = 1;
      let attempt = 0;

      while (attempt <= maxRetries) {
        try {
          const modelName = difficulty === 'hard' ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';
          // Use exact requested count to avoid timeout on larger batches
          const batchCount = count;
          const randomSeed = Math.random().toString(36).substring(7);
          const timestamp = new Date().getTime();
          
          const prompt = `Generate ${batchCount} UNIQUE and diverse math questions for ${difficulty} difficulty in ${language === 'en' ? 'English' : 'Bengali'}. 
          Randomization Context: ${randomSeed}-${timestamp} (Ensure no repetition from previous sessions).
          
          Topic Variety (Include a mix of these):
          - Arithmetic (percentages, ratios, fractions)
          - Algebra (equations, sequences, word problems)
          - Geometry (area, perimeter, coordinates, property RELATIONSHIPS)
          - Logic & Discovery (number patterns, puzzles, word-based math)
          
          Format as JSON array with items matching this structure: { "id": "uuid", "question": "...", "options": ["...", "..."], "answer": "...", "type": "mcq" | "true-false" | "fill-blank" | "calculation" | "matching", "difficulty": "${difficulty}", "explanation": "...", "pairs": [{ "left": "...", "right": "..." }] }
          
          Constraints:
          - QUESTIONS MUST BE UNIQUE. Do not repeat standard textbook questions exactly.
          - DO NOT include instructions in the question text about how to format the answer (e.g., do not say "write as fraction", "(answer in 5/3 format)", or Bengali versions like "(উত্তর ভগ্নাংশ আকারে লিখুন)").
          - CRITICAL: AVOID extremely simplistic factoid questions (e.g., "How many sides does a triangle have?", "How many angles in a square?", "What is 2+2?").
          - DO NOT repeat the following question: "একটি ত্রিভুজের মোট কয়টি কোণ থাকে?" or its English equivalent.
          - Avoid using the same constant values across multiple questions in the same batch.
          - For matching questions, ensure the 4 pairs are distinct and not repetitive in logic.
          
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
          - CRITICAL: For mathematical expressions (fractions, roots, exponents, trigonometry, identities), ALWAYS wrap them in single dollar signs like $\frac{1}{2}$ or $\sin^2 \theta$.
          - Use standard LaTeX notation (e.g., \\sin^2 \theta + \\cos^2 \theta = 1).
          - MANDATORY: Use DOUBLE BACKSLASHES in the JSON string for all LaTeX commands. A single backslash like \f, \t, or \n will be interpreted as a JSON escape character (form feed, tab, newline) and break the math rendering. ALWAYS use "\\\\frac", "\\\\theta", "\\\\sin", etc.
          - If you use a single backslash followed by an invalid character (like \s or \a), the JSON will FAIL to parse.
          - Do NOT wrap math in markdown code blocks (\` \` \`).
          - Symbols: Use standard LaTeX symbols like \\theta, \\alpha, \\beta, \\pi, \\pm, \\times, \\div.
          - Use Bengali digits (০-৯) for Bengali text, but LaTeX math formulas should preferably use English digits for better rendering ($ \frac{1}{2} $ instead of $ \frac{১}{২} $) unless specified otherwise.
          - Ensure EXACTLY ONE correct answer is in the "options" for MCQ.
          - Keep "explanation" field helpful and in ${language === 'en' ? 'English' : 'Bengali'}.`;

          // Apply 60 second timeout - Bengali math generation can be slow but we want success
          const result = await withTimeout(
            ai!.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                responseMimeType: 'application/json'
              }
            }),
            60000
          );

          const text = result.text;
          if (!text) throw new Error('Empty AI response');
          
          // Robust JSON parsing
          const jsonStart = text.indexOf('[');
          const jsonEnd = text.lastIndexOf(']') + 1;
          
          if (jsonStart === -1 || jsonEnd === 0) {
            console.error('No JSON array found in Gemini response. Full text:', text);
            throw new Error('CORRUPT_AI_RESPONSE');
          }
          
          const cleanedText = text.substring(jsonStart, jsonEnd);
          let parsedQuestions: any[];
          
          try {
            parsedQuestions = JSON.parse(cleanedText);
          } catch (parseError) {
            // Fix unescaped backslashes in LaTeX commands that AI often misses
            // We want to double backslashes that are followed by a word character
            // but are NOT already escaped. 
            // We also specifically target cases like \t \n \f \r \b if they are followed by letters
            // (meaning they were likely meant to be commands like \theta, \frac)
            const fixedText = cleanedText
              .replace(/(^|[^\\])\\(?=[a-zA-Z])/g, '$1\\\\') // Double single backslashes followed by letters
              .replace(/\\([nrtfb])(?=[a-zA-Z])/g, '\\\\$1'); // Fix escaped sequences that are likely commands
            
            try {
              parsedQuestions = JSON.parse(fixedText);
            } catch (secondError) {
              console.error('JSON Fix failed. Original text:', cleanedText);
              console.error('Fixed text:', fixedText);
              throw parseError; // Throw original error for debugging
            }
          }
          
          if (!Array.isArray(parsedQuestions)) {
            throw new Error('INVALID_JSON_STRUCTURE');
          }
          
          // Ensure IDs are unique and sync matching types
          const formattedQuestions = parsedQuestions.map(q => {
             // Strip unwanted formatting instructions the AI sometimes includes
             let question = q.question || '';
             const instructionRegex = /\s*\((?:উত্তর|answer).*?\)\s*$/i;
             question = question.replace(instructionRegex, '').trim();

             const formatted = {
                ...q,
                question,
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
          
          console.error(`Gemini AI Attempt ${attempt} failed:`, error);

          if (is429 || errorMsg === 'AI_TIMEOUT' || errorMsg === 'CORRUPT_AI_RESPONSE' || errorMsg === 'INVALID_JSON_STRUCTURE') {
            // Don't retry on these specific structural/quota/timeout failures to save user time
            break; 
          }
          
          if (attempt <= maxRetries) {
            // Wait slightly longer for retry
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
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
    const templates = OFFLINE_TEMPLATES[difficulty as keyof typeof OFFLINE_TEMPLATES];
    const questions: Question[] = [];
    
    if (templates && templates.length > 0) {
      // Shuffle templates and take 'count' unique ones (or repeat if count > templates.length)
      const shuffled = [...templates].sort(() => Math.random() - 0.5);
      for (let i = 0; i < count; i++) {
        const template = shuffled[i % shuffled.length];
        questions.push(template(language));
      }
    } else {
      // Fallback
      for (let i = 0; i < count; i++) {
        questions.push(this.createRandomQuestion(difficulty, language));
      }
    }
    return questions;
  },

  createRandomQuestion(difficulty: Difficulty, language: 'en' | 'bn'): Question {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Choose type distribution based on difficulty
    const typeProb = Math.random();
    let type: QuestionType;
    
    if (difficulty === 'basic') {
      type = typeProb > 0.9 ? 'matching' : typeProb > 0.6 ? 'true-false' : 'mcq';
    } else if (difficulty === 'normal') {
      type = typeProb > 0.9 ? 'matching' : typeProb > 0.7 ? 'true-false' : typeProb > 0.4 ? 'fill-blank' : 'mcq';
    } else {
      // Hard
      type = typeProb > 0.9 ? 'matching' : typeProb > 0.7 ? 'calculation' : typeProb > 0.4 ? 'fill-blank' : 'mcq';
    }
    
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

    // Hard Mode - Sequence/Logic/Probability/Trig/Calculus/Logs/Sets
    const category = Math.floor(Math.random() * 8);
    let questionText, answer, explanation;
    
    if (category === 0) { // Probability
      const total = 10 + Math.floor(Math.random() * 20);
      const target = 3 + Math.floor(Math.random() * 5);
      questionText = language === 'en' 
        ? `A bag contains ${total} balls: ${target} are red. If 2 balls are drawn without replacement, what is the probability both are red? (as fraction)`
        : `একটি ব্যাগে ${total} টি বল আছে, যার মধ্যে ${target} টি লাল। প্রতিস্থাপন না করে ২টি বল তুললে উভয়ই লাল হওয়ার সম্ভাবনা কত? (ভগ্নাংশে)`;
      
      // P(A and B) = (target/total) * (target-1)/(total-1)
      const num = target * (target - 1);
      const den = total * (total - 1);
      function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
      const common = gcd(num, den);
      answer = `${num/common}/${den/common}`;
      explanation = language === 'en'
        ? `(${target}/${total}) × (${target-1}/${total-1}) = ${num}/${den} = ${answer}`
        : `(${target}/${total}) × (${target-1}/${total-1}) = ${num}/${den} = ${answer}`;
    } else if (category === 1) { // Arithmetic Progression sum
      const a = Math.floor(Math.random() * 5) + 1;
      const d = Math.floor(Math.random() * 4) + 2;
      const n = 10 + Math.floor(Math.random() * 5);
      const last = a + (n - 1) * d;
      const sum = (n / 2) * (a + last);
      questionText = language === 'en'
        ? `Find the sum of first ${n} terms of AP: ${a}, ${a+d}, ${a+2*d}, ...`
        : `সমান্তর ধারাটির প্রথম ${n}টি পদের সমষ্টি কত: ${a}, ${a+d}, ${a+2*d}, ...`;
      answer = sum.toString();
      explanation = `Sₙ = n/2[2a + (n-1)d] = ${n}/2[2(${a}) + (${n}-1)${d}] = ${sum}`;
    } else if (category === 2) { // Quadratic Roots (Complex simple)
      // x^2 + kx + 16 = 0 has equal roots. find positive k
      const root = [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)];
      const prod = root * root;
      const k = 2 * root;
      questionText = language === 'en'
        ? `The equation $x^2 + kx + ${prod} = 0$ has equal roots. What is the positive value of k?`
        : `$x^2 + kx + ${prod} = 0$ সমীকরণের মূলদ্বয় সমান হলে k এর ধনাত্মক মান কত?`;
      answer = k.toString();
      explanation = `For equal roots, Discriminant D = 0. k² - 4(1)(${prod}) = 0. k² = ${4*prod} = ${k}²`;
    } else if (category === 3) { // Trigonometry (Pythagorean)
      const pairs = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const [opp, adj, hyp] = pair.sort(() => Math.random() - 0.5 < 0.5 ? 1 : -1); // Scramble except hyp
      const realHyp = Math.sqrt(opp*opp + adj*adj);
      
      questionText = language === 'en'
        ? `If $\\sin(\\theta) = ${opp}/${realHyp}$, find $\\cos(\\theta)$ in fraction.`
        : `$\\sin(\\theta) = ${opp}/${realHyp}$ হলে, $\\cos(\\theta)$ এর মান ভগ্নাংশে কত?`;
      answer = `${adj}/${realHyp}`;
      explanation = `$\\sin^2 + \\cos^2 = 1$. $\\cos(\\theta) = \\sqrt{1 - (${opp}/${realHyp})^2} = ${adj}/${realHyp}`;
    } else if (category === 4) { // Logarithms
      const base = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
      const x = Math.floor(Math.random() * 4) + 2;
      const val = Math.pow(base, x);
      questionText = language === 'en'
        ? `Solve for x: $\\log_{${base}}(${val}) = x$`
        : `মান বের করো: $\\log_{${base}}(${val}) = x$`;
      answer = x.toString();
      explanation = `${base} to the power of ${x} is ${val}.`;
    } else if (category === 5) { // Sets
      const nA = 15 + Math.floor(Math.random() * 10);
      const nB = 20 + Math.floor(Math.random() * 10);
      const inter = 5 + Math.floor(Math.random() * 5);
      const union = nA + nB - inter;
      questionText = language === 'en'
        ? `In a set, n(A)=${nA}, n(B)=${nB}, and n(A ∩ B)=${inter}. Find n(A ∪ B).`
        : `সেট তত্ত্বে n(A)=${nA}, n(B)=${nB} এবং n(A ∩ B)=${inter} হলে, n(A ∪ B) এর মান কত?`;
      answer = union.toString();
      explanation = `n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = ${nA} + ${nB} - ${inter} = ${union}`;
    } else if (category === 6) { // Calculus (Power Rule)
      const pow = Math.floor(Math.random() * 4) + 2;
      const coeff = Math.floor(Math.random() * 5) + 2;
      questionText = language === 'en'
        ? `Find the derivative of $f(x) = ${coeff}x^{${pow}}$ at $x=1$.`
        : `$f(x) = ${coeff}x^{${pow}}$ হলে, $x=1$ বিন্দুতে অন্তরক (derivative) কত?`;
      answer = (coeff * pow).toString();
      explanation = `f'(x) = ${coeff} * ${pow} * x^{${pow-1}} = ${coeff*pow}x^{${pow-1}}. At x=1, value is ${coeff*pow}`;
    } else { // Permutations simple
      const n = 5 + Math.floor(Math.random() * 3);
      const r = 2;
      // nPr = n! / (n-r)! = n * (n-1)
      const res = n * (n - 1);
      questionText = language === 'en'
        ? `How many ways can ${r} students be seated in a row of ${n} chairs? (${n}P${r})`
        : `${n}টি চেয়ারে ${r}জন ছাত্র কত উপায়ে বিন্যস্ত হতে পারে? (${n}P${r})`;
      answer = res.toString();
      explanation = `${n}P${r} = ${n}! / (${n}-${r})! = ${n} × ${n-1} = ${res}`;
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
          { en: 'Triangle', bn: 'ত্রিভুজ', val: language === 'en' ? '3 Angles' : '৩টি কোণ' },
          { en: 'Square', bn: 'বর্গক্ষেত্র', val: language === 'en' ? '4 Right Angles' : '৪টি সমকোণ' },
          { en: 'Pentagon', bn: 'পঞ্চভুজ', val: language === 'en' ? '5 Vertices' : '৫টি শীর্ষবিন্দু' },
          { en: 'Circle', bn: 'বৃত্ত', val: language === 'en' ? '0 Corners' : '০টি কোণা' },
          { en: 'Hexagon', bn: 'ষড়ভুজ', val: language === 'en' ? '6 Sides' : '৬টি বাহু' },
          { en: 'Octagon', bn: 'অষ্টভুজ', val: language === 'en' ? '8 Sides' : '৮টি বাহু' },
          { en: 'Oval', bn: 'ডিম্বাকৃতি', val: language === 'en' ? 'No Corners' : 'কোন কোণা নেই' }
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
      const options = [answer];
      
      // Handle fractions
      if (answer.includes('/') && answer.split('/').length === 2) {
        const [numStr, denStr] = answer.split('/');
        const n = parseInt(numStr);
        const d = parseInt(denStr);
        options.push(`${n+1}/${d}`, `${n}/${d+1}`, `${n+2}/${d+2}`);
      } else {
        const ansNum = parseFloat(answer);
        if (!isNaN(ansNum)) {
          const step = difficulty === 'basic' ? 1 : 10;
          options.push(
            (ansNum + Math.floor(Math.random() * step) + 1).toString(),
            (ansNum - Math.floor(Math.random() * step) - 1).toString(),
            (ansNum + (Math.random() > 0.5 ? 5 : -5)).toString()
          );
        } else {
          // Strings or symbols
          options.push("10", "20", "None");
        }
      }
      
      const uniqueOptions = Array.from(new Set(options)).sort(() => Math.random() - 0.5);
      // Ensure we have 4 options
      while (uniqueOptions.length < 4) {
        uniqueOptions.push((Math.random() * 100).toFixed(0));
      }
      
      return { id, question, options: uniqueOptions.slice(0, 4), answer, type, difficulty, explanation };
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
