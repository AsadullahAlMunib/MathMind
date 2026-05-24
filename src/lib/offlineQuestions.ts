import { Difficulty, Question, QuestionType } from '../lib/types';

export interface QuestionTemplate {
  id: string;
  difficulty: Difficulty;
  generator: (language: 'en' | 'bn') => Question;
}

const toBengaliDigits = (n: string | number): string => {
  const s = n.toString();
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return s.split('').map(c => {
    const d = parseInt(c);
    return isNaN(d) ? c : bengaliDigits[d];
  }).join('');
};

const formatValue = (val: string | number, language: 'en' | 'bn'): string => {
  if (language === 'en') return val.toString();
  const s = val.toString();
  // Don't convert if it looks like LaTeX or has math ops
  if (s.includes('$') || s.includes('\\') || s.includes('^')) return s;
  return toBengaliDigits(s);
};

const formatOptionValue = (val: string, language: 'en' | 'bn'): string => {
  if (language === 'en') return val;
  // Convert simple numbers, decimals, fractions and comma separated numbers for Bengali
  if (/^[0-9.\-\/ ,{}°]+$/.test(val)) {
    return toBengaliDigits(val);
  }
  return val;
};

const createMCQOptions = (answer: string, difficulty: Difficulty, language: 'en' | 'bn'): string[] => {
  const options = [answer];
  const ansNum = parseFloat(answer);
  
  if (!isNaN(ansNum)) {
    const range = difficulty === 'basic' ? 5 : difficulty === 'normal' ? 20 : 50;
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * range) + 1;
      const opt = (Math.random() > 0.5 ? ansNum + offset : ansNum - offset).toString();
      if (!options.includes(opt)) options.push(opt);
    }
  } else {
    const fallbacks = ["10", "25", "50", "None", "0", "1"];
    while (options.length < 4) {
      const opt = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      if (!options.includes(opt)) options.push(opt);
    }
  }
  
  return options
    .sort(() => Math.random() - 0.5)
    .map(opt => formatOptionValue(opt, language));
};

// --- BASIC TEMPLATES (20) ---
const basicTemplates: ((language: 'en' | 'bn') => Question)[] = [
  // 1. Addition
  (lang) => {
    const a = Math.floor(Math.random() * 50) + 10;
    const b = Math.floor(Math.random() * 50) + 10;
    const ans = (a + b).toString();
    return {
      id: `b1-${Math.random()}`,
      question: lang === 'en' ? `What is ${a} + ${b}?` : `${formatValue(a, lang)} + ${formatValue(b, lang)} = কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'basic', lang),
      difficulty: 'basic',
      explanation: lang === 'en' ? `Adding ${a} and ${b} gives ${ans}.` : `${formatValue(a, lang)} এবং ${formatValue(b, lang)} যোগ করলে হয় ${formatValue(ans, lang)}।`
    };
  },
  // 2. Subtraction
  (lang) => {
    const a = Math.floor(Math.random() * 100) + 50;
    const b = Math.floor(Math.random() * 40) + 10;
    const ans = (a - b).toString();
    return {
      id: `b2-${Math.random()}`,
      question: lang === 'en' ? `What is ${a} - ${b}?` : `${formatValue(a, lang)} - ${formatValue(b, lang)} = কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'basic', lang),
      difficulty: 'basic',
      explanation: lang === 'en' ? `Subtracting ${b} from ${a} gives ${ans}.` : `${formatValue(a, lang)} থেকে ${formatValue(b, lang)} বিয়োগ করলে হয় ${formatValue(ans, lang)}।`
    };
  },
  // 3. Simple Multiplication
  (lang) => {
    const a = Math.floor(Math.random() * 10) + 2;
    const b = Math.floor(Math.random() * 10) + 2;
    const ans = (a * b).toString();
    return {
      id: `b3-${Math.random()}`,
      question: lang === 'en' ? `What is ${a} × ${b}?` : `${formatValue(a, lang)} × ${formatValue(b, lang)} = কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'basic', lang),
      difficulty: 'basic',
      explanation: lang === 'en' ? `Multiplying ${a} and ${b} gives ${ans}.` : `${formatValue(a, lang)} এবং ${formatValue(b, lang)} গুণ করলে হয় ${formatValue(ans, lang)}।`
    };
  },
  // 4. Simple Division
  (lang) => {
    const b = Math.floor(Math.random() * 9) + 2;
    const ans = Math.floor(Math.random() * 10) + 1;
    const a = b * ans;
    return {
      id: `b4-${Math.random()}`,
      question: lang === 'en' ? `What is ${a} ÷ ${b}?` : `${formatValue(a, lang)} ÷ ${formatValue(b, lang)} = কত?`,
      answer: ans.toString(),
      type: 'mcq',
      options: createMCQOptions(ans.toString(), 'basic', lang),
      difficulty: 'basic',
      explanation: lang === 'en' ? `${a} divided by ${b} is ${ans}.` : `${formatValue(a, lang)} কে ${formatValue(b, lang)} দিয়ে ভাগ করলে হয় ${formatValue(ans, lang)}।`
    };
  },
  // 5. Comparison
  (lang) => {
    const a = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 100);
    const ans = a > b ? 'True' : 'False';
    return {
      id: `b5-${Math.random()}`,
      question: lang === 'en' ? `Is ${a} greater than ${b}?` : `${formatValue(a, lang)} কি ${formatValue(b, lang)} এর চেয়ে বড়?`,
      answer: ans,
      type: 'true-false',
      difficulty: 'basic',
      explanation: lang === 'en' ? `${a} is ${a > b ? '' : 'not '}greater than ${b}.` : `${formatValue(a, lang)}, ${formatValue(b, lang)} এর চেয়ে ${a > b ? 'বড়' : 'বড় নয়'}।`
    };
  },
  // 6. Missing Number
  (lang) => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = a + 2;
    const c = b + 2;
    const ans = b.toString();
    return {
      id: `b6-${Math.random()}`,
      question: lang === 'en' ? `Complete the pattern: ${a}, ?, ${c}` : `প্যাটার্নটি পূরণ করুন: ${formatValue(a, lang)}, ?, ${formatValue(c, lang)}`,
      answer: ans,
      type: 'fill-blank',
      difficulty: 'basic',
      explanation: lang === 'en' ? `The numbers increase by 2.` : `সংখ্যাগুলো ২ করে বাড়ছে।`
    };
  },
  // 7. Time (Hours)
  (lang) => {
    const h = Math.floor(Math.random() * 12) + 1;
    const next = (h % 12) + 1;
    return {
      id: `b7-${Math.random()}`,
      question: lang === 'en' ? `If it is ${h}:00 now, what time will it be in 1 hour?` : `এখন যদি ${formatValue(h, lang)}টা বাজে, তবে ১ ঘণ্টা পর কয়টা বাজবে?`,
      answer: next.toString(),
      type: 'mcq',
      options: createMCQOptions(next.toString(), 'basic', lang),
      difficulty: 'basic',
      explanation: lang === 'en' ? `${h} + 1 = ${next}` : `${formatValue(h, lang)} + ১ = ${formatValue(next, lang)}`
    };
  },
  // 8. Odd or Even
  (lang) => {
    const n = Math.floor(Math.random() * 100);
    const isEven = n % 2 === 0;
    const ans = isEven ? (lang === 'en' ? 'Even' : 'জোড়') : (lang === 'en' ? 'Odd' : 'বিজোড়');
    return {
      id: `b8-${Math.random()}`,
      question: lang === 'en' ? `Is ${n} an Odd or Even number?` : `${formatValue(n, lang)} সংখ্যাটি কি জোড় নাকি বিজোড়?`,
      answer: ans,
      type: 'mcq',
      options: lang === 'en' ? ['Odd', 'Even'] : ['জোড়', 'বিজোড়'],
      difficulty: 'basic',
      explanation: lang === 'en' ? `${n} is divisible by 2: ${isEven}` : `${formatValue(n, lang)} ২ দ্বারা বিভাজ্য: ${isEven ? 'হ্যাঁ' : 'না'}`
    };
  },
  // 9. Simple Word Problem
  (lang) => {
    const apples = Math.floor(Math.random() * 10) + 5;
    const eaten = Math.floor(Math.random() * 4) + 1;
    const ans = (apples - eaten).toString();
    return {
      id: `b9-${Math.random()}`,
      question: lang === 'en' ? `You have ${apples} apples. You eat ${eaten}. How many are left?` : `আপনার কাছে ${formatValue(apples, lang)}টি আপেল ছিল। আপনি ${formatValue(eaten, lang)}টি খেলেন। কয়টি বাকি আছে?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'basic', lang),
      difficulty: 'basic',
      explanation: lang === 'en' ? `${apples} - ${eaten} = ${ans}` : `${formatValue(apples, lang)} - ${formatValue(eaten, lang)} = ${formatValue(ans, lang)}`
    };
  },
  // 10. Counting Sides
  (lang) => {
    const shapes = [
      { nameEn: 'triangle', nameBn: 'ত্রিভুজের', sides: 3 },
      { nameEn: 'square', nameBn: 'বর্গের', sides: 4 },
      { nameEn: 'pentagon', nameBn: 'পঞ্চভুজের', sides: 5 },
      { nameEn: 'hexagon', nameBn: 'ভুজ', sides: 6 }
    ];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const ans = shape.sides.toString();
    return {
      id: `b10-${Math.random()}`,
      question: lang === 'en' ? `How many sides does a ${shape.nameEn} have?` : `একটি ${shape.nameBn} কয়টি বাহু থাকে?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'basic', lang),
      difficulty: 'basic',
      explanation: lang === 'en' ? `A ${shape.nameEn} always has ${ans} sides.` : `একটি ${shape.nameBn} ${formatValue(ans, lang)}টি বাহু থাকে।`
    };
  },
  // 11. Largest Number
  (lang) => {
    const nums = [Math.floor(Math.random()*50), Math.floor(Math.random()*50)+51, Math.floor(Math.random()*40)];
    const max = Math.max(...nums);
    return {
      id: `b11-${Math.random()}`,
      question: lang === 'en' ? `Which is the largest: ${nums.join(', ')}?` : `সবচেয়ে বড় কোনটি: ${nums.map(n => formatValue(n, lang)).join(', ')}?`,
      answer: max.toString(),
      type: 'mcq',
      options: nums.map(n => n.toString()),
      difficulty: 'basic',
      explanation: lang === 'en' ? `${max} is the highest value.` : `${formatValue(max, lang)} সবগুলোর চেয়ে বড়।`
    };
  },
  // 12. Double a number
  (lang) => {
    const n = Math.floor(Math.random() * 25);
    const ans = (n * 2).toString();
    return {
      id: `b12-${Math.random()}`,
      question: lang === 'en' ? `What is double of ${n}?` : `${formatValue(n, lang)} এর দ্বিগুণ কত?`,
      answer: ans,
      type: 'fill-blank',
      difficulty: 'basic',
      explanation: lang === 'en' ? `${n} + ${n} = ${ans}` : `${formatValue(n, lang)} + ${formatValue(n, lang)} = ${formatValue(ans, lang)}`
    };
  },
  // 13. Half a number
  (lang) => {
    const ans = Math.floor(Math.random() * 20) + 1;
    const n = ans * 2;
    return {
      id: `b13-${Math.random()}`,
      question: lang === 'en' ? `What is half of ${n}?` : `${formatValue(n, lang)} এর অর্ধেক কত?`,
      answer: ans.toString(),
      type: 'mcq',
      options: createMCQOptions(ans.toString(), 'basic', lang),
      difficulty: 'basic',
      explanation: lang === 'en' ? `${n} / 2 = ${ans}` : `${formatValue(n, lang)} / ২ = ${formatValue(ans, lang)}`
    };
  },
  // 14. Place Value (Tens)
  (lang) => {
    const n = Math.floor(Math.random() * 90) + 10;
    const tens = Math.floor(n / 10);
    return {
      id: `b14-${Math.random()}`,
      question: lang === 'en' ? `In ${n}, which digit is in the tens place?` : `${formatValue(n, lang)} সংখ্যাটিতে দশকের ঘরে কোন অংকটি আছে?`,
      answer: tens.toString(),
      type: 'mcq',
      options: createMCQOptions(tens.toString(), 'basic', lang),
      difficulty: 'basic',
      explanation: lang === 'en' ? `${tens} is in the 10s place.` : `${formatValue(tens, lang)} সংখ্যাটি দশকের ঘরে আছে।`
    };
  },
  // 15. Next Number
  (lang) => {
    const n = Math.floor(Math.random() * 98);
    const ans = (n + 1).toString();
    return {
      id: `b15-${Math.random()}`,
      question: lang === 'en' ? `What number comes after ${n}?` : `${formatValue(n, lang)} এর ঠিক পরের সংখ্যাটি কোনটি?`,
      answer: ans,
      type: 'fill-blank',
      difficulty: 'basic',
      explanation: lang === 'en' ? `${n} + 1 = ${ans}` : `${formatValue(n, lang)} + ১ = ${formatValue(ans, lang)}`
    };
  },
  // 16. Count Fingers
  (lang) => {
    const hands = Math.floor(Math.random() * 4) + 1;
    const ans = (hands * 5).toString();
    return {
      id: `b16-${Math.random()}`,
      question: lang === 'en' ? `If you have ${hands} hands, how many fingers do you have in total?` : `আপনার যদি ${formatValue(hands, lang)}টি হাত থাকে, তবে মোট আঙুল কয়টি?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'basic', lang),
      difficulty: 'basic',
      explanation: lang === 'en' ? `${hands} × 5 = ${ans}` : `${formatValue(hands, lang)} × ৫ = ${formatValue(ans, lang)}`
    };
  },
  // 17. Simple Geometric Shapes
  (lang) => {
    const shapes = [
      { nameEn: 'square', nameBn: 'বর্গের', corners: 4 },
      { nameEn: 'triangle', nameBn: 'ত্রিভুজের', corners: 3 },
      { nameEn: 'rectangle', nameBn: 'আয়তক্ষেত্রের', corners: 4 }
    ];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const ans = shape.corners.toString();
    return {
      id: `b17-${Math.random()}`,
      question: lang === 'en' ? `How many corners does a ${shape.nameEn} have?` : `একটি ${shape.nameBn} কয়টি কোণা থাকে?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'basic', lang),
      difficulty: 'basic',
      explanation: lang === 'en' ? `A ${shape.nameEn} has ${ans} corners.` : `একটি ${shape.nameBn} ${formatValue(ans, lang)}টি কোণা থাকে।`
    };
  },
  // 18. Pattern Completion (Numbers)
  (lang) => {
    const start = Math.floor(Math.random() * 20) + 1;
    const step = [1, 2, 5, 10][Math.floor(Math.random() * 4)];
    const sequence = [
      start,
      start + step,
      start + step * 2,
      start + step * 3
    ];
    
    const ans = sequence[3].toString();
    const displaySequence = sequence.slice(0, 3).map(n => formatValue(n, lang)).join(', ');
    
    return {
      id: `b18-${Math.random()}`,
      question: lang === 'en' ? `Complete the pattern: ${displaySequence}, ?` : `পূরণ করুন: ${displaySequence}, ?`,
      answer: ans,
      type: 'fill-blank',
      difficulty: 'basic',
      explanation: lang === 'en' ? 
        (`${formatValue(sequence[3], 'en')} is the next number (adding ${formatValue(step, 'en')} each time).`) : 
        (`${formatValue(sequence[3], 'bn')} হলো পরের সংখ্যা (প্রতি বার ${formatValue(step, 'bn')} করে যোগ হচ্ছে)।`)
    };
  },
  // 19. Basic Fractions
  (lang) => {
    const fractions = [
      { en: 'Half', bn: 'অর্ধেক', d: 2 },
      { en: 'Quarter', bn: 'এক-চতুর্থাংশ', d: 4 },
      { en: 'One-third', bn: 'এক-তৃতীয়াংশ', d: 3 }
    ];
    const f = fractions[Math.floor(Math.random() * fractions.length)];
    return {
      id: `b19-${Math.random()}`,
      question: lang === 'en' ? `If you cut a pizza into ${f.d} equal parts, what is one part called?` : `একটি পিজ্জাকে সমান ${formatValue(f.d, lang)} ভাগে ভাগ করলে এক ভাগকে কি বলা হয়?`,
      answer: lang === 'en' ? f.en : f.bn,
      type: 'mcq',
      options: lang === 'en' ? ['Whole', 'Half', 'Quarter', 'Third'] : ['পুরো', 'অর্ধেক', 'এক-চতুর্থাংশ', 'এক-তৃতীয়াংশ'],
      difficulty: 'basic',
      explanation: lang === 'en' ? `1 divided by ${f.d} is ${f.en}.` : `১ কে ${formatValue(f.d, lang)} দিয়ে ভাগ করলে ${f.bn} পাওয়া যায়।`
    };
  },
  // 20. Simple Logic
  (lang) => {
    const count = Math.floor(Math.random() * 5) + 3;
    const ans = count.toString();
    const sequence = Array(count).fill(lang === 'en' ? '1' : '১').join('+');
    return {
      id: `b20-${Math.random()}`,
      question: lang === 'en' ? `What is ${sequence}?` : `${sequence} = কত?`,
      answer: ans,
      type: 'fill-blank',
      difficulty: 'basic',
      explanation: lang === 'en' ? `Adding 1, ${count} times gives ${count}.` : `১-কে ${formatValue(count, lang)} বার যোগ করলে হয় ${formatValue(ans, lang)}।`
    };
  }
];

// --- NORMAL TEMPLATES (20) ---
const normalTemplates: ((language: 'en' | 'bn') => Question)[] = [
  // 1. Algebra Basic
  (lang) => {
    const x = Math.floor(Math.random() * 10) + 1;
    const ans = x.toString();
    const result = x + 15;
    return {
      id: `n1-${Math.random()}`,
      question: lang === 'en' ? `Solve for x: x + 15 = ${result}` : `x এর মান কত: x + ১৫ = ${formatValue(result, lang)}`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal', lang),
      difficulty: 'normal',
      explanation: `${result} - 15 = ${x}`
    };
  },
  // 2. Percentages
  (lang) => {
    const totals = [100, 200, 500, 1000];
    const percents = [10, 20, 25, 50];
    const total = totals[Math.floor(Math.random() * totals.length)];
    const percent = percents[Math.floor(Math.random() * percents.length)];
    const ans = (total * percent / 100).toString();
    return {
      id: `n2-${Math.random()}`,
      question: lang === 'en' ? `What is ${percent}% of ${total}?` : `${formatValue(total, lang)} এর ${formatValue(percent, lang)}% কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal', lang),
      difficulty: 'normal',
      explanation: `(${percent}/100) * ${total} = ${ans}`
    };
  },
  // 3. Square Roots
  (lang) => {
    const n = Math.floor(Math.random() * 10) + 1;
    const square = n * n;
    return {
      id: `n3-${Math.random()}`,
      question: lang === 'en' ? `What is the square root of ${square}?` : `${formatValue(square, lang)} এর বর্গমূল কত?`,
      answer: n.toString(),
      type: 'fill-blank',
      difficulty: 'normal',
      explanation: `√${square} = ${n}`
    };
  },
  // 4. Geometry Area
  (lang) => {
    const w = Math.floor(Math.random() * 15) + 5;
    const h = Math.floor(Math.random() * 15) + 5;
    const ans = (w * h).toString();
    return {
      id: `n4-${Math.random()}`,
      question: lang === 'en' ? `Area of a rectangle with width ${w} and height ${h}?` : `${formatValue(w, lang)} প্রস্থ এবং ${formatValue(h, lang)} উচ্চতার আয়তক্ষেত্রের ক্ষেত্রফল কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal', lang),
      difficulty: 'normal',
      explanation: `${w} * ${h} = ${ans}`
    };
  },
  // 5. Ratios
  (lang) => {
    const r1 = Math.floor(Math.random() * 3) + 2;
    const r2 = Math.floor(Math.random() * 2) + 1;
    const multiplier = Math.floor(Math.random() * 5) + 2;
    const gCount = r2 * multiplier;
    const ans = (r1 * multiplier).toString();
    return {
      id: `n5-${Math.random()}`,
      question: lang === 'en' ? `If the ratio of boys to girls is ${r1}:${r2} and there are ${gCount} girls, how many boys are there?` : `যদি ছেলে ও মেয়ের অনুপাত ${formatValue(r1, lang)}:${formatValue(r2, lang)} হয় এবং মেয়ে ${formatValue(gCount, lang)} জন থাকে, তবে ছেলে কতজন?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal', lang),
      difficulty: 'normal',
      explanation: `${r2} units = ${gCount}, 1 unit = ${multiplier}, ${r1} units = ${ans}`
    };
  },
  // 6. Decimals
  (lang) => {
    const fractions = [
      { n: 1, d: 2, ans: '0.5' },
      { n: 1, d: 4, ans: '0.25' },
      { n: 3, d: 4, ans: '0.75' },
      { n: 1, d: 5, ans: '0.2' },
      { n: 2, d: 5, ans: '0.4' }
    ];
    const f = fractions[Math.floor(Math.random() * fractions.length)];
    return {
      id: `n6-${Math.random()}`,
      question: lang === 'en' ? `Express ${f.n}/${f.d} as a decimal.` : `${formatValue(f.n, lang)}/${formatValue(f.d, lang)} কে দশমিকে প্রকাশ করুন।`,
      answer: f.ans,
      type: 'mcq',
      options: createMCQOptions(f.ans, 'normal', lang),
      difficulty: 'normal',
      explanation: `${f.n} / ${f.d} = ${f.ans}`
    };
  },
  // 7. Average (Mean)
  (lang) => {
    const a = Math.floor(Math.random() * 20) + 10;
    const b = a + 10;
    const c = a + 20;
    const avg = ((a + b + c) / 3).toString();
    return {
      id: `n7-${Math.random()}`,
      question: lang === 'en' ? `Average of ${a}, ${b}, ${c}?` : `${formatValue(a, lang)}, ${formatValue(b, lang)}, ${formatValue(c, lang)} এর গড় কত?`,
      answer: avg,
      type: 'fill-blank',
      difficulty: 'normal',
      explanation: `(${a}+${b}+${c})/3 = ${avg}`
    };
  },
  // 8. Unit Conversion
  (lang) => {
    const km = Math.floor(Math.random() * 9) + 2;
    const m = km * 1000;
    return {
      id: `n8-${Math.random()}`,
      question: lang === 'en' ? `How many meters in ${km} kilometers?` : `${formatValue(km, lang)} কিলোমিটারে কত মিটার?`,
      answer: m.toString(),
      type: 'mcq',
      options: createMCQOptions(m.toString(), 'normal', lang),
      difficulty: 'normal',
      explanation: `1km = 1000m, so ${km}km = ${m}m`
    };
  },
  // 9. Absolute Value
  (lang) => {
    const n = Math.floor(Math.random() * 50) + 10;
    const ans = n.toString();
    return {
      id: `n9-${Math.random()}`,
      question: lang === 'en' ? `What is |- ${n}|?` : `|- ${formatValue(n, lang)}| এর মান কত?`,
      answer: ans,
      type: 'fill-blank',
      difficulty: 'normal',
      explanation: lang === 'en' ? `The absolute value of -${n} is ${n}.` : `-${formatValue(n, lang)} এর পরম মান (absolute value) হলো ${formatValue(n, lang)}।`
    };
  },
  // 10. Factorial Basic
  (lang) => {
    const n = Math.floor(Math.random() * 3) + 3; // 3, 4, 5
    const fact = (num: number): number => num <= 1 ? 1 : num * fact(num - 1);
    const ans = fact(n).toString();
    return {
      id: `n10-${Math.random()}`,
      question: lang === 'en' ? `What is ${n} factorial (${n}!)?` : `${formatValue(n, lang)} এর ফ্যাক্টোরিয়াল (${formatValue(n, lang)}!) কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal', lang),
      difficulty: 'normal',
      explanation: Array.from({length: n}, (_, i) => n - i).join(' * ') + ` = ${ans}`
    };
  },
  // 11. Prime Numbers
  (lang) => {
    const primes = [11, 13, 17, 19, 23, 29, 31, 37];
    const ans = primes[Math.floor(Math.random() * primes.length)].toString();
    return {
      id: `n11-${Math.random()}`,
      question: lang === 'en' ? `Which of these is a prime number?` : `নিচের কোনটি মৌলিক সংখ্যা?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal', lang),
      difficulty: 'normal',
      explanation: lang === 'en' ? `${ans} is only divisible by 1 and itself.` : `${formatValue(ans, lang)} শুধুমাত্র ১ এবং সংখ্যাটি নিজে দ্বারা বিভাজ্য।`
    };
  },
  // 12. GCD/HCF
  (lang) => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const n1 = (Math.floor(Math.random() * 5) + 2) * 6; // multiples of 6
    const n2 = (Math.floor(Math.random() * 5) + 2) * 4; // multiples of 4
    const ans = gcd(n1, n2).toString();
    return {
      id: `n12-${Math.random()}`,
      question: lang === 'en' ? `Greatest Common Divisor (GCD) of ${n1} and ${n2}?` : `${formatValue(n1, lang)} এবং ${formatValue(n2, lang)} এর গরিষ্ঠ সাধারণ গুণনীয়ক (গসাগু) কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal', lang),
      difficulty: 'normal',
      explanation: lang === 'en' ? `The largest number that divides both ${n1} and ${n2} is ${ans}.` : `${formatValue(n1, lang)} এবং ${formatValue(n2, lang)} উভয়কে ভাগ করা যায় এমন বৃহত্তম সংখ্যা হলো ${formatValue(ans, lang)}।`
    };
  },
  // 13. LCM
  (lang) => {
    const gcdValue = (a: number, b: number): number => b === 0 ? a : gcdValue(b, a % b);
    const a = Math.floor(Math.random() * 6) + 3;
    const b = Math.floor(Math.random() * 6) + 3;
    const ans = ((a * b) / gcdValue(a, b)).toString();
    return {
      id: `n13-${Math.random()}`,
      question: lang === 'en' ? `Least Common Multiple (LCM) of ${a} and ${b}?` : `${formatValue(a, lang)} এবং ${formatValue(b, lang)} এর লঘিষ্ঠ সাধারণ গুণিতক (লসাগু) কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal', lang),
      difficulty: 'normal',
      explanation: lang === 'en' ? `The smallest multiple shared by ${a} and ${b} is ${ans}.` : `${formatValue(a, lang)} এবং ${formatValue(b, lang)} এর সাধারণ ক্ষুদ্রতম গুণিতক হলো ${formatValue(ans, lang)}।`
    };
  },
  // 14. Exponents
  (lang) => {
    const base = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5
    const pow = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
    const ans = Math.pow(base, pow).toString();
    return {
      id: `n14-${Math.random()}`,
      question: lang === 'en' ? `What is ${base} to the power of ${pow} (${base}^${pow})?` : `${formatValue(base, lang)} এর ওপর ${formatValue(pow, lang)} পাওয়ার (${formatValue(base, lang)}^${formatValue(pow, lang)}) এর মান কত?`,
      answer: ans,
      type: 'fill-blank',
      difficulty: 'normal',
      explanation: Array.from({length: pow}, () => base).join('*') + ` = ${ans}`
    };
  },
  // 15. Speed
  (lang) => {
    const speed = (Math.floor(Math.random() * 6) + 4) * 10; // 40, 50, 60...
    const time = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
    const dist = speed * time;
    return {
      id: `n15-${Math.random()}`,
      question: lang === 'en' ? `If a car travels ${dist}km in ${time} hours, what is its speed?` : `একটি গাড়ি ${formatValue(time, lang)} ঘণ্টায় ${formatValue(dist, lang)} কিমি গেলে এর গতিবেগ কত?`,
      answer: speed.toString(),
      type: 'mcq',
      options: createMCQOptions(speed.toString(), 'normal', lang),
      difficulty: 'normal',
      explanation: `${dist} / ${time} = ${speed} km/h`
    };
  },
  // 16. Perimeter
  (lang) => {
    const s1 = Math.floor(Math.random() * 10) + 3;
    const s2 = Math.floor(Math.random() * 10) + 3;
    const s3 = Math.floor(Math.random() * 10) + 3;
    const ans = (s1 + s2 + s3).toString();
    return {
      id: `n16-${Math.random()}`,
      question: lang === 'en' ? `Perimeter of a triangle with sides ${s1}, ${s2}, and ${s3}?` : `${formatValue(s1, lang)}, ${formatValue(s2, lang)} এবং ${formatValue(s3, lang)} বাহু বিশিষ্ট ত্রিভুজের পরিসীমা কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal', lang),
      difficulty: 'normal',
      explanation: `${s1} + ${s2} + ${s3} = ${ans}`
    };
  },
  // 17. Complementary Angles
  (lang) => {
    const angle = Math.floor(Math.random() * 70) + 10;
    const ans = (90 - angle).toString();
    return {
      id: `n17-${Math.random()}`,
      question: lang === 'en' ? `Complementary angle of ${angle}°?` : `${formatValue(angle, lang)}° এর পূরক কোণ কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal', lang),
      difficulty: 'normal',
      explanation: `90 - ${angle} = ${ans}`
    };
  },
  // 18. Circle Property
  (lang) => {
    const r = Math.floor(Math.random() * 15) + 2;
    const ans = (2 * r).toString();
    return {
      id: `n18-${Math.random()}`,
      question: lang === 'en' ? `If the radius of a circle is ${r}, what is the diameter?` : `বৃত্তের ব্যাসার্ধ ${formatValue(r, lang)} হলে ব্যাস কত?`,
      answer: ans,
      type: 'fill-blank',
      difficulty: 'normal',
      explanation: `Diameter = 2 * Radius = 2 * ${r} = ${ans}`
    };
  },
  // 19. Volume
  (lang) => {
    const side = Math.floor(Math.random() * 5) + 2;
    const ans = Math.pow(side, 3).toString();
    return {
      id: `n19-${Math.random()}`,
      question: lang === 'en' ? `Volume of a cube with side ${side}?` : `${formatValue(side, lang)} বাহু বিশিষ্ট ঘনকের আয়তন কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal', lang),
      difficulty: 'normal',
      explanation: `${side} * ${side} * ${side} = ${ans}`
    };
  },
  // 20. Fraction Ops
  (lang) => {
    const d1 = [2, 3, 4][Math.floor(Math.random() * 3)];
    const d2 = [3, 4, 5][Math.floor(Math.random() * 3)];
    const gcdFunc = (a: number, b: number): number => b === 0 ? a : gcdFunc(b, a % b);
    const common = (d1 * d2) / gcdFunc(d1, d2);
    const num = (1 * (common / d1)) + (1 * (common / d2));
    const finalGcd = gcdFunc(num, common);
    const ans = `${num / finalGcd}/${common / finalGcd}`;
    return {
      id: `n20-${Math.random()}`,
      question: lang === 'en' ? `What is 1/${d1} + 1/${d2}?` : `১/${formatValue(d1, lang)} + ১/${formatValue(d2, lang)} = কত?`,
      answer: ans,
      type: 'mcq',
      options: [ans, '1/2', '3/4', '2/5'].map(o => formatOptionValue(o, lang)),
      difficulty: 'normal',
      explanation: lang === 'en' ? `Common denominator: ${common}. Sum: ${num}/${common} = ${ans}` : `সাধারণ হর: ${formatValue(common, lang)}। যোগফল: ${formatValue(num, lang)}/${formatValue(common, lang)} = ${formatValue(ans, lang)}`
    };
  }
];

// --- HARD TEMPLATES (20) ---
const hardTemplates: ((language: 'en' | 'bn') => Question)[] = [
  // 1. Quadratic Equation
  (lang) => {
    const r1 = Math.floor(Math.random() * 5) + 1;
    const r2 = Math.floor(Math.random() * 5) + 1;
    const sum = r1 + r2;
    const prod = r1 * r2;
    const ans = `${Math.min(r1, r2)}, ${Math.max(r1, r2)}`;
    return {
      id: `h1-${Math.random()}`,
      question: lang === 'en' ? `Roots of $x^2 - ${sum}x + ${prod} = 0$ are?` : `$x^2 - ${formatValue(sum, lang)}x + ${formatValue(prod, lang)} = 0$ এর মূলদ্বয় কত?`,
      answer: ans,
      type: 'mcq',
      options: [ans, `${r1 + 1}, ${r2 + 1}`, `${r1}, -${r2}`, `1, ${prod}`].map(o => formatOptionValue(o, lang)),
      difficulty: 'hard',
      explanation: lang === 'en' ? `Factors: (x-${r1})(x-${r2})=0` : `উৎপাদক: (x-${formatValue(r1, lang)})(x-${formatValue(r2, lang)})=০`
    };
  },
  // 2. Trig identity
  (lang) => {
    const angle = [30, 45, 60][Math.floor(Math.random() * 3)];
    return {
      id: `h2-${Math.random()}`,
      question: lang === 'en' ? `Value of $\\sin^2(${angle}°) + \\cos^2(${angle}°)$?` : `$\\sin^2(${formatValue(angle, lang)}°) + \\cos^2(${formatValue(angle, lang)}°)$ এর মান কত?`,
      answer: '1',
      type: 'fill-blank',
      difficulty: 'hard',
      explanation: lang === 'en' ? `Identity: sin²θ + cos²θ = 1 for any angle.` : `সূত্র: sin²θ + cos²θ = ১ (যেকোনো কোণের জন্য)।`
    };
  },
  // 3. Logarithms
  (lang) => {
    const bases = [2, 10, 5];
    const base = bases[Math.floor(Math.random() * bases.length)];
    const power = Math.floor(Math.random() * 3) + 2;
    const num = Math.pow(base, power);
    return {
      id: `h3-${Math.random()}`,
      question: lang === 'en' ? `$\\log_{${base}}(${num}) = ?$` : `$\\log_{${formatValue(base, lang)}}(${formatValue(num, lang)}) = ?$`,
      answer: power.toString(),
      type: 'mcq',
      options: createMCQOptions(power.toString(), 'hard', lang),
      difficulty: 'hard',
      explanation: `${base}^${power} = ${num}`
    };
  },
  // 4. Derivatives
  (lang) => {
    const n = Math.floor(Math.random() * 4) + 2;
    const c = Math.floor(Math.random() * 9) + 1;
    return {
      id: `h4-${Math.random()}`,
      question: lang === 'en' ? `Derivative of $x^{${n}} + ${c}x$?` : `$x^{${formatValue(n, lang)}} + ${formatValue(c, lang)}x$ এর অন্তরক (derivative) কত?`,
      answer: `${n}x^{${n - 1}} + ${c}`,
      type: 'mcq',
      options: [`${n}x^{${n - 1}} + ${c}`, `${n}x + ${c}`, `${n}x^{${n}}`, `x^{${n - 1}} + ${c}`].map(o => formatOptionValue(o, lang)),
      difficulty: 'hard',
      explanation: lang === 'en' ? `d/dx(x^n) = nx^{n-1} and d/dx(cx) = c` : `d/dx(x^n) = nx^{n-1} এবং d/dx(cx) = c`
    };
  },
  // 5. Probability
  (lang) => {
    const target = Math.floor(Math.random() * 5) + 7; // sum of 7, 8, 9, 10, 11
    const waysMap: {[key: number]: number} = {7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1};
    const ways = waysMap[target] || 6;
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const common = gcd(ways, 36);
    const ans = `${ways/common}/${36/common}`;
    
    return {
      id: `h5-${Math.random()}`,
      question: lang === 'en' ? `Probability of getting a sum of ${target} when rolling two dice?` : `দুটি ছক্কা নিক্ষেপ করলে যোগফল ${formatValue(target, lang)} হওয়ার সম্ভাবনা কত?`,
      answer: ans,
      type: 'mcq',
      options: [ans, '1/6', '1/12', '5/36'].map(o => formatOptionValue(o, lang)),
      difficulty: 'hard',
      explanation: lang === 'en' ? `Total combinations = 36. Ways to get sum ${target} = ${ways}. Probability = ${ways}/36 = ${ans}.` : `মোট সম্ভাবনা ৩৬। যোগফল ${formatValue(target, lang)} আসার পথ ${formatValue(ways, lang)}টি। সম্ভাবনা = ${formatValue(ways, lang)}/৩৬ = ${formatValue(ans, lang)}।`
    };
  },
  // 6. Calculus Integration
  (lang) => {
    const n = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
    const coeff = n + 1;
    const ans = `x^{${n + 1}}`;
    const alt1 = `x^{${n}}`;
    const alt2 = `${coeff}x^{${n + 1}}`;
    const alt3 = `${coeff}x^{${n}}`;
    return {
      id: `h6-${Math.random()}`,
      question: lang === 'en' ? `$\\int ${coeff}x^{${n}} dx = ?$ (exclude C)` : `$\\int ${formatValue(coeff, lang)}x^{${formatValue(n, lang)}} dx = ?$ (C বাদে)`,
      answer: ans,
      type: 'mcq',
      options: [ans, alt1, alt2, alt3].sort(() => Math.random() - 0.5).map(o => formatOptionValue(o, lang)),
      difficulty: 'hard',
      explanation: lang === 'en' ? `Integration of x^n is x^{n+1}/(n+1).` : `x^n এর ইন্টিগ্রেশন হলো x^{n+1}/(n+1)।`
    };
  },
  // 7. Matrix Determinant
  (lang) => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const c = Math.floor(Math.random() * 5) + 1;
    const d = Math.floor(Math.random() * 5) + 1;
    const det = (a * d) - (b * c);
    return {
      id: `h7-${Math.random()}`,
      question: lang === 'en' ? `Determinant of $\\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\\\ \\end{pmatrix}$?` : `$\\begin{pmatrix} ${formatValue(a, lang)} & ${formatValue(b, lang)} \\\\ ${formatValue(c, lang)} & ${formatValue(d, lang)} \\\\ \\end{pmatrix}$ এর নির্ণায়ক কত?`,
      answer: det.toString(),
      type: 'mcq',
      options: createMCQOptions(det.toString(), 'hard', lang),
      difficulty: 'hard',
      explanation: `(${a} * ${d}) - (${b} * ${c}) = ${det}`
    };
  },
  // 8. Vector Magnitude
  (lang) => {
    const x = [3, 5, 8][Math.floor(Math.random() * 3)];
    const y = [4, 12, 15][Math.floor(Math.random() * 3)];
    const mag = Math.sqrt(x*x + y*y).toFixed(1).replace('.0', '');
    return {
      id: `h8-${Math.random()}`,
      question: lang === 'en' ? `Magnitude of vector $${x}i + ${y}j$?` : `$${formatValue(x, lang)}i + ${formatValue(y, lang)}j$ ভেক্টরের মান কত?`,
      answer: mag,
      type: 'fill-blank',
      difficulty: 'hard',
      explanation: `√(${x}² + ${y}²) ≈ ${mag}`
    };
  },
  // 9. Combinations
  (lang) => {
    const n = Math.floor(Math.random() * 3) + 5; // 5, 6, 7
    const r = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
    const fact = (num: number): number => num <= 1 ? 1 : num * fact(num - 1);
    const ans = fact(n) / (fact(r) * fact(n - r));
    return {
      id: `h9-${Math.random()}`,
      question: lang === 'en' ? `Value of $${n}C${r}$?` : `$${formatValue(n, lang)}C${formatValue(r, lang)}$ এর মান কত?`,
      answer: ans.toString(),
      type: 'mcq',
      options: createMCQOptions(ans.toString(), 'hard', lang),
      difficulty: 'hard',
      explanation: `${n}! / (${r}! * (${n}-${r})!) = ${ans}`
    };
  },
  // 10. Permutations
  (lang) => {
    const n = Math.floor(Math.random() * 3) + 4; // 4, 5, 6
    const r = Math.floor(Math.random() * 2) + 2; // 2, 3
    const fact = (num: number): number => num <= 1 ? 1 : num * fact(num - 1);
    const ans = fact(n) / fact(n - r);
    return {
      id: `h10-${Math.random()}`,
      question: lang === 'en' ? `Value of $${n}P${r}$?` : `$${formatValue(n, lang)}P${formatValue(r, lang)}$ এর মান কত?`,
      answer: ans.toString(),
      type: 'mcq',
      options: createMCQOptions(ans.toString(), 'hard', lang),
      difficulty: 'hard',
      explanation: `${n}! / (${n}-${r})! = ${ans}`
    };
  },
  // 11. Complex Numbers
  (lang) => {
    const powers = [2, 3, 4];
    const p = powers[Math.floor(Math.random() * powers.length)];
    const ans = p === 2 ? '-1' : p === 3 ? '-i' : '1';
    return {
      id: `h11-${Math.random()}`,
      question: lang === 'en' ? `Value of $i^{${p}}$?` : `$i^{${formatValue(p, lang)}}$ এর মান কত?`,
      answer: ans,
      type: 'mcq',
      options: ['1', '-1', 'i', '-i'],
      difficulty: 'hard',
      explanation: lang === 'en' ? `i² = -1, i³ = -i, i⁴ = 1` : `i² = -১, i³ = -i, i⁴ = ১`
    };
  },
  // 12. Sets (Intersection)
  (lang) => {
    const a = [1, 2, 3, Math.floor(Math.random() * 5) + 5];
    const b = [2, 3, 4, Math.floor(Math.random() * 5) + 6];
    const intersect = a.filter(x => b.includes(x)).sort();
    const ans = `{${intersect.join(',')}}`;
    return {
      id: `h12-${Math.random()}`,
      question: lang === 'en' ? `If A={${a.join(',')}} and B={${b.join(',')}}, find $A \\cap B$?` : `A={${a.map(n => formatValue(n, lang)).join(',')}} এবং B={${b.map(n => formatValue(n, lang)).join(',')}} হলে $A \\cap B$ কত?`,
      answer: ans,
      type: 'mcq',
      options: [ans, '{1,2,3,4}', '{}', '{4,5}'].map(o => formatOptionValue(o, lang)),
      difficulty: 'hard',
      explanation: lang === 'en' ? `Intersection means common elements.` : `Intersection মানে সাধারণ উপাদানগুলো।`
    };
  },
  // 13. Sequence Sum
  (lang) => {
    const n = [50, 100, 200][Math.floor(Math.random() * 3)];
    const ans = (n * (n + 1)) / 2;
    return {
      id: `h13-${Math.random()}`,
      question: lang === 'en' ? `Sum of first ${n} natural numbers?` : `১ থেকে ${formatValue(n, lang)} পর্যন্ত সংখ্যার সমষ্টি কত?`,
      answer: ans.toString(),
      type: 'fill-blank',
      difficulty: 'hard',
      explanation: `n(n+1)/2 = ${n} * (${n}+1) / 2 = ${ans}`
    };
  },
  // 14. Geometry Theorems
  (lang) => {
    const theorems = [
      { 
        qEn: 'Angle in a semi-circle is?', qBn: 'অর্ধবৃত্তস্থ কোণ কত ডিগ্রি?', 
        ans: '90°' 
      },
      { 
        qEn: 'Sum of angles in a triangle is?', qBn: 'ত্রিভুজের তিন কোণের সমষ্টি কত?', 
        ans: '180°' 
      },
      { 
        qEn: 'A right angle is how many degrees?', qBn: 'এক সমকোণ সমান কত ডিগ্রি?', 
        ans: '90°' 
      }
    ];
    const t = theorems[Math.floor(Math.random() * theorems.length)];
    return {
      id: `h14-${Math.random()}`,
      question: lang === 'en' ? t.qEn : t.qBn,
      answer: t.ans,
      type: 'mcq',
      options: ['90°', '180°', '360°', '45°'].map(o => formatOptionValue(o, lang)),
      difficulty: 'hard',
      explanation: lang === 'en' ? `Standard geometric theorem.` : `এটি একটি জ্যামিতিক উপপাদ্য।`
    };
  },
  // 15. Number System Conversion
  (lang) => {
    const systems = [
      { base: 2, nameEn: 'Binary', nameBn: 'বাইনারি' },
      { base: 8, nameEn: 'Octal', nameBn: 'অক্টাল' },
      { base: 10, nameEn: 'Decimal', nameBn: 'দশমিক' },
      { base: 16, nameEn: 'Hexadecimal', nameBn: 'হেক্সাডেসিমেল' }
    ];
    let from = systems[Math.floor(Math.random() * systems.length)];
    let to = systems[Math.floor(Math.random() * systems.length)];
    while (from.base === to.base) {
      to = systems[Math.floor(Math.random() * systems.length)];
    }
    
    const maxVal = to.base === 2 ? 63 : to.base === 8 ? 255 : 511;
    const n = Math.floor(Math.random() * maxVal) + 10;
    
    const rawFromVal = n.toString(from.base).toUpperCase();
    const rawAns = n.toString(to.base).toUpperCase();
    
    const displayFrom = (from.base === 10) ? formatValue(rawFromVal, lang) : rawFromVal;
    const displayAns = (to.base === 10) ? formatValue(rawAns, lang) : rawAns;

    const options = [rawAns];
    const offsets = [1, -1, 2, -2, 4, 8];
    while (options.length < 4) {
      const offset = offsets[Math.floor(Math.random() * offsets.length)];
      const d = (Math.max(1, n + offset)).toString(to.base).toUpperCase();
      if (!options.includes(d)) options.push(d);
    }

    return {
      id: `h15-${Math.random()}`,
      question: lang === 'en' 
        ? `Convert ${rawFromVal} (${from.nameEn}) to ${to.nameEn}?` 
        : `${from.nameBn} সংখ্যা ${displayFrom} কে ${to.nameBn} এ রূপান্তর করলে কত হবে?`,
      answer: rawAns,
      type: 'mcq',
      options: options.sort(() => Math.random() - 0.5).map(o => (to.base === 10) ? formatValue(o, lang) : o),
      difficulty: 'hard',
      explanation: lang === 'en' 
        ? `${rawFromVal} in base ${from.base} is equal to ${rawAns} in base ${to.base}.` 
        : `${from.nameBn} ${displayFrom} এর ${to.nameBn} রূপ হলো ${displayAns}।`
    };
  },
  // 16. Limits
  (lang) => {
    const a = Math.floor(Math.random() * 4) + 2;
    const ans = '1';
    return {
      id: `h16-${Math.random()}`,
      question: lang === 'en' ? `$\\lim_{x \\to 0} \\frac{\\sin ${a}x}{${a}x} = ?$` : `$\\lim_{x \\to 0} \\frac{\\sin ${formatValue(a, lang)}x}{${formatValue(a, lang)}x} = ?$`,
      answer: ans,
      type: 'mcq',
      options: ['0', '1', '∞', 'Undefined'].map(o => formatOptionValue(o, lang)),
      difficulty: 'hard',
      explanation: `Standard trigonometric limit: lim(x→0) sin(kx)/kx = 1.`
    };
  },
  // 17. Arithmetic progression
  (lang) => {
    const a = Math.floor(Math.random() * 5) + 1;
    const d = Math.floor(Math.random() * 4) + 2;
    const n = Math.floor(Math.random() * 10) + 5;
    const ans = a + (n - 1) * d;
    return {
      id: `h17-${Math.random()}`,
      question: lang === 'en' ? `${n}th term of AP: ${a}, ${a + d}, ${a + 2 * d}, ...?` : `সমান্তর ধারাটির ${formatValue(n, lang)}তম পদ কত: ${formatValue(a, lang)}, ${formatValue(a + d, lang)}, ${formatValue(a + 2 * d, lang)}, ...?`,
      answer: ans.toString(),
      type: 'mcq',
      options: createMCQOptions(ans.toString(), 'hard', lang),
      difficulty: 'hard',
      explanation: `a + (n-1)d = ${a} + (${n}-1)*${d} = ${ans}`
    };
  },
  // 18. Geometric Progression
  (lang) => {
    const a = 2;
    const r = [2, 3][Math.floor(Math.random() * 2)];
    const n = Math.floor(Math.random() * 2) + 4; // 4, 5
    const ans = a * Math.pow(r, n - 1);
    const sequence = `${a}, ${a * r}, ${a * r * r}, ...`;
    return {
      id: `h18-${Math.random()}`,
      question: lang === 'en' ? `${n}th term of GP: ${sequence}` : `গুণোত্তর ধারাটির ${formatValue(n, lang)}তম পদ কত: ${formatValue(a, lang)}, ${formatValue(a * r, lang)}, ${formatValue(a * r * r, lang)}, ...?`,
      answer: ans.toString(),
      type: 'fill-blank',
      difficulty: 'hard',
      explanation: `ar^{n-1} = ${a} * ${r}^${n - 1} = ${ans}`
    };
  },
  // 19. Modular Arithmetic
  (lang) => {
    const a = Math.floor(Math.random() * 50) + 20;
    const b = Math.floor(Math.random() * 8) + 3;
    const ans = a % b;
    return {
      id: `h19-${Math.random()}`,
      question: lang === 'en' ? `$${a} \\pmod{${b}} = ?$` : `$${formatValue(a, lang)} \\pmod{${formatValue(b, lang)}} = ?$`,
      answer: ans.toString(),
      type: 'mcq',
      options: createMCQOptions(ans.toString(), 'hard', lang),
      difficulty: 'hard',
      explanation: lang === 'en' ? `${a} divided by ${b} leaves remainder ${ans}.` : `${formatValue(a, lang)} কে ${formatValue(b, lang)} দিয়ে ভাগ করলে ভাগশেষ ${formatValue(ans, lang)} থাকে।`
    };
  },
  // 20. Domain
  (lang) => {
    const k = Math.floor(Math.random() * 5) + 1;
    return {
      id: `h20-${Math.random()}`,
      question: lang === 'en' ? `Domain of $f(x) = \\sqrt{x-${k}}$?` : `$f(x) = \\sqrt{x-${formatValue(k, lang)}}$ এর ডোমেইন কোনটি?`,
      answer: `x ≥ ${k}`,
      type: 'mcq',
      options: [`x ≥ ${k}`, `x > ${k}`, `x ≥ 0`, `All valid`].map(o => formatOptionValue(o, lang)),
      difficulty: 'hard',
      explanation: `x-${k} must be non-negative.`
    };
  }
];

export const OFFLINE_TEMPLATES = {
  basic: basicTemplates,
  normal: normalTemplates,
  hard: hardTemplates
};
