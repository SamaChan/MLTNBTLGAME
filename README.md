# 🚀 BATTLEDLE - Real-time Wordle Battle Arena

A multiplayer Wordle battle game with power-ups, ranked matches, and cyberpunk neon aesthetics.

## ✨ Features

- **Real-time Multiplayer** - Play against friends or randoms with instant guess updates
- **6 Game Modes** - Duel (1v1), Arena (2-4), Chaos (5-8), Team Battle, Battle Royale, Stealth
- **6 Power-Ups** - Hint Steal, Freeze, Bomb, Double Guess, Shield, Letter Ban
- **Ranked System** - Bronze to Wordlord with seasons
- **Cyberpunk UI** - Neon dark theme with holographic grids
- **Mobile-First** - Fully responsive PWA design
- **Accessibility** - Color-blind mode, keyboard navigation, screen reader support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **State**: Zustand
- **Animations**: Framer Motion
- **Backend**: Supabase (Auth, Postgres, Realtime)
- **Deploy**: Vercel

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

## 🚀 Local Development Setup

### 1. Clone and Install

```bash
cd Battledle
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Copy and run the contents of `supabase/schema.sql`
4. Go to Project Settings → API
5. Copy the URL and anon key

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Adding More Words

Edit `src/data/words.ts` to add more valid words. The game validates against this list server-side.

## 📦 Building for Production

```bash
npm run build
npm start
```

## ☁️ Deploy to Vercel

1. Push your code to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add your environment variables
4. Deploy!

## 🎮 Game Rules

- **Objective**: Be the first to guess the secret word
- **Feedback**: Green (correct), Yellow (wrong position), Gray (not in word)
- **Power-ups**: Use strategically to gain advantage
- **Letter Ban**: Blocks a letter from opponent for 25 seconds or 2 guesses

## 🔐 Anti-Cheat

- Server-side word validation
- Rate limiting on guess submission
- Client-side state verification

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind + custom styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main entry
├── components/
│   ├── GameArena.tsx    # Main game screen
│   ├── GameGrid.tsx     # Wordle grid + mini grids
│   ├── Keyboard.tsx     # On-screen keyboard
│   ├── Lobby.tsx        # Game mode selection
│   ├── PowerUpPanel.tsx # Power-up buttons
│   └── UI.tsx           # Feed, emotes, victory
├── data/
│   └── words.ts         # Word lists (4-7 letters)
├── hooks/
│   └── useRealtime.ts   # Supabase realtime
├── lib/
│   └── supabase.ts      # Supabase client
├── store/
│   └── gameStore.ts     # Zustand state
└── types/
    └── index.ts         # TypeScript types
```

## 🎨 Tailwind Config Highlights

Custom animations and colors in `tailwind.config.ts`:
- `cyber-glow` - Neon glow effect
- `cyber-card` - Dark card background
- `cyber-text-glow` - Text glow effect
- Animations: glow-pulse, slide-up, shake, pop, banned-flash

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a PR

## 📄 License

MIT

---

Built with ❤️ for the Wordle community
