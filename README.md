<div align="center">

# 🐾 Mystic Paws Tarot

### A full-stack AI-powered tarot card reading web app — all 78 cards reimagined as dark, opulent Art Deco cat illustrations

[![Live Demo](https://img.shields.io/badge/🔮_Live_Demo-cat--tarot--mue8fevu.manus.space-c9a84c?style=for-the-badge)](https://cat-tarot-mue8fevu.manus.space)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![tRPC](https://img.shields.io/badge/tRPC-11-398CCB?style=for-the-badge)](https://trpc.io/)

</div>

---

## ✨ Live Demo

**[→ Try Mystic Paws Tarot](https://cat-tarot-mue8fevu.manus.space)**

Draw cards, choose your oracle, ask a question, and receive a fully AI-generated tarot reading — all styled in a dark, jewel-toned Art Deco aesthetic with original cat-illustrated card artwork.

---

## 🃏 Card Artwork

Three cards from the full 78-card deck, each a dark opulent Art Deco cat illustration:

<div align="center">

| The High Priestess | The Star | The Moon |
|:---:|:---:|:---:|
| <img src="https://cat-tarot-mue8fevu.manus.space/manus-storage/card_high_priestess_4e62bad3.png" width="200" alt="The High Priestess — a serene cat between two pillars, keeper of hidden mysteries" /> | <img src="https://cat-tarot-mue8fevu.manus.space/manus-storage/card_the_star_15bed3e3.png" width="200" alt="The Star — a luminous cat beneath a canopy of stars, pouring water into a still pool" /> | <img src="https://cat-tarot-mue8fevu.manus.space/manus-storage/card_the_moon_c83d90e8.png" width="200" alt="The Moon — a mysterious cat beneath a full moon, navigating the path between shadow and light" /> |
| *Intuition · Sacred Knowledge* | *Hope · Renewal · Serenity* | *Illusion · Intuition · Dreams* |

</div>

---

## 📸 Preview

| Landing Page | Reading Experience | Card Library |
|:---:|:---:|:---:|
| Dark atmospheric hero with particle effects | Animated card flip reveal + LLM interpretation | Browse all 78 cat-illustrated cards |

---

## 🃏 About the Project

Mystic Paws Tarot is a full-stack web application that combines **AI-generated artwork**, **LLM-powered interpretations**, and a rich **dark Art Deco visual design** to deliver an immersive tarot reading experience.

Every one of the 78 cards in the standard Rider-Waite-Smith deck has been reimagined as a **dark, opulent Art Deco cat illustration** — featuring stoic feline figures in royal robes, ornate gold borders, jewel-toned backgrounds, and dramatic painterly detail. The app then uses **Groq Llama 3.3 70B** to generate personalised, narrative-style readings based on the drawn cards, their positions in the spread, and the chosen oracle character's personality.

This project was built entirely with free tools and a fully custom AI image generation pipeline for all 78 card artworks.

---

## 🔮 Features

### Tarot Spreads
The app supports three spread types drawn from traditional Rider-Waite-Smith practice:

| Spread | Cards | Purpose |
|--------|-------|---------|
| **Yes or No** | 1 | Direct answer to a binary question |
| **Past · Present · Future** | 3 | Journey of a situation through time |
| **Celtic Cross** | 10 | Full deep-dive reading with positional context |

### Oracle Characters
Three distinct reader personalities each shape the tone and style of every LLM-generated reading:

| Character | Title | Personality |
|-----------|-------|-------------|
| 🐱 **The Mystic Tabby** | Seer of Hidden Truths | Poetic, cosmic, compassionate — speaks in flowing metaphors of stars and moonlight |
| 🖤 **The Shadow Sphinx** | Keeper of Dark Mysteries | Sharp, aristocratic, unflinching — delivers cold clarity with dark elegance |
| ✨ **The Golden Paw Oracle** | Beacon of Radiant Wisdom | Warm, celebratory, abundant — finds the golden thread of opportunity in every card |

### Card Artwork
All 78 cards are original AI-generated illustrations in a consistent **dark opulent Art Deco style**:
- Deep black backgrounds with rich jewel tones (purple, crimson, forest green)
- Ornate gold Art Deco borders with filigree detail
- Realistic, stoic cat faces — no cartoonish expressions, no human features
- Painterly, highly detailed compositions faithful to RWS symbolism

### Reading Experience
- **Animated card flip** — cards start face-down and flip with a smooth 3D CSS animation to reveal the illustration
- **Swipe carousel** — drawn cards are displayed in a touch-native horizontal swipe carousel with peek of adjacent cards and progress dots
- **LLM-powered narrative reading** — the oracle generates a rich, cohesive multi-paragraph reading for the full spread, always ending with a concrete "One Action to Take This Week"
- **Reading history** — all readings are saved per session to the database and viewable on the History page
- **Card Library** — browse, filter by suit, and search all 78 cards with their meanings
- **Share reading** — copy the full reading text to clipboard with one tap
- **Haptic feedback** — card flip triggers a subtle vibration on supported mobile devices (Web Vibration API)
- **Ambient music** — optional mystical background music with a mute/unmute toggle in the corner
- **Full-screen loading overlay** — orbiting stars and rotating messages while the LLM generates the reading

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Node.js, Express 4, tRPC 11 |
| **Database** | MySQL (via Drizzle ORM) |
| **LLM** | Groq Llama 3.3 70B (`llama-3.3-70b-versatile`) |
| **Auth** | Manus OAuth (session cookie-based) |
| **Storage** | S3-compatible object storage for card images |
| **Fonts** | Cinzel, Inter (Google Fonts) |
| **Animations** | CSS 3D card flip, CSS scroll-snap carousel, CSS particle effects |
| **Build** | Vite 7, esbuild, pnpm |

---

## 🏗 Architecture

```
cat-tarot-app/
├── client/src/
│   ├── pages/
│   │   ├── Home.tsx          # Landing page with spread & reader selection
│   │   ├── Reading.tsx       # Full reading flow (spread → reader → draw → interpret)
│   │   ├── CardLibrary.tsx   # Browse all 78 cards with filter & search
│   │   └── History.tsx       # Session reading history
│   ├── components/
│   │   ├── AmbientMusic.tsx        # Background music player with mute toggle
│   │   ├── MysticLoader.tsx        # Full-screen LLM loading animation
│   │   └── ParticleBackground.tsx  # Ambient floating particle effect
│   └── index.css             # Dark Art Deco theme (CSS variables, animations)
├── server/
│   └── routers.ts            # tRPC procedures: generateReading, getHistory, getCards
├── shared/
│   └── tarotData.ts          # All 78 cards with images, meanings, keywords + reader characters
└── drizzle/
    └── schema.ts             # readings table schema
```

### Key Design Decisions

**Type-safe end-to-end with tRPC** — all client-server communication uses tRPC procedures with Zod validation, eliminating the need for REST endpoints or manual type sharing.

**LLM on the server only** — the Groq API key never reaches the client. All reading generation happens inside tRPC mutations, keeping credentials secure.

**78 cards as static shared data** — the full card dataset (names, meanings, keywords, image URLs) lives in `shared/tarotData.ts`, imported by both client and server. This avoids unnecessary database reads for static content while keeping card logic type-safe.

**Session-scoped history** — reading history is keyed by a `sessionStorage` UUID, requiring no login for the core experience while still persisting readings to the database for the session duration.

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/qiulab/cat-tarot-app.git
cd cat-tarot-app

# Install dependencies
pnpm install

# Set up environment variables
# (requires DATABASE_URL, JWT_SECRET, GROQ_API_KEY)
cp .env.example .env

# Run database migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Start the development server
pnpm dev
```

The app runs on `http://localhost:3000` with Vite HMR for the frontend and `tsx watch` for the backend.

---

## 🎨 Card Artwork Process

All 78 card illustrations were generated using an AI image generation pipeline with a carefully crafted style prompt to ensure visual consistency across the full deck:

> *Dark opulent Art Deco tarot card. Deep black background with rich jewel tones. Realistic cat with stoic, neutral feline expression wearing ornate robes. Intricate gold Art Deco border with filigree. Dramatic painterly lighting. No cartoonish features. No human hair or faces.*

Each card was individually prompted with its specific RWS symbolism (e.g., the throne and ram motifs for The Emperor, the celestial crown and kittens for The Empress), then reviewed and iterated to maintain quality and thematic accuracy across all 78 cards.

---

## 📋 Tarot Card Coverage

**22 Major Arcana** — The Fool through The World, all individually illustrated with their traditional RWS symbolism translated into feline form.

**56 Minor Arcana** — All four suits (Wands, Cups, Swords, Pentacles), Ace through Ten plus Page, Knight, Queen, and King for each suit.

---

## 🔭 Potential Extensions

- **User accounts** — persist reading history across sessions with Manus OAuth login
- **Daily card push notifications** — scheduled daily draw delivered via email or browser notification
- **Card journaling** — allow users to write personal notes attached to each reading
- **Shareable reading URLs** — generate a unique permalink for each reading to share with others
- **Additional oracle characters** — expand the reader roster with new personalities

---

## 📄 License

MIT — feel free to fork, adapt, and build upon this project.

---

<div align="center">

**✦ Built with curiosity, cats, and a touch of cosmic mystery ✦**

[🔮 Try the Live App](https://cat-tarot-mue8fevu.manus.space) · [GitHub](https://github.com/qiulab/cat-tarot-app)

</div>
