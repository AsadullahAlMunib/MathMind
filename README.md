<div align="center">

<br/>

<img width="130" src="./icon.png"/>

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

**Math Mind** is a full-featured, gamified math quiz app powered by **Google Gemini AI** — generating fresh, unique questions every single session. Earn coins, level up, unlock premium themes, compete on the leaderboard, and track your progress with beautiful analytics.

No internet? No problem — a **built-in offline engine** kicks in automatically without any interruption.

Fully supports **English 🇬🇧** and **Bengali 🇧🇩** — including AI-generated questions and explanations in Bengali.

<br/>

---

## ✨ Features

<br/>

| | Feature | Description |
|---|---|---|
| 🤖 | **AI Question Engine** | Google Gemini AI generates 10 unique questions per session |
| 📶 | **Offline Fallback** | No internet? A local engine takes over seamlessly |
| 🌐 | **Bilingual Support** | Full English & Bengali — switch with one tap |
| 🎯 | **5 Question Types** | MCQ, True/False, Fill-in-Blank, Calculation, Matching |
| ⏱️ | **Countdown Timer** | Per-question timer with Pause / Resume |
| ⚡ | **Speed Bonus** | Answer faster → earn more points |
| 📊 | **Rich Analytics** | Pie chart, Radar chart, GitHub-style activity heatmap |
| 🎨 | **10 Unlockable Themes** | Buy themes with earned coins — all with dark mode variants |
| 🏆 | **Achievements System** | 6 milestone-based rewards with toast notifications |
| 🔁 | **Review Mode** | Revisit your wrong answers to master weak areas |
| 👥 | **AI Rivals** | Compete against 10 legendary math rival bots |
| 🔢 | **KaTeX Rendering** | Beautiful LaTeX math formula display |
| 🔊 | **Sound Effects** | Toggle game sounds on/off from settings |
| 💾 | **Local Persistence** | All progress saved to device — no account needed |
| 🌓 | **Dark Mode** | Toggle light/dark from the header at any time |
| 📱 | **Android APK** | Installable as a native Android app |

<br/>

---

## 📱 Android App

Math Mind is available as an installable **Android APK** built with Capacitor.

**[⬇️ Download Latest APK](https://github.com/AsadullahAlMunib/MathMind/raw/refs/heads/main/download/MathMind.apk)**

The APK is automatically built via **GitHub Actions** on every push to `main`. No local Android Studio setup required.

<br/>

---

## 🗺️ App Navigation

The app has **5 tabs** — sidebar on desktop, bottom bar on mobile:

```
┌──────────────────────────────────────────────────────┐
│  📊  Dashboard    Stats, charts, heatmap, quick-start │
│  🎮  Quiz         Choose difficulty and play          │
│  🏆  Leaderboard  Compete against rival bots          │
│  🛍️  Store         Buy themes with your coins          │
│  👤  Profile       Name, avatar, language, theme      │
└──────────────────────────────────────────────────────┘
```

<br/>

---

## 🎮 How to Play

### 1 · Choose Your Difficulty

| Mode | Topics | Timer | Base Points |
|---|---|---|---|
| 🟢 **Basic** | Addition, Subtraction, Multiplication, Division | 30 sec | 10 pts |
| 🟡 **Normal** | Algebra, Percentages, Fractions, Squares, Geometry | 30 sec | 25 pts |
| 🔴 **Hard** | Exponents, Equations, Compound Word Problems | 30 sec | 50 pts |

### 2 · Answer Questions

Five question formats appear throughout the quiz:

**① Multiple Choice** — tap one of 4 options  
**② True / False** — two buttons, one choice  
**③ Fill in the Blank** — type your answer  
**④ Calculation** — solve step by step  
**⑤ Matching** — pair the correct items  

### 3 · Scoring Formula

```
Total Points = Base Points + Speed Bonus

Speed Bonus:
  Basic / Normal  →  time remaining × 1.5
  Hard            →  time remaining × 2.5

Example (Hard, 15 sec remaining):
  50 + (15 × 2.5) = 87.5 pts
```

### 4 · Read the Explanation

After every answer, the **Logic Breakdown** panel reveals:
- ✅ Correct → green highlight + how-to explanation
- ❌ Wrong → correct answer + full solution walkthrough

### 5 · API Key & Question Source

The app works in two modes depending on whether an API key is set:

| | No API Key | With API Key |
|---|---|---|
| **Question Source** | Built-in offline engine (algorithmically generated) | Google Gemini AI (fresh, creative questions every session) |
| **Question Quality** | Good — covers all difficulty levels | Excellent — varied, context-rich, word problems included |
| **Works Offline** | ✅ Yes | ❌ Requires internet |
| **Setup Required** | None — works out of the box | Paste your key once in Profile |

**How to get a free Gemini API key:**

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Log in with any Google account
3. Click **"Get API key"** → **"Create API key in new project"**
4. Copy the key and paste it into the app's **API Key** field in Settings

> 🔒 **Security:** Your key is saved only in your browser's local storage. It is never sent to any server.

### 6 · Results & Rewards

After all 10 questions:
- Points added to your **coin balance**
- **High Score** updated if beaten
- Wrong answers saved in **Missed Questions** bank
- Newly unlocked **Achievements** pop as toast notifications 🎉

<br/>

---

## 🔁 Review Mode

Once you've missed **5 or more** questions, the Dashboard shows a Review Banner to replay only your wrong answers — no new AI generation needed. Stores up to **50 missed questions**.

<br/>

---

## 📊 Dashboard Analytics

```
┌─── QUICK STATS ─────────────────────────────────────┐
│  💰 Balance   🎯 Level   ⚡ Quizzes   🔥 Best Streak │
└─────────────────────────────────────────────────────┘

┌─── CHARTS ──────────────────────────────────────────┐
│  Accuracy View  →  Pie Chart (correct vs wrong %)   │
│  Mastery View   →  Radar Chart (score by mode)      │
└─────────────────────────────────────────────────────┘

┌─── ACTIVITY HEATMAP ────────────────────────────────┐
│  GitHub-style grid showing last 50 days of quizzes  │
└─────────────────────────────────────────────────────┘

┌─── PERSONAL BESTS ──────────────────────────────────┐
│  Bar Chart — highest score per difficulty            │
└─────────────────────────────────────────────────────┘
```

**Level System** — each level requires ×1.2 more points than the previous:
```
Level 1 → 2  :   500 pts  (lifetime:   500)
Level 2 → 3  :   600 pts  (lifetime: 1,100)
Level 3 → 4  :   720 pts  (lifetime: 1,820)
Level 4 → 5  :   864 pts  (lifetime: 2,684)
Level 5 → 6  : 1,037 pts  (lifetime: 3,721)
... and so on, multiplying by 1.2 each time
```

<br/>

---

## 🏆 Achievements

| Badge | Achievement | How to Unlock |
|---|---|---|
| 🎯 | **First Step** | Complete your very first quiz |
| ⚡ | **Warm Up Master** | Score a perfect 1,000 pts in Basic mode |
| 🔥 | **On Fire** | Reach a best streak of 10 or more |
| 🪙 | **Point Hoarder** | Accumulate 10,000 total points |
| 🎨 | **Fashionable** | Unlock any 5 themes from the Store |
| 👑 | **Math Legend** | Score above 4,000 pts in a single Hard session |

<br/>

---

## 🎨 Theme Store

| # | Theme | Cost | Palette |
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
| 🎨 | **Custom Theme** | 🪙 40,000 | Pick your own primary & secondary colors |

Every theme ships with a full **dark mode variant**. Purchased themes never expire.

<br/>

---

## 👥 Leaderboard Rivals

Compete against **10 AI rival bots** inspired by history's greatest mathematicians:

`Euler_Math` · `Pythagoras` · `Gauss_99` · `Hypatia_X` · `Newton_Apple`  
`Ada_L` · `Ramanujan` · `Descartes` · `Fibonacci` · `Leibniz_DT`

Each rival has a trend indicator (`↑ up`, `↓ down`, `→ stable`) based on their recent activity.

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

Add your API key to `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

```bash
# 4. Start the dev server
npm run dev
```

Open **`http://localhost:3000`** — you're ready to play!

> **No API key? Still works.** Without a key or when offline, the app automatically uses the built-in offline question engine.

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
| **Build Tool** | Vite 6 | Fast HMR dev server and bundler |
| **Styling** | Tailwind CSS v4 | Utility-first CSS + theme variables |
| **AI** | Google Gemini API | Real-time question generation |
| **Animation** | Motion (Framer Motion) | Page transitions & micro-interactions |
| **Charts** | Recharts | Pie, Radar, and Bar charts |
| **Math Rendering** | KaTeX + react-katex | LaTeX formula display |
| **Icons** | Lucide React | Consistent icon set |
| **Dates** | date-fns | Activity heatmap date handling |
| **Mobile** | Capacitor | Android APK packaging |
| **Storage** | Browser `localStorage` | Persistent state without a database |

<br/>

---

## 🗂️ Project Structure

```
MathMind/
├── src/
│   ├── components/
│   │   ├── Quiz.tsx              # Core gameplay: timer, answers, scoring
│   │   ├── Dashboard.tsx         # Stats, charts, heatmap, quick actions
│   │   ├── Leaderboard.tsx       # Rival competition board
│   │   ├── Store.tsx             # Theme marketplace
│   │   ├── Profile.tsx           # User profile and settings
│   │   ├── Achievements.tsx      # Achievement display and tracking
│   │   ├── Tutorial.tsx          # First-time onboarding flow
│   │   ├── Logo.tsx              # App logo component
│   │   ├── QuotaModal.tsx        # API quota limit handler
│   │   └── Tooltip.tsx           # Reusable tooltip wrapper
│   ├── lib/
│   │   ├── quizEngine.ts         # Gemini AI + offline question generator
│   │   ├── types.ts              # THEMES, ACHIEVEMENTS, all TS interfaces
│   │   ├── storage.ts            # localStorage read/write helpers
│   │   ├── translations.ts       # English & Bengali string maps
│   │   ├── levelUtils.ts         # XP and level calculation helpers
│   │   └── sounds.ts             # Sound effect manager
│   ├── App.tsx                   # Root: navigation, state, theme, toasts
│   └── main.tsx                  # Entry point
├── .github/
│   └── workflows/
│       └── build.yml             # Android APK auto-build workflow
├── icon.png                      # Android launcher icon (1024×1024)
├── index.html
├── .env.example                  # API key template
├── metadata.json                 # App description and capabilities
├── capacitor.config.json         # Capacitor Android config
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
