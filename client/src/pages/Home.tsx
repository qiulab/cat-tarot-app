import { Link } from "wouter";
import { useRef } from "react";
import { READER_CHARACTERS, SPREAD_TYPES } from "@shared/tarotData";
import { motion } from "framer-motion";

const SPREAD_COLORS: Record<string, string> = {
  "yes-no": "border-teal-700/40 hover:border-teal-500/70",
  "three-card": "border-purple-700/40 hover:border-purple-500/70",
  "celtic-cross": "border-rose-700/40 hover:border-rose-500/70",
};

const DECK_HERO = "/manus-storage/deck_hero_1547baae.png";

export default function Home() {
  const oracleRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      className="relative min-h-screen"
      style={{ zIndex: 1 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(74,29,122,0.25) 0%, rgba(10,10,10,0) 70%), radial-gradient(ellipse at 80% 80%, rgba(139,105,20,0.15) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-amber-900/30">
          <span className="font-cinzel text-amber-400 text-base tracking-widest">✦ Mystic Paws ✦</span>
          <div className="flex gap-6">
            <Link href="/cards">
              <span className="font-cinzel text-sm text-amber-600/70 hover:text-amber-400 transition-colors cursor-pointer tracking-wider">
                Card Library
              </span>
            </Link>
            <Link href="/history">
              <span className="font-cinzel text-sm text-amber-600/70 hover:text-amber-400 transition-colors cursor-pointer tracking-wider">
                Past Readings
              </span>
            </Link>
          </div>
        </nav>

        {/* Hero — deck image as main focal point */}
        <section className="container max-w-5xl mx-auto px-6 pt-10 pb-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
            {/* Deck art — larger */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9 }}
              className="flex-shrink-0 float-anim"
            >
              <div
                className="w-72 md:w-96 rounded-lg overflow-hidden"
                style={{
                  border: "2px solid rgba(201,168,76,0.6)",
                  boxShadow: "0 0 60px rgba(201,168,76,0.35), 0 0 120px rgba(74,29,122,0.3)",
                }}
              >
                <img
                  src={DECK_HERO}
                  alt="Mystic Paws Tarot Deck"
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

            {/* Title + CTA — smaller title */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center md:text-left"
            >
              <h1
                className="font-display text-4xl md:text-5xl mb-5 leading-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #8b6914 0%, #c9a84c 40%, #e8c96a 60%, #c9a84c 80%, #8b6914 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Mystic Paws
                <br />
                Tarot
              </h1>

              <div className="ornate-divider max-w-xs mb-7 md:mx-0 mx-auto">
                <span className="font-cinzel text-xs text-amber-500/60 tracking-[0.3em]">✦ ✦ ✦</span>
              </div>

              <Link href="/reading">
                <button
                  className="font-cinzel tracking-widest text-sm px-10 py-4 border border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black transition-all duration-300 pulse-gold uppercase cursor-pointer"
                  style={{ letterSpacing: "0.25em" }}
                >
                  Begin Your Reading
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Oracles */}
        <div className="ornate-divider max-w-2xl mx-auto px-6 mb-10">
          <span className="font-cinzel text-xs text-amber-600/40 tracking-[0.3em]">◆ Choose Your Oracle ◆</span>
        </div>

        <section className="mb-20">
          {/* Desktop: 3 cards centered side-by-side */}
          <div className="hidden md:flex justify-center gap-5 px-6">
            {READER_CHARACTERS.map((reader, i) => (
              <motion.div
                key={reader.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                style={{ width: "200px" }}
              >
                <Link href={`/reading?reader=${reader.id}`}>
                  <div
                    className="deco-border overflow-hidden cursor-pointer transition-all duration-300 hover:glow-gold hover:scale-105 group"
                    style={{ background: "rgba(17,17,17,0.85)" }}
                  >
                    <div className="w-full overflow-hidden" style={{ aspectRatio: "3/4" }}>
                      <img
                        src={reader.image}
                        alt={reader.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-cinzel text-amber-400 text-xs tracking-wide mb-1 group-hover:text-amber-300 transition-colors">
                        {reader.name}
                      </h3>
                      <div className="font-cinzel text-xs tracking-widest" style={{ color: reader.accentColor, fontSize: "0.6rem" }}>
                        {reader.title}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile: peek carousel */}
          <div className="md:hidden relative">
            <div className="absolute left-0 top-0 bottom-8 w-10 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0d0d1a 40%, transparent)" }} />
            <div className="absolute right-0 top-0 bottom-8 w-10 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0d0d1a 40%, transparent)" }} />
            <div
              ref={oracleRef}
              className="flex overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                gap: "16px",
                paddingLeft: "calc(50vw - 85px)",
                paddingRight: "calc(50vw - 85px)",
              }}
            >
              {READER_CHARACTERS.map((reader, i) => (
                <motion.div
                  key={reader.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                  className="flex-shrink-0 snap-center"
                  style={{ width: "170px" }}
                >
                  <Link href={`/reading?reader=${reader.id}`}>
                    <div
                      className="deco-border overflow-hidden cursor-pointer transition-all duration-300 hover:glow-gold group"
                      style={{ background: "rgba(17,17,17,0.85)" }}
                    >
                      <div className="w-full overflow-hidden" style={{ aspectRatio: "3/4" }}>
                        <img
                          src={reader.image}
                          alt={reader.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3 text-center">
                        <h3 className="font-cinzel text-amber-400 text-xs tracking-wide mb-1 group-hover:text-amber-300 transition-colors">
                          {reader.name}
                        </h3>
                        <div className="font-cinzel text-xs tracking-widest" style={{ color: reader.accentColor, fontSize: "0.6rem" }}>
                          {reader.title}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <p className="text-center font-cinzel text-amber-600/30 text-xs tracking-widest mt-1">← swipe to explore →</p>
          </div>
        </section>

        {/* Footer strip */}
        <div className="border-t border-amber-900/20 py-8 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
            {[
              { label: "78 Cat Cards", desc: "Full Rider-Waite deck" },
              { label: "AI Oracle", desc: "LLM-powered readings" },
              { label: "Reading History", desc: "Save your journey" },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1">
                <span className="font-cinzel text-amber-400 text-xs tracking-wider">{f.label}</span>
                <span className="font-sans text-amber-700/60 text-xs">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <footer className="border-t border-amber-900/20 py-6 text-center">
          <p className="font-cinzel text-xs text-amber-600/30 tracking-widest">
            ✦ MYSTIC PAWS TAROT ✦ 78 CARDS ✦ FELINE WISDOM ✦
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
