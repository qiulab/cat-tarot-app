# Mystic Paws Tarot - Project TODO

## Setup & Infrastructure
- [x] Upload all 78 tarot card images to webdev static assets
- [x] Set up database schema for reading history
- [x] Run database migration

## Backend
- [x] Build tarot card data (all 78 cards with meanings)
- [x] Build tRPC procedure for LLM-powered reading interpretation
- [x] Build tRPC procedure for saving/retrieving reading history
- [x] Reader character definitions with distinct personalities (Mystic Tabby, Shadow Sphinx, Golden Paw Oracle)

## Frontend - Core
- [x] Dark Art Deco global theme (CSS variables, fonts, colors)
- [x] Atmospheric landing page with mystical effects
- [x] Reader character selection screen
- [x] Spread type selection (Single, 3-Card, Celtic Cross, Yes/No)
- [x] Card flip animation (upright/reversed)
- [x] Card draw / spread layout UI
- [x] LLM reading display
- [x] Reading history page
- [x] Particle / ambient animation effects
- [x] Responsive design
- [x] Card Library page showing all 78 cards

## Polish
- [x] Gold filigree accents and decorative borders
- [x] Mystical glow effects on cards
- [x] Smooth transitions between screens
- [x] Loading states for LLM calls
- [x] Error handling
- [x] TypeScript 0 errors
- [x] Tests passing

## UI Polish Pass
- [x] Generate oracle character card art (3 images in same deck style)
- [x] Generate deck hero image for landing page
- [x] Replace cat emoji on hero with deck art image
- [x] Remove Single Card spread option
- [x] Remove reversed card logic entirely
- [x] Draw one card at a time (sequential reveal)
- [x] Remove all cursive/italic fonts, use readable upright text (Inter)
- [x] Shorten oracle descriptions, cleaner layout
- [x] Update LLM prompts: modern tone, concise, with highlights (no old-timey language)
- [x] Make card images bigger/more prominent on mobile

## UI Refinements Round 2
- [x] Home: larger hero deck image, smaller title text, remove subtitle
- [x] Oracle selection: horizontal scroll carousel, slightly smaller images
- [x] Card draw: horizontal scroll carousel with reveal-all button
- [x] Reading result: always append "One Action to Take This Week" section

## UX Improvements Round 3
- [x] Oracle carousel: auto-center middle card on load, scroll to selected card
- [x] Oracle carousel: native touch/swipe scroll (CSS scroll-snap + touch, fade edges)
- [x] Card draw carousel: native touch/swipe scroll + touch-action pan-x
- [x] LLM loading: full-screen mystical loading animation (orbiting stars, floating card, shimmer bar)
- [x] General UX audit: swipe hint text added below oracle carousel

## Features Round 4
- [x] Share button on reading result (copy to clipboard)
- [x] Haptic feedback on card flip (Web Vibration API)
- [x] Oracle carousel: peek adjacent cards on mobile, desktop shows all 3 side by side
- [x] Card draw carousel: full-width snap carousel with peek
- [x] Ambient mystical background music with mute/unmute toggle (bottom-right)

## UI Fixes Round 5
- [x] Spread cards: equal height (stretch to tallest), text vertically centered
- [x] Oracle carousel: cards centered on desktop, not left-aligned
- [x] Mobile oracle page: fix top content being cut off (scroll/padding issue)
- [x] Page transitions: smooth fade/slide animation between all route changes
