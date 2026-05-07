import { Link } from "wouter";
import { READER_CHARACTERS, SPREAD_TYPES } from "@shared/tarotData";
import { motion } from "framer-motion";

const SPREAD_ICONS: Record<string, string> = {
  single: "✦",
  "yes-no": "◈",
  "three-card": "✦✦✦",
  "celtic-cross": "✦✦✦✦✦",
};

const SPREAD_COLORS: Record<string, string> = {
  single: "from-amber-900/30 to-yellow-900/10 border-amber-700/40 hover:border-amber-500/70",
  "yes-no": "from-teal-900/30 to-emerald-900/10 border-teal-700/40 hover:border-teal-500/70",
  "three-card": "from-purple-900/30 to-indigo-900/10 border-purple-700/40 hover:border-purple-500/70",
  "celtic-cross": "from-rose-900/30 to-red-900/10 border-rose-700/40 hover:border-rose-500/70",
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ zIndex: 1 }}>
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
          <span className="font-display text-amber-400 text-lg tracking-widest">✦ Mystic Paws ✦</span>
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

        {/* Hero */}
        <section className="text-center px-6 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="float-anim inline-block mb-6"
          >
            <div
              className="text-7xl"
              style={{ filter: "drop-shadow(0 0 20px rgba(201,168,76,0.6))" }}
            >
              🐱
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1
              className="font-display text-4xl md:text-6xl mb-4 leading-tight"
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="ornate-divider max-w-xs mx-auto mb-6"
          >
            <span className="font-cinzel text-xs text-amber-500/60 tracking-[0.3em]">✦ ✦ ✦</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-garamond text-xl text-amber-100/70 max-w-xl mx-auto mb-10 italic"
          >
            Seek wisdom from the ancient feline oracles. Let the cards reveal what the cosmos
            whispers to those who dare to listen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Link href="/reading">
              <button
                className="font-cinzel tracking-widest text-sm px-10 py-4 border border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black transition-all duration-300 pulse-gold uppercase cursor-pointer"
                style={{ letterSpacing: "0.25em" }}
              >
                Begin Your Reading
              </button>
            </Link>
          </motion.div>
        </section>

        {/* Ornate divider */}
        <div className="ornate-divider max-w-2xl mx-auto px-6 mb-12">
          <span className="font-cinzel text-xs text-amber-600/40 tracking-[0.3em]">
            ◆ The Sacred Spreads ◆
          </span>
        </div>

        {/* Spread types */}
        <section className="container max-w-5xl mx-auto px-6 mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(SPREAD_TYPES).map((spread, i) => (
              <motion.div
                key={spread.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              >
                <Link href={`/reading?spread=${spread.id}`}>
                  <div
                    className={`relative p-5 text-center cursor-pointer transition-all duration-300 hover:glow-gold group border bg-gradient-to-br rounded-sm ${SPREAD_COLORS[spread.id] ?? "border-amber-700/40"}`}
                    style={{ background: "rgba(17,17,17,0.8)" }}
                  >
                    {/* Corner ornaments */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-amber-600/30" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-amber-600/30" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-amber-600/30" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-amber-600/30" />

                    <div className="font-cinzel text-amber-400 text-sm tracking-widest mb-2 group-hover:text-amber-300 transition-colors">
                      {spread.name}
                    </div>
                    <div className="text-xl font-display text-amber-500/50 mb-2">
                      {SPREAD_ICONS[spread.id] ?? "✦"}
                    </div>
                    <div className="font-garamond text-sm text-amber-100/55 italic">
                      {spread.description}
                    </div>
                    <div className="mt-3 font-cinzel text-xs text-amber-600/40 tracking-widest">
                      {spread.cardCount} {spread.cardCount === 1 ? "card" : "cards"}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Ornate divider */}
        <div className="ornate-divider max-w-2xl mx-auto px-6 mb-12">
          <span className="font-cinzel text-xs text-amber-600/40 tracking-[0.3em]">
            ◆ Choose Your Oracle ◆
          </span>
        </div>

        {/* Reader characters */}
        <section className="container max-w-5xl mx-auto px-6 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {READER_CHARACTERS.map((reader, i) => (
              <motion.div
                key={reader.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
              >
                <Link href={`/reading?reader=${reader.id}`}>
                  <div
                    className="deco-border p-6 cursor-pointer transition-all duration-300 hover:glow-gold group text-center"
                    style={{
                      background: "rgba(17,17,17,0.85)",
                    }}
                  >
                    <div className="text-5xl mb-4 float-anim" style={{ animationDelay: `${i * 0.8}s` }}>
                      {reader.emoji}
                    </div>
                    <h3 className="font-cinzel text-amber-400 text-base tracking-wide mb-1 group-hover:text-amber-300 transition-colors">
                      {reader.name}
                    </h3>
                    <div
                      className="font-cinzel text-xs tracking-widest mb-3"
                      style={{ color: reader.accentColor }}
                    >
                      {reader.title}
                    </div>
                    <p className="font-garamond text-sm text-amber-100/60 italic leading-relaxed">
                      {reader.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feature strip */}
        <div className="border-t border-amber-900/20 py-8 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
            {[
              { icon: "🃏", label: "78 Cat Cards", desc: "Full Rider-Waite deck" },
              { icon: "🔮", label: "AI Oracle", desc: "LLM-powered readings" },
              { icon: "📜", label: "Reading History", desc: "Save your journey" },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-2">
                <span className="text-2xl">{f.icon}</span>
                <span className="font-cinzel text-amber-400 text-xs tracking-wider">{f.label}</span>
                <span className="font-garamond text-amber-700/60 text-xs">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-amber-900/20 py-8 text-center">
          <p className="font-cinzel text-xs text-amber-600/30 tracking-widest">
            ✦ MYSTIC PAWS TAROT ✦ ALL 78 CARDS ✦ FELINE WISDOM ETERNAL ✦
          </p>
        </footer>
      </div>
    </div>
  );
}
