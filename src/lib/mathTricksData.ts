export interface MathTrick {
  id: string;
  category: 'arithmetic' | 'algebra' | 'geometry';
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  formula: string;
  exampleEn: string;
  exampleBn: string;
}

export const MATH_TRICKS: MathTrick[] = [
  {
    id: 'mult_11',
    category: 'arithmetic',
    titleEn: 'Multiply by 11 Hack',
    titleBn: '১১ দিয়ে গুণের কৌশল',
    descEn: 'To multiply any 2-digit number by 11, add the two digits and place the sum in the middle! If sum is 10+, carry over 1 to the left digit.',
    descBn: 'যেকোনো ২-অঙ্কের সংখ্যাকে ১১ দিয়ে গুণ করতে সংখ্যাটির অঙ্ক দুটি যোগ করে মাঝখানে বসিয়ে দিন! যোগফল ১০ বা তার বেশি হলে বামের অঙ্কের সাথে ১ যোগ করুন।',
    formula: 'ab \\times 11 = a (a+b) b',
    exampleEn: '$25 \\times 11 \\rightarrow 2 + 5 = 7 \\rightarrow 275$',
    exampleBn: '$২৫ \\times ১১ \\rightarrow ২ + ৫ = ৭ \\rightarrow ২৭৫$'
  },
  {
    id: 'square_5',
    category: 'arithmetic',
    titleEn: 'Square numbers ending in 5',
    titleBn: '৫ দিয়ে শেষ হওয়া সংখ্যার বর্গ',
    descEn: 'Multiply the first digit by the next consecutive integer, then append "25" at the end.',
    descBn: 'প্রথম অঙ্কটিকে তার পরবর্তী সংখ্যা দিয়ে গুণ করুন, তারপর শেষে "২৫" বসিয়ে দিন।',
    formula: '(10a + 5)^2 = [a(a + 1)]25',
    exampleEn: '$35^2 \\rightarrow 3 \\times 4 = 12 \\rightarrow 1225$',
    exampleBn: '$৩৫^২ \\rightarrow ৩ \\times ৪ = ১২ \\rightarrow ১২২৫$'
  },
  {
    id: 'divide_5',
    category: 'arithmetic',
    titleEn: 'Dividing by 5 Fast',
    titleBn: '৫ দিয়ে ভাগের সহজ নিয়ম',
    descEn: 'Multiply the number by 2 and move the decimal point one digit to the left.',
    descBn: 'সংখ্যাটিকে ২ দিয়ে গুণ করুন এবং দশমিক চিহ্ন এক ঘর বামে সরিয়ে দিন।',
    formula: 'x \\div 5 = (x \\times 2) \\div 10',
    exampleEn: '$135 \\div 5 \\rightarrow 135 \\times 2 = 270 \\rightarrow 27.0$',
    exampleBn: '$১৩৫ \\div ৫ \\rightarrow ১৩৫ \\times ২ = ২৭০ \\rightarrow ২৭$'
  },
  {
    id: 'percentage_swap',
    category: 'arithmetic',
    titleEn: 'Percentage Swapping',
    titleBn: 'শতকরার অদলবদল',
    descEn: 'x% of y is always equal to y% of x. Swap them to make the mental calculation much simpler!',
    descBn: 'y এর x% এবং x এর y% সবসময় সমান। মানসিক হিসাব সহজ করতে সংখ্যা দুটি অদলবদল করে নিন!',
    formula: 'x\\%\\text{ of }y = y\\%\\text{ of }x',
    exampleEn: '$8\\%\\text{ of }50 \\rightarrow 50\\%\\text{ of }8 = 4$',
    exampleBn: '$৫০\\text{ এর }৮\\% \\rightarrow ৮\\text{ এর }৫০\\% = ৪$'
  },
  {
    id: 'mult_nine_hack',
    category: 'arithmetic',
    titleEn: 'The "Multiply by 9" Hack',
    titleBn: '৯ দিয়ে গুণের কৌশল',
    descEn: 'To multiply any number by 9, multiply it by 10 instead and subtract the original number from the product.',
    descBn: 'যেকোনো সংখ্যাকে ৯ দ্বারা গুণ করার জন্য, প্রথমে সংখ্যাটিকে ১০ দিয়ে গুণ করুন এবং গুণফল থেকে আসল সংখ্যাটি বিয়োগ করে দিন।',
    formula: 'x \\times 9 = 10x - x',
    exampleEn: '$47 \\times 9 \\rightarrow 470 - 47 = 423$',
    exampleBn: '$৪৭ \\times ৯ \\rightarrow ৪৭০ - ৪৭ = ৪২৩$'
  },
  {
    id: 'divisibility_3',
    category: 'arithmetic',
    titleEn: 'Divisibility by 3 Rule',
    titleBn: '৩ দ্বারা বিভাজ্যতার নিয়ম',
    descEn: 'A number is divisible by 3 if the sum of its individual digits is divisible by 3.',
    descBn: 'কোনো সংখ্যার অঙ্কগুলোর যোগফল ৩ দ্বারা বিভাজ্য হলে সম্পূর্ণ সংখ্যাটি ৩ দ্বারা বিভাজ্য হবে।',
    formula: '\\sum \\text{digits} \\div 3 = \\text{integer}',
    exampleEn: '$381 \\rightarrow 3+8+1 = 12 \\rightarrow (12 \\div 3 = 4) \\rightarrow \\text{Yes!}$',
    exampleBn: '$৩৮১ \\rightarrow ৩+৮+১ = ১২ \\rightarrow (১২ \\div ৩ = ৪) \\rightarrow \\text{হ্যাঁ!}$'
  },
  {
    id: 'diff_of_squares',
    category: 'algebra',
    titleEn: 'Difference of Squares',
    titleBn: 'বর্গের অন্তর হ্যাক',
    descEn: 'Calculate differences of squares easily by taking the sum of the numbers times their difference.',
    descBn: 'দুটি বর্গের অন্তর সহজে বের করুন সংখ্যা দুটির যোগফল ও বিয়োগফল গুণ করার মাধ্যমে।',
    formula: 'a^2 - b^2 = (a-b)(a+b)',
    exampleEn: '$25^2 - 24^2 = (25-24)(25+24) = 1 \\times 49 = 49$',
    exampleBn: '$২৫^২ - ২৪^২ = (২৫-২৪)(২৫+২৪) = ১ \\times ৪৯ = ৪৯$'
  },
  {
    id: 'sum_of_n_integers',
    category: 'algebra',
    titleEn: 'Sum of 1 to N Formula',
    titleBn: '১ থেকে N পর্যন্ত সমষ্টির সূত্র',
    descEn: 'Instantly find the sum of positive integers from 1 up to N using a simple multiplication and division.',
    descBn: '১ থেকে N পর্যন্ত সকল ক্রমিক পূর্ণ সংখ্যার যোগফল অত্যন্ত সহজে নির্ণয় করতে এই চমৎকার সূত্রটি ব্যবহার করুন।',
    formula: '1 + 2 + \\dots + n = \\frac{n(n+1)}{2}',
    exampleEn: '$1 + 2 + \\dots + 20 \\rightarrow \\frac{20 \\times 21}{2} = 210$',
    exampleBn: '$১ + ২ + \\dots + ২০ \\rightarrow \\frac{২০ \\times ২১}{২} = ২১০$'
  },
  {
    id: 'consecutive_products',
    category: 'algebra',
    titleEn: 'Consecutive Multiplication Hack',
    titleBn: 'পর পর দুটি সংখ্যার গুণফল',
    descEn: 'To multiply two consecutive numbers, square the smaller number and add the smaller number to the result.',
    descBn: 'পর পর দুটি সংখ্যা গুণ করতে ছোট সংখ্যাটির বর্গ করে তার সাথে ছোট সংখ্যাটিই যোগ করে দিন।',
    formula: 'n(n+1) = n^2 + n',
    exampleEn: '$12 \\times 13 \\rightarrow 12^2 + 12 = 144 + 12 = 156$',
    exampleBn: '$১২ \\times ১৩ \\rightarrow ১২^২ + ১২ = ১৪৪ + ১২ = ১৫৬$'
  },
  {
    id: 'pythagorean_triples',
    category: 'geometry',
    titleEn: 'Pythagorean Triples Hack',
    titleBn: 'পিথাগোরাস ট্রিপলেট হ্যাক',
    descEn: 'Memorizing core integer triples like (3,4,5), (5,12,13), (8,15,17) allows you to instantly solve right triangles. Multiples of these ratios (such as 6,8,10) are also valid Pythagorean triples!',
    descBn: 'পিথাগোরাসের মূল ট্রিপলেটগুলো (৩,৪,৫), (৫,১২,১৩), এবং (৮,১৫,১৭) মুখস্থ রাখলে কুইজে অতিভুজ নির্ণয় করতে কোনো হিসাবই করতে হয় না। এদের যেকোনো স্কেলড গুনিতকও (যেমন ৬,৮,১০) সত্য!',
    formula: 'a^2 + b^2 = c^2 \\rightarrow (3k, 4k, 5k)',
    exampleEn: 'Sides are 12 and 16. Since $12 = 3 \\times 4$ and $16 = 4 \\times 4$, hypotenuse c must be $5 \\times 4 = 20$.',
    exampleBn: 'সমকোণী ত্রিভুজের লম্ব ও ভূমি ১২ ও ১৬ হলে, যেহেতু $১২ = ৩ \\times ৪$ এবং $১৬ = ৪ \\times ৪$, অতিভুজ অবশ্যই $৫ \\times ৪ = ২০$ হবে।'
  },
  {
    id: 'polygon_diagonals',
    category: 'geometry',
    titleEn: 'Polygon Diagonals Formula',
    titleBn: 'বহুভুজের কর্ণ সংখ্যা নির্ণয়',
    descEn: 'Find how many diagonal lines can be drawn inside any polygon with n sides using this direct formula.',
    descBn: 'n-সংখ্যক বাহুবিশিষ্ট যেকোনো বহুভুজে মোট কয়টি কর্ণ আঁকা সম্ভব তা এই সূত্রের সাহায্যে এক সেকেন্ডে হিসাব করা যাবে।',
    formula: 'd = \\frac{n(n-3)}{2}',
    exampleEn: 'Hexagon (6 sides) $\\rightarrow \\frac{6 \\times (6-3)}{2} = 9$ diagonals.',
    exampleBn: 'ষড়ভুজ (৬টি বাহু) $\\rightarrow \\frac{৬ \\times (৬-৩)}{২} = ৯$ টি কর্ণ।'
  },
  {
    id: 'polygon_interior_angles',
    category: 'geometry',
    titleEn: 'Interior Angles Sum',
    titleBn: 'বহুভুজের অন্তঃস্থ কোণের সমষ্টি',
    descEn: 'Calculate the sum of all interior angles of any polygon with n sides in degrees.',
    descBn: 'n-সংখ্যক বাহুবিশিষ্ট যেকোনো বহুভুজের সকল অন্তঃস্থ কোণগুলোর সমষ্টি কত ডিগ্রি হবে তা এই সূত্রের মাধ্যমে জানতে পারবেন।',
    formula: 'S = (n - 2) \\times 180^\\circ',
    exampleEn: 'Pentagon (5 sides) $\\rightarrow (5-2) \\times 180^\\circ = 3 \\times 180^\\circ = 540^\\circ$',
    exampleBn: 'পঞ্চভুজ (৫টি বাহু) $\\rightarrow (৫-২) \\times ১৮০^\\circ = ৩ \\times ১৮০^\\circ = ৫৪০^\\circ$'
  },
  {
    id: 'mult_15',
    category: 'arithmetic',
    titleEn: 'Multiply by 15 Hack',
    titleBn: '১৫ দিয়ে গুণের সহজ নিয়ম',
    descEn: 'To multiply any even number by 15, add half of that number to itself, and then multiply by 10 (append 0).',
    descBn: 'যেকোনো জোড় সংখ্যাকে ১৫ দ্বারা সহজে গুণ করতে, সংখ্যাটির অর্ধেকের সাথে সংখ্যাটি নিজে যোগ করে দিন, তারপর যোগফলকে ১০ দিয়ে গুণ করুন।',
    formula: 'x \\times 15 = (x + \\frac{x}{2}) \\times 10',
    exampleEn: '$24 \\times 15 \\rightarrow 24 + 12 = 36 \\rightarrow 360$',
    exampleBn: '$২৪ \\times ১৫ \\rightarrow ২৪ + ১২ = ৩৬ \\rightarrow ৩৬০$'
  },
  {
    id: 'sum_odds',
    category: 'arithmetic',
    titleEn: 'Sum of First N Odd Numbers',
    titleBn: 'প্রথম N-সংখ্যক বিজোড় সংখ্যার যোগফল',
    descEn: 'The sum of the first N consecutive odd numbers is simply a perfect square of N ($N^2$)! No complex addition needed.',
    descBn: 'প্রথম N-সংখ্যক ধারাবাহিক বিজোড় সংখ্যার যোগফল শুধুমাত্র সংখ্যাটির বর্গের সমান ($N^2$)! কোনো জটিল হিসাবের প্রয়োজন নেই।',
    formula: '1 + 3 + 5 + \\dots + (2n-1) = n^2',
    exampleEn: 'Sum of first 10 odds ($1 + 3 + \\dots + 19$) $\\rightarrow 10^2 = 100$',
    exampleBn: 'প্রথম ১০টি বিজোড় সংখ্যার সমষ্টি ($১ + ৩ + \\dots + ১৯$) $\\rightarrow ১০^২ = ১০০$'
  },
  {
    id: 'linear_eq_shortcut',
    category: 'algebra',
    titleEn: 'Linear Equation Cheat',
    titleBn: 'এক ধাপে সমীকরণ সমাধান',
    descEn: 'For linear equations in the form $ax + b = c$, find $x$ instantly by subtracting b from c, then dividing by a.',
    descBn: '$ax + b = c$ আকারের সমীকরণগুলোতে, x এর মান এক সেকেন্ডে বের করতে c থেকে b বিয়োগ করে তাকে a দিয়ে ভাগ করুন।',
    formula: 'ax + b = c \\rightarrow x = \\frac{c - b}{a}',
    exampleEn: '$3x + 5 = 20 \\rightarrow x = \\frac{20 - 5}{3} = 5$',
    exampleBn: '$৩x + ৫ = ২০ \\rightarrow x = \\frac{২০ - ৫}{৩} = ৫$'
  },
  {
    id: 'sum_of_squares',
    category: 'algebra',
    titleEn: 'Sum of Squares Formula',
    titleBn: 'বর্গের সমষ্টির সূত্র',
    descEn: 'Find the helper sum of consecutive squares from $1^2$ up to $n^2$ using this perfect formula.',
    descBn: '$১^২$ থেকে $n^২$ পর্যন্ত ধারাবাহিক সংখ্যাগুলোর বর্গের সমষ্টি নির্ণয়ের সহজ সূত্র।',
    formula: '1^2 + 2^2 + \\dots + n^2 = \\frac{n(n+1)(2n+1)}{6}',
    exampleEn: '$1^2 + 2^2 + 3^2 + 4^2 + 5^2 \\rightarrow \\frac{5 \\times 6 \\times 11}{6} = 55$',
    exampleBn: '$১^২ + ২^২ + ৩^২ + ৪^২ + ৫^২ \\rightarrow \\frac{৫ \\times ৬ \\times ১১}{৬} = ৫৫$'
  },
  {
    id: 'regular_polygon_angle',
    category: 'geometry',
    titleEn: 'Regular Polygon Each Angle',
    titleBn: 'সুষম বহুভুজের প্রতিটি কোণ',
    descEn: 'Find the measure of each interior angle of an n-sided regular polygon.',
    descBn: 'একটি n-পার্শ্বযুক্ত সুষম বহুভুজের প্রতিটি অন্তঃস্থ কোণের মান কত তা সহজে নির্ণয় করুন।',
    formula: 'a = \\frac{(n-2) \\times 180^\\circ}{n}',
    exampleEn: 'Regular Hexagon (6 sides) $\\rightarrow \\frac{(6-2) \\times 180^\\circ}{6} = 120^\\circ$',
    exampleBn: 'সুষম ষড়ভুজ (৬টি বাহু) $\\rightarrow \\frac{(৬-২) \\times ১৮০^\\circ}{৬} = ১২০^\\circ$'
  },
  {
    id: 'equilateral_area',
    category: 'geometry',
    titleEn: 'Equilateral Triangle Area',
    titleBn: 'সমবাহু ত্রিভুজের ক্ষেত্রফল',
    descEn: 'Calculate the area of a perfectly equilateral triangle with side length a.',
    descBn: 'a বাহুযুক্ত যেকোনো সমবাহু ত্রিভুজের ক্ষেত্রফল নির্ণয়ের চমৎকার পদ্ধতি।',
    formula: 'A = \\frac{\\sqrt{3}}{4} a^2',
    exampleEn: 'Side = 4 $\\rightarrow \\frac{\\sqrt{3}}{4} \\times 16 = 4\\sqrt{3} \\approx 6.93$',
    exampleBn: 'বাহু = ৪ $\\rightarrow \\frac{\\sqrt{৩}}{৪} \\times ১৬ = ৪\\sqrt{৩} \\approx ৬.৯৩$'
  }
];
