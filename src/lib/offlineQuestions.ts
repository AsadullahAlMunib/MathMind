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
  return language === 'bn' ? toBengaliDigits(val) : val.toString();
};

const createMCQOptions = (answer: string, difficulty: Difficulty): string[] => {
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
  return options.sort(() => Math.random() - 0.5);
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
      options: createMCQOptions(ans, 'basic'),
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
      options: createMCQOptions(ans, 'basic'),
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
      options: createMCQOptions(ans, 'basic'),
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
      options: createMCQOptions(ans.toString(), 'basic'),
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
      options: createMCQOptions(next.toString(), 'basic'),
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
      options: createMCQOptions(ans, 'basic'),
      difficulty: 'basic',
      explanation: lang === 'en' ? `${apples} - ${eaten} = ${ans}` : `${formatValue(apples, lang)} - ${formatValue(eaten, lang)} = ${formatValue(ans, lang)}`
    };
  },
  // 10. Counting Sides
  (lang) => {
    const ans = '3';
    return {
      id: `b10-${Math.random()}`,
      question: lang === 'en' ? `How many sides does a triangle have?` : `একটি ত্রিভুজের কয়টি বাহু থাকে?`,
      answer: ans,
      type: 'mcq',
      options: ['2', '3', '4', '5'],
      difficulty: 'basic',
      explanation: lang === 'en' ? `A triangle always has 3 sides.` : `একটি ত্রিভুজের ৩টি বাহু থাকে।`
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
      options: createMCQOptions(ans.toString(), 'basic'),
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
      options: createMCQOptions(tens.toString(), 'basic'),
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
      options: createMCQOptions(ans, 'basic'),
      difficulty: 'basic',
      explanation: lang === 'en' ? `${hands} × 5 = ${ans}` : `${formatValue(hands, lang)} × ৫ = ${formatValue(ans, lang)}`
    };
  },
  // 17. Simple Geometric Shapes
  (lang) => {
    const ans = '4';
    return {
      id: `b17-${Math.random()}`,
      question: lang === 'en' ? `How many corners does a square have?` : `একটি বর্গের কয়টি কোণা থাকে?`,
      answer: ans,
      type: 'mcq',
      options: ['3', '4', '5', '6'],
      difficulty: 'basic',
      explanation: lang === 'en' ? `A square has 4 corners.` : `একটি বর্গের ৪টি কোণা থাকে।`
    };
  },
  // 18. Pattern Completion (Letters)
  (lang) => {
    return {
      id: `b18-${Math.random()}`,
      question: lang === 'en' ? `Complete: A, B, C, ?` : `পূরণ করুন: ক, খ, গ, ?`,
      answer: lang === 'en' ? 'D' : 'ঘ',
      type: 'fill-blank',
      difficulty: 'basic',
      explanation: lang === 'en' ? `D is the fourth letter.` : `ঘ হলো চতুর্থ বর্ণ।`
    };
  },
  // 19. Basic Fractions (Half)
  (lang) => {
    return {
      id: `b19-${Math.random()}`,
      question: lang === 'en' ? `If you cut a pizza into 2 equal parts, what is one part called?` : `একটি পিজ্জাকে সমান ২ ভাগে ভাগ করলে এক ভাগকে কি বলা হয়?`,
      answer: lang === 'en' ? 'Half' : 'অর্ধেক',
      type: 'mcq',
      options: lang === 'en' ? ['Whole', 'Half', 'Quarter', 'Third'] : ['পুরো', 'অর্ধেক', 'এক-চতুর্থাংশ', 'এক-তৃতীয়াংশ'],
      difficulty: 'basic',
      explanation: lang === 'en' ? `1 divided by 2 is half.` : `১ কে ২ দিয়ে ভাগ করলে অর্ধেক পাওয়া যায়।`
    };
  },
  // 20. Simple Logic
  (lang) => {
    return {
      id: `b20-${Math.random()}`,
      question: lang === 'en' ? `If 1+1=2, then what is 1+1+1?` : `যদি ১+১=২ হয়, তবে ১+১+১ কত?`,
      answer: '3',
      type: 'fill-blank',
      difficulty: 'basic',
      explanation: '2 + 1 = 3'
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
      options: createMCQOptions(ans, 'normal'),
      difficulty: 'normal',
      explanation: `${result} - 15 = ${x}`
    };
  },
  // 2. Percentages
  (lang) => {
    const total = 200;
    const percent = 25;
    const ans = '50';
    return {
      id: `n2-${Math.random()}`,
      question: lang === 'en' ? `What is ${percent}% of ${total}?` : `${formatValue(total, lang)} এর ${formatValue(percent, lang)}% কত?`,
      answer: ans,
      type: 'mcq',
      options: ['25', '50', '75', '100'],
      difficulty: 'normal',
      explanation: `(25/100) * 200 = 50`
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
    const w = 5;
    const h = 10;
    const ans = (w * h).toString();
    return {
      id: `n4-${Math.random()}`,
      question: lang === 'en' ? `Area of a rectangle with width 5 and height 10?` : `৫ প্রস্থ এবং ১০ উচ্চতার আয়তক্ষেত্রের ক্ষেত্রফল কত?`,
      answer: ans,
      type: 'mcq',
      options: createMCQOptions(ans, 'normal'),
      difficulty: 'normal',
      explanation: `5 * 10 = 50`
    };
  },
  // 5. Ratios
  (lang) => {
    return {
      id: `n5-${Math.random()}`,
      question: lang === 'en' ? `If the ratio of boys to girls is 3:2 and there are 10 girls, how many boys are there?` : `যদি ছেলে ও মেয়ের অনুপাত ৩:২ হয় এবং মেয়ে ১০ জন থাকে, তবে ছেলে কতজন?`,
      answer: '15',
      type: 'mcq',
      options: ['10', '12', '15', '20'],
      difficulty: 'normal',
      explanation: `2 units = 10, 1 unit = 5, 3 units = 15`
    };
  },
  // 6. Decimals
  (lang) => {
    const ans = '0.75';
    return {
      id: `n6-${Math.random()}`,
      question: lang === 'en' ? `Express 3/4 as a decimal.` : `৩/৪ কে দশমিকে প্রকাশ করুন।`,
      answer: ans,
      type: 'mcq',
      options: ['0.25', '0.5', '0.75', '0.8'],
      difficulty: 'normal',
      explanation: `3 / 4 = 0.75`
    };
  },
  // 7. Average (Mean)
  (lang) => {
    const nums = [10, 20, 30];
    const avg = '20';
    return {
      id: `n7-${Math.random()}`,
      question: lang === 'en' ? `Average of 10, 20, 30?` : `১০, ২০, ৩০ এর গড় কত?`,
      answer: avg,
      type: 'fill-blank',
      difficulty: 'normal',
      explanation: `(10+20+30)/3 = 20`
    };
  },
  // 8. Unit Conversion
  (lang) => {
    const km = 5;
    const m = 5000;
    return {
      id: `n8-${Math.random()}`,
      question: lang === 'en' ? `How many meters in 5 kilometers?` : `৫ কিলোমিটারে কত মিটার?`,
      answer: m.toString(),
      type: 'mcq',
      options: ['500', '5000', '50', '50000'],
      difficulty: 'normal',
      explanation: `1km = 1000m, so 5km = 5000m`
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
    return {
      id: `n10-${Math.random()}`,
      question: lang === 'en' ? `What is 4 factorial (4!)?` : `৪ এর ফ্যাক্টোরিয়াল (৪!) কত?`,
      answer: '24',
      type: 'mcq',
      options: ['12', '16', '24', '48'],
      difficulty: 'normal',
      explanation: `4 * 3 * 2 * 1 = 24`
    };
  },
  // 11. Prime Numbers
  (lang) => {
    return {
      id: `n11-${Math.random()}`,
      question: lang === 'en' ? `Which of these is a prime number?` : `নিচের কোনটি মৌলিক সংখ্যা?`,
      answer: '17',
      type: 'mcq',
      options: ['15', '17', '21', '25'],
      difficulty: 'normal',
      explanation: `17 is only divisible by 1 and itself.`
    };
  },
  // 12. GCD/HCF
  (lang) => {
    return {
      id: `n12-${Math.random()}`,
      question: lang === 'en' ? `Greatest Common Divisor (GCD) of 12 and 18?` : `১২ এবং ১৮ এর গরিষ্ঠ সাধারণ গুণনীয়ক (গসাগু) কত?`,
      answer: '6',
      type: 'mcq',
      options: ['2', '3', '6', '12'],
      difficulty: 'normal',
      explanation: `Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. Common: 6.`
    };
  },
  // 13. LCM
  (lang) => {
    return {
      id: `n13-${Math.random()}`,
      question: lang === 'en' ? `Least Common Multiple (LCM) of 4 and 6?` : `৪ এবং ৬ এর লঘিষ্ঠ সাধারণ গুণিতক (লসাগু) কত?`,
      answer: '12',
      type: 'mcq',
      options: ['12', '24', '6', '10'],
      difficulty: 'normal',
      explanation: `Multiples of 4: 4,8,12... Multiples of 6: 6,12... LCM is 12.`
    };
  },
  // 14. Exponents
  (lang) => {
    return {
      id: `n14-${Math.random()}`,
      question: lang === 'en' ? `What is 2 to the power of 5 (2⁵)?` : `২ এর ওপর ৫ পাওয়ার (২⁵) এর মান কত?`,
      answer: '32',
      type: 'fill-blank',
      difficulty: 'normal',
      explanation: `2*2*2*2*2 = 32`
    };
  },
  // 15. Speed
  (lang) => {
    return {
      id: `n15-${Math.random()}`,
      question: lang === 'en' ? `If a car travels 150km in 3 hours, what is its speed?` : `একটি গাড়ি ৩ ঘণ্টায় ১৫০ কিমি গেলে এর গতিবেগ কত?`,
      answer: '50',
      type: 'mcq',
      options: ['40', '50', '60', '70'],
      difficulty: 'normal',
      explanation: `150 / 3 = 50 km/h`
    };
  },
  // 16. Perimeter
  (lang) => {
    return {
      id: `n16-${Math.random()}`,
      question: lang === 'en' ? `Perimeter of a triangle with sides 5, 7, and 10?` : `৫, ৭ এবং ১০ বাহু বিশিষ্ট ত্রিভুজের পরিসীমা কত?`,
      answer: '22',
      type: 'mcq',
      options: ['20', '22', '25', '35'],
      difficulty: 'normal',
      explanation: `5 + 7 + 10 = 22`
    };
  },
  // 17. Complementary Angles
  (lang) => {
    return {
      id: `n17-${Math.random()}`,
      question: lang === 'en' ? `Complementary angle of 40°?` : `৪০° এর পূরক কোণ কত?`,
      answer: '50',
      type: 'mcq',
      options: ['40', '50', '140', '60'],
      difficulty: 'normal',
      explanation: `90 - 40 = 50`
    };
  },
  // 18. Circle Property
  (lang) => {
    return {
      id: `n18-${Math.random()}`,
      question: lang === 'en' ? `If the radius of a circle is 7, what is the diameter?` : `বৃত্তের ব্যাসার্ধ ৭ হলে ব্যাস কত?`,
      answer: '14',
      type: 'fill-blank',
      difficulty: 'normal',
      explanation: `Diameter = 2 * Radius = 14`
    };
  },
  // 19. Volume
  (lang) => {
    return {
      id: `n19-${Math.random()}`,
      question: lang === 'en' ? `Volume of a cube with side 3?` : `৩ বাহু বিশিষ্ট ঘনকের আয়তন কত?`,
      answer: '27',
      type: 'mcq',
      options: ['9', '27', '18', '12'],
      difficulty: 'normal',
      explanation: `3 * 3 * 3 = 27`
    };
  },
  // 20. Fraction Ops
  (lang) => {
    return {
      id: `n20-${Math.random()}`,
      question: lang === 'en' ? `What is 1/2 + 1/4?` : `১/২ + ১/৪ = কত?`,
      answer: '3/4',
      type: 'mcq',
      options: ['1/2', '3/4', '2/6', '1/8'],
      difficulty: 'normal',
      explanation: `2/4 + 1/4 = 3/4`
    };
  }
];

// --- HARD TEMPLATES (20) ---
const hardTemplates: ((language: 'en' | 'bn') => Question)[] = [
  // 1. Quadratic Equation
  (lang) => {
    return {
      id: `h1-${Math.random()}`,
      question: lang === 'en' ? `Roots of $x^2 - 5x + 6 = 0$ are?` : `$x^2 - 5x + 6 = 0$ এর মূলদ্বয় কত?`,
      answer: '2, 3',
      type: 'mcq',
      options: ['2, 3', '-2, -3', '1, 6', '2, -3'],
      difficulty: 'hard',
      explanation: `Factors: (x-2)(x-3)=0`
    };
  },
  // 2. Trig identity
  (lang) => {
    return {
      id: `h2-${Math.random()}`,
      question: lang === 'en' ? `Value of $\\sin^2(30°) + \\cos^2(30°)$?` : `$\\sin^2(30°) + \\cos^2(30°)$ এর মান কত?`,
      answer: '1',
      type: 'fill-blank',
      difficulty: 'hard',
      explanation: `Identity: sin²θ + cos²θ = 1`
    };
  },
  // 3. Logarithms
  (lang) => {
    return {
      id: `h3-${Math.random()}`,
      question: lang === 'en' ? `$\\log_{10}(1000) = ?$` : `$\\log_{10}(1000) = ?$`,
      answer: '3',
      type: 'mcq',
      options: ['2', '3', '4', '10'],
      difficulty: 'hard',
      explanation: `10^3 = 1000`
    };
  },
  // 4. Derivatives
  (lang) => {
    return {
      id: `h4-${Math.random()}`,
      question: lang === 'en' ? `Derivative of $x^3 + 5x$?` : `$x^3 + 5x$ এর অন্তরক (derivative) কত?`,
      answer: '3x^2 + 5',
      type: 'mcq',
      options: ['3x^2 + 5', '3x + 5', 'x^2 + 5', '3x^2'],
      difficulty: 'hard',
      explanation: `d/dx(x^n) = nx^{n-1}`
    };
  },
  // 5. Probability
  (lang) => {
    return {
      id: `h5-${Math.random()}`,
      question: lang === 'en' ? `Probability of getting a sum of 7 when rolling two dice?` : `দুটি ছক্কা নিক্ষেপ করলে যোগফল ৭ হওয়ার সম্ভাবনা কত?`,
      answer: '1/6',
      type: 'mcq',
      options: ['1/6', '1/12', '1/36', '7/36'],
      difficulty: 'hard',
      explanation: `Pairs: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1). Total 6/36 = 1/6.`
    };
  },
  // 6. Calculus Integration
  (lang) => {
    return {
      id: `h6-${Math.random()}`,
      question: lang === 'en' ? `$\\int 2x dx = ?$ (exclude C)` : `$\\int 2x dx = ?$ (C বাদে)`,
      answer: 'x^2',
      type: 'fill-blank',
      difficulty: 'hard',
      explanation: `Integral of 2x is x^2.`
    };
  },
  // 7. Matrix Determinant
  (lang) => {
    return {
      id: `h7-${Math.random()}`,
      question: lang === 'en' ? `Determinant of $\\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\\\ \\end{pmatrix}$?` : `$\\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\\\ \\end{pmatrix}$ এর নির্ণায়ক কত?`,
      answer: '5',
      type: 'mcq',
      options: ['5', '11', '2', '8'],
      difficulty: 'hard',
      explanation: `(2 * 4) - (3 * 1) = 8 - 3 = 5`
    };
  },
  // 8. Vector Magnitude
  (lang) => {
    return {
      id: `h8-${Math.random()}`,
      question: lang === 'en' ? `Magnitude of vector $3i + 4j$?` : `$3i + 4j$ ভেক্টরের মান কত?`,
      answer: '5',
      type: 'fill-blank',
      difficulty: 'hard',
      explanation: `√(3² + 4²) = 5`
    };
  },
  // 9. Combinations
  (lang) => {
    return {
      id: `h9-${Math.random()}`,
      question: lang === 'en' ? `Value of $5C2$?` : `$5C2$ এর মান কত?`,
      answer: '10',
      type: 'mcq',
      options: ['10', '20', '5', '15'],
      difficulty: 'hard',
      explanation: `5! / (2! * 3!) = 10`
    };
  },
  // 10. Permutations
  (lang) => {
    return {
      id: `h10-${Math.random()}`,
      question: lang === 'en' ? `Value of $5P2$?` : `$5P2$ এর মান কত?`,
      answer: '20',
      type: 'mcq',
      options: ['10', '20', '60', '120'],
      difficulty: 'hard',
      explanation: `5! / 3! = 5 * 4 = 20`
    };
  },
  // 11. Complex Numbers
  (lang) => {
    return {
      id: `h11-${Math.random()}`,
      question: lang === 'en' ? `Value of $i^2$?` : `$i^2$ এর মান কত?`,
      answer: '-1',
      type: 'mcq',
      options: ['1', '-1', 'i', '-i'],
      difficulty: 'hard',
      explanation: `Definition of imaginary unit.`
    };
  },
  // 12. Sets (Intersection)
  (lang) => {
    return {
      id: `h12-${Math.random()}`,
      question: lang === 'en' ? `If A={1,2,3} and B={2,3,4}, find $A \\cap B$?` : `A={1,2,3} এবং B={2,3,4} হলে $A \\cap B$ কত?`,
      answer: '{2,3}',
      type: 'mcq',
      options: ['{2,3}', '{1,4}', '{1,2,3,4}', '{}'],
      difficulty: 'hard',
      explanation: `Common elements are 2 and 3.`
    };
  },
  // 13. Sequence Sum
  (lang) => {
    return {
      id: `h13-${Math.random()}`,
      question: lang === 'en' ? `Sum of first 100 natural numbers?` : `১ থেকে ১০০ পর্যন্ত সংখ্যার সমষ্টি কত?`,
      answer: '5050',
      type: 'fill-blank',
      difficulty: 'hard',
      explanation: `n(n+1)/2 = 100 * 101 / 2 = 5050`
    };
  },
  // 14. Circle Geometry
  (lang) => {
    return {
      id: `h14-${Math.random()}`,
      question: lang === 'en' ? `Angle in a semi-circle is?` : `অর্ধবৃত্তস্থ কোণ কত ডিগ্রি?`,
      answer: '90°',
      type: 'mcq',
      options: ['90°', '180°', '45°', '360°'],
      difficulty: 'hard',
      explanation: `Theorem: Angle in a semi-circle is a right angle.`
    };
  },
  // 15. Binary conversion
  (lang) => {
    return {
      id: `h15-${Math.random()}`,
      question: lang === 'en' ? `Binary of decimal 5?` : `দশমিক ৫ এর বাইনারি কত?`,
      answer: '101',
      type: 'fill-blank',
      difficulty: 'hard',
      explanation: `5 = 4 + 1 = 2^2 + 2^0 = 101`
    };
  },
  // 16. Limits
  (lang) => {
    return {
      id: `h16-${Math.random()}`,
      question: lang === 'en' ? `$\\lim_{x \\to 0} \\frac{\\sin x}{x} = ?$` : `$\\lim_{x \\to 0} \\frac{\\sin x}{x} = ?$`,
      answer: '1',
      type: 'mcq',
      options: ['0', '1', '∞', 'Undefined'],
      difficulty: 'hard',
      explanation: `Standard trigonometric limit.`
    };
  },
  // 17. Arithmetic progression
  (lang) => {
    return {
      id: `h17-${Math.random()}`,
      question: lang === 'en' ? `10th term of AP: 2, 5, 8, ...?` : `সমান্তর ধারাটির ১০ম পদ কত: ২, ৫, ৮, ...?`,
      answer: '29',
      type: 'mcq',
      options: ['27', '29', '31', '30'],
      difficulty: 'hard',
      explanation: `a + (n-1)d = 2 + 9*3 = 29`
    };
  },
  // 18. Geometric Progression
  (lang) => {
    return {
      id: `h18-${Math.random()}`,
      question: lang === 'en' ? `5th term of GP: 2, 4, 8, ...?` : `গুণোত্তর ধারাটির ৫ম পদ কত: ২, ৪, ৮, ...?`,
      answer: '32',
      type: 'fill-blank',
      difficulty: 'hard',
      explanation: `ar^{n-1} = 2 * 2^4 = 32`
    };
  },
  // 19. Modular Arithmetic
  (lang) => {
    return {
      id: `h19-${Math.random()}`,
      question: lang === 'en' ? `$17 \\pmod{5} = ?$` : `$17 \\pmod{5} = ?$`,
      answer: '2',
      type: 'mcq',
      options: ['1', '2', '3', '7'],
      difficulty: 'hard',
      explanation: `17 divided by 5 leaves remainder 2.`
    };
  },
  // 20. Domain
  (lang) => {
    return {
      id: `h20-${Math.random()}`,
      question: lang === 'en' ? `Domain of $f(x) = \\sqrt{x-1}$?` : `$f(x) = \\sqrt{x-1}$ এর ডোমেইন কোনটি?`,
      answer: 'x ≥ 1',
      type: 'mcq',
      options: ['x ≥ 1', 'x > 1', 'x ≥ 0', 'All real numbers'],
      difficulty: 'hard',
      explanation: `x-1 must be non-negative.`
    };
  }
];

export const OFFLINE_TEMPLATES = {
  basic: basicTemplates,
  normal: normalTemplates,
  hard: hardTemplates
};
