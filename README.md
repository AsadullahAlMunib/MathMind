<div align="center">

<br/>

<img width="120" src="./icon.png"/>

<br/><br/>

# MATH MIND

**AI-Powered Gamified Math Quiz App**

<br/>

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.8-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_v4-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/Apache_2.0-22C55E?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)

<br/>

*Solve. Earn. Unlock. Repeat.*

<br/>

[📱 Download Android APK](https://github.com/AsadullahAlMunib/MathMind/raw/refs/heads/main/download/MathMind.apk) · [⭐ Star on GitHub](https://github.com/AsadullahAlMunib/MathMind) · [🐛 Report a Bug](https://github.com/AsadullahAlMunib/MathMind/issues)

<br/>

---

</div>

## 🧠 What is Math Mind?

Math Mind is a **full-stack gamified math quiz app** where every session is powered by **Google Gemini AI** — generating fresh, unique questions each time you play. Earn points, level up, unlock premium themes, and track your performance with beautiful charts. No internet? No problem — a built-in **offline engine** kicks in automatically.

Supports both **English 🇬🇧** and **Bengali 🇧🇩** — including AI-generated questions in Bengali.

<br/>

---

## ✨ Features at a Glance

<br/>

| | Feature | Description |
|---|---|---|
| 🤖 | **AI Question Engine** | Google Gemini `gemini-3.1-flash-lite` generates 10 unique questions per session |
| 📶 | **Offline Fallback** | No internet or API key? A local question engine takes over seamlessly |
| 🌐 | **Bilingual** | Full English & Bengali support — switch with one tap |
| 🎯 | **3 Question Types** | Multiple Choice, True/False, and Fill-in-the-Blank |
| ⏱️ | **Countdown Timer** | Per-question timer with Pause / Resume functionality |
| ⚡ | **Speed Bonus** | Answer faster to earn more points on top of base score |
| 📊 | **Rich Analytics** | Pie chart, Radar chart, GitHub-style activity heatmap |
| 🎨 | **10 Unlockable Themes** | Buy themes with earned coins — all with dark mode variants |
| 🏆 | **6 Achievements** | Milestone-based rewards with toast notifications |
| 🔁 | **Review Mode** | Revisit questions you got wrong to master weak areas |
| 💾 | **Local Persistence** | All progress saved to browser storage — no account needed |
| 🌓 | **Dark Mode** | Toggle light/dark from the header at any time |

<br/>

---

## 🗺️ App Navigation

The app has **5 tabs** — a sidebar on desktop, a bottom bar on mobile:

```
┌─────────────────────────────────────────────────────┐
│  📊  Dashboard    Stats, charts, and quick-start     │
│  🎮  Quiz         Choose difficulty and play         │
│  🏆  Leaderboard  Personal high score board          │
│  🛍️  Store         Buy themes with your coins         │
│  👤  Profile       Name, avatar, language settings   │
└─────────────────────────────────────────────────────┘
```

<br/>

---

## 🎮 How to Play — Step by Step

<br/>

### Step 1 · Choose Your Difficulty

Head to the **Quiz tab** and pick a mode:

| Mode | Topics Covered | Timer | Base Points |
|---|---|---|---|
| 🟢 **Basic** | Addition, Subtraction, Multiplication, Division (up to 100) | 30 sec | 10 pts |
| 🟡 **Normal** | Algebra, Percentages, Fractions, Squares, Basic Geometry | 30 sec | 25 pts |
| 🔴 **Hard** | Exponents, Circle Geometry, Simultaneous Equations, Compound Word Problems | **20 sec** | 50 pts |

> You can also hit **"Start Quiz"** on the Dashboard to jump straight into Basic mode.

<br/>

### Step 2 · Wait for AI to Generate Questions

Once a difficulty is selected, Gemini AI generates **10 fresh questions**. You'll see an animated loading screen:

```
  ⠿  Formulating Challenges...
     Synthesizing math puzzles...
```

> If you're offline or missing an API key, the app silently switches to the **offline question engine** — no error, no interruption.

<br/>

### Step 3 · Answer the Question

Three question formats can appear:

**① Multiple Choice** — tap one of 4 options

```
  What is 15% of 200?

  ┌──────────┐  ┌──────────┐
  │    25    │  │   30 ✓   │
  └──────────┘  └──────────┘
  ┌──────────┐  ┌──────────┐
  │    35    │  │    40    │
  └──────────┘  └──────────┘
```

**② True / False** — two buttons, one choice

```
  Is it true that √144 = 12?

  ┌──────────────┐  ┌──────────────┐
  │   True  ✓    │  │    False     │
  └──────────────┘  └──────────────┘
```

**③ Fill in the Blank** — type your answer and submit

```
  Solve for x:  3x + 6 = 21

  Answer: [ 5 ]   →  [ Submit Answer ]
```

<br/>

### Step 4 · Understand the Timer & Scoring

**Timer rules:**
- Basic & Normal → **30 seconds** per question
- Hard → **20 seconds** per question
- Time runs out → question is marked wrong automatically
- Hit **⏸ Pause** to freeze the timer (screen blurs, question hidden)
- Hit **▶ Resume** to continue

**How points are calculated:**

```
  Total Points = Base Points + Speed Bonus

  Speed Bonus:
    Basic / Normal  →  time remaining × 1.5
    Hard            →  time remaining × 2.5

  Example (Hard, 15 seconds remaining):
    50  +  (15 × 2.5)  =  50 + 37.5  =  87.5 pts
```

<br/>

### Step 5 · Read the Explanation

After every answer, the app reveals a **"Logic Breakdown"** panel:

- ✅ **Correct** → green highlight + explanation of how to solve it
- ❌ **Wrong** → red highlight + the correct answer + solution walkthrough

```
  ┌─────────────────────────────────────────────┐
  │ 📖 LOGIC BREAKDOWN                          │
  │                                             │
  │ To find 15% of 200: multiply 200 × 0.15     │
  │ = 30                                        │
  │                                             │
  │ Correct Answer:  30                         │
  └─────────────────────────────────────────────┘
```

Then tap **"Next Question →"** to continue.

<br/>

### Step 6 · See Your Results

After question 10, tap **"See Results"**:

- Total points are added to your **coin balance**
- **High Score** is updated if you beat your previous best
- Wrong answers are stored in your **Missed Questions** bank
- Session **streak** is calculated and compared to your best
- Any newly unlocked **Achievements** pop up as toast notifications 🎉

<br/>

---

## 🔁 Review Mode

If you've missed **5 or more** questions, the Dashboard shows a Review Banner:

```
  ┌──────────────────────────────────────────────────────────┐
  │  ⚡  Challenge Yourself!                                  │
  │                                                          │
  │  You have 8 questions to review.                         │
  │  Practice them to master these concepts!                 │
  │                                                          │
  │           [ Master These Questions → ]                   │
  └──────────────────────────────────────────────────────────┘
```

Review Mode replays your saved wrong questions — no new AI generation needed. The app stores up to **50 missed questions** (oldest drop off as new ones come in).

<br/>

---

## 📊 Dashboard Analytics

```
  ┌─── QUICK STATS ────────────────────────────────────┐
  │  💰 Balance   🎯 Level   ⚡ Quizzes   🔥 Streak    │
  └────────────────────────────────────────────────────┘

  ┌─── ANALYTICS (toggle between views) ──────────────┐
  │  Accuracy View  →  Pie Chart (correct vs wrong %)  │
  │  Mastery View   →  Radar Chart (score by mode)     │
  └────────────────────────────────────────────────────┘

  ┌─── ACTIVITY HEATMAP ───────────────────────────────┐
  │  GitHub-style grid showing last 50 days of quizzes │
  └────────────────────────────────────────────────────┘

  ┌─── PERSONAL BESTS ─────────────────────────────────┐
  │  Bar Chart — highest score per difficulty           │
  └────────────────────────────────────────────────────┘
```

**Level System:**
```
  Every 1,000 points  =  1 Level Up
  Level 1: 0 – 999 pts
  Level 2: 1,000 – 1,999 pts
  Level 3: 2,000 – 2,999 pts
  ... and so on
```

<br/>

---

## 🎨 Theme Store

Spend your earned coins in the **Store tab** to unlock new visual themes. Every theme includes a full dark mode variant.

| # | Theme | Cost | Primary Color |
|---|---|---|---|
| 1 | **Default** | 🆓 Free | Indigo / Violet |
| 2 | **Emerald Forest** | 🪙 500 | Emerald Green |
| 3 | **Sunset Glow** | 🪙 1,000 | Amber / Orange |
| 4 | **Cyberpunk** | 🪙 2,500 | Neon Magenta + Cyan |
| 5 | **Royal Gold** | 🪙 5,000 | Gold / Warm Brown |
| 6 | **Ocean Breeze** | 🪙 7,500 | Sky Blue / Cyan |
| 7 | **Lavender Dream** | 🪙 10,000 | Purple / Violet |
| 8 | **Monochrome Pro** | 🪙 15,000 | Pure Black & White |
| 9 | **Nebula** | 🪙 20,000 | Deep Pink / Indigo |
| 10 | **Crimson Fury** | 🪙 30,000 | Bold Red |

> After purchasing a theme, tap **"Select"** to apply it. Purchased themes never expire.

<br/>

---

## 🏆 Achievements

Unlock all 6 achievements by hitting specific milestones. A toast notification appears the moment one is unlocked.

| Badge | Achievement | How to Unlock |
|---|---|---|
| 🎯 | **First Step** | Complete your very first quiz |
| ⚡ | **Warm Up Master** | Score a perfect 1,000 pts in Basic mode |
| 🔥 | **On Fire** | Reach a best streak of 10 or more |
| 🪙 | **Point Hoarder** | Accumulate 10,000 total points |
| 🎨 | **Fashionable** | Unlock any 5 themes from the Store |
| 👑 | **Math Legend** | Score above 4,000 pts in a single Hard mode session |

<br/>

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js** v18 or higher
- **npm** (bundled with Node.js)
- **Gemini API Key** — [Get one free here](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AsadullahAlMunib/MathMind.git
cd MathMind

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
```

Open `.env.local` and add your key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

```bash
# 4. Start the dev server
npm run dev
```

Open your browser at **`http://localhost:3000`** — you're ready to play!

> **No API key? Still works.** Without a key (or offline), the app automatically uses the built-in question engine. No setup required to try it out.

<br/>

---

## 📜 NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create an optimized production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Delete the `dist/` output folder |

<br/>

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **UI Framework** | React 19 + TypeScript | Component architecture & type safety |
| **Build** | Vite 6 | Fast HMR dev server and bundler |
| **Styling** | Tailwind CSS v4 | Utility-first CSS + theme variables |
| **AI** | Google Gemini (`gemini-3.1-flash-lite`) | Real-time question generation |
| **Animation** | Motion (Framer Motion) | Page transitions, micro-interactions |
| **Charts** | Recharts | Pie, Radar, and Bar charts |
| **Icons** | Lucide React | Consistent icon set |
| **Backend** | Express.js | Server-side support layer |
| **Dates** | date-fns | Activity heatmap date handling |
| **Storage** | Browser `localStorage` | Persistent state without a database |

<br/>

---

## 🗂️ Project Structure

```
MathMind/
├── src/
│   ├── components/
│   │   ├── Quiz.tsx           # Core gameplay: timer, answers, scoring
│   │   ├── Dashboard.tsx      # Stats, charts, heatmap, quick actions
│   │   ├── Store.tsx          # Theme marketplace
│   │   ├── Leaderboard.tsx    # Personal high score board
│   │   ├── Profile.tsx        # User profile and settings
│   │   ├── Tutorial.tsx       # First-time onboarding flow
│   │   └── Tooltip.tsx        # Reusable tooltip wrapper
│   ├── lib/
│   │   ├── quizEngine.ts      # Gemini AI + offline question generator
│   │   ├── types.ts           # THEMES, ACHIEVEMENTS, all TS interfaces
│   │   ├── storage.ts         # localStorage read/write helpers
│   │   └── translations.ts    # English & Bengali string maps
│   ├── App.tsx                # Root: navigation, state, theme, toasts
│   └── main.tsx               # Entry point
├── index.html
├── .env.example               # API key template
├── metadata.json              # App description and capabilities
├── package.json
├── vite.config.ts
└── tsconfig.json
```

<br/>

---

<div align="center">

Made with ❤️ by **[Md Asadullah Al Munib](https://github.com/AsadullahAlMunib)**

[![GitHub](https://img.shields.io/badge/GitHub-AsadullahAlMunib-181717?style=flat-square&logo=github)](https://github.com/AsadullahAlMunib)

*© 2026 Math Mind · Apache 2.0 License · Built with Google AI Studio*

</div>
