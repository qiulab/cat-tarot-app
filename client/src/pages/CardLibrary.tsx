import { useState } from "react";
import { Link } from "wouter";
import { TAROT_CARDS, type TarotCard } from "@shared/tarotData";

type FilterType = "all" | "major" | "wands" | "cups" | "swords" | "pentacles";

export default function CardLibrary() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [search, setSearch] = useState("");

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All 78 Cards" },
    { id: "major", label: "Major Arcana" },
    { id: "wands", label: "Wands" },
    { id: "cups", label: "Cups" },
    { id: "swords", label: "Swords" },
    { id: "pentacles", label: "Pentacles" },
  ];

  const filtered = TAROT_CARDS.filter(card => {
    const matchesFilter =
      filter === "all" ||
      (filter === "major" && card.arcana === "major") ||
      card.suit === filter;
    const matchesSearch =
      !search ||
      card.name.toLowerCase().includes(search.toLowerCase()) ||
      card.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="relative min-h-screen" style={{ zIndex: 1 }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(74,29,122,0.2) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />
      <div className="relative container max-w-7xl mx-auto px-6 py-10" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <span className="font-cinzel text-xs text-gold/50 hover:text-gold tracking-widest transition-colors cursor-pointer">
              ← Home
            </span>
          </Link>
          <span className="font-display text-gold/40 text-sm">✦ Mystic Paws ✦</span>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-cinzel text-3xl text-gold tracking-widest mb-4">The Card Library</h1>
          <div className="ornate-divider max-w-xs mx-auto mb-4">
            <span className="font-cinzel text-xs text-gold/30 tracking-[0.3em]">✦ ✦ ✦</span>
          </div>
          <p className="font-garamond text-parchment/60 italic">
            All 78 cards of the Rider-Waite-Smith tradition, reimagined through feline eyes
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`font-cinzel text-xs tracking-widest px-4 py-2 border transition-all duration-200 ${
                filter === f.id
                  ? "border-gold text-gold bg-gold/10"
                  : "border-gold/30 text-gold/50 hover:border-gold/60 hover:text-gold/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="max-w-sm mx-auto mb-8">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cards or keywords..."
            className="w-full px-4 py-2 font-garamond text-parchment/80 outline-none"
            style={{
              background: "rgba(17,17,17,0.9)",
              border: "1px solid rgba(201,168,76,0.4)",
              color: "#e8d5a3",
              fontSize: "1rem",
            }}
          />
        </div>

        <div className="font-cinzel text-xs text-gold/40 text-center mb-6 tracking-widest">
          {filtered.length} cards
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {filtered.map(card => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="group flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105"
            >
              <div
                className="w-full rounded overflow-hidden transition-all duration-200 group-hover:glow-gold"
                style={{
                  aspectRatio: "2/3",
                  border: "1px solid rgba(201,168,76,0.4)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="font-cinzel text-gold/60 group-hover:text-gold transition-colors text-center leading-tight"
                style={{ fontSize: "0.55rem", letterSpacing: "0.05em" }}>
                {card.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 50, background: "rgba(0,0,0,0.85)" }}
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ background: "#0d0d0d", border: "1px solid rgba(201,168,76,0.6)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row gap-6 p-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <img
                  src={selectedCard.image}
                  alt={selectedCard.name}
                  className="w-36 rounded"
                  style={{ border: "2px solid rgba(201,168,76,0.6)", boxShadow: "0 0 20px rgba(201,168,76,0.2)" }}
                />
              </div>
              <div className="flex-1">
                <h2 className="font-cinzel text-gold text-xl tracking-widest mb-1">{selectedCard.name}</h2>
                <div className="font-cinzel text-xs text-gold/50 tracking-widest mb-3">
                  {selectedCard.arcana === "major" ? "Major Arcana" : `${selectedCard.suit?.charAt(0).toUpperCase()}${selectedCard.suit?.slice(1)} · Minor Arcana`}
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {selectedCard.keywords.map(k => (
                    <span key={k} className="font-cinzel text-xs px-2 py-0.5" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c" }}>
                      {k}
                    </span>
                  ))}
                </div>
                <p className="font-garamond text-parchment/70 italic text-sm mb-4">{selectedCard.description}</p>
                <div className="space-y-3">
                  <div>
                    <div className="font-cinzel text-xs text-gold/60 tracking-widest mb-1">✦ UPRIGHT</div>
                    <p className="font-garamond text-sm text-parchment/80">{selectedCard.uprightMeaning}</p>
                  </div>
                  <div>
                    <div className="font-cinzel text-xs text-gold/40 tracking-widest mb-1">↓ REVERSED</div>
                    <p className="font-garamond text-sm text-parchment/60">{selectedCard.reversedMeaning}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gold/20 px-6 py-3 flex justify-between items-center">
              <Link href="/reading">
                <span className="font-cinzel text-xs text-gold/60 hover:text-gold tracking-widest cursor-pointer transition-colors">
                  Start a Reading →
                </span>
              </Link>
              <button
                onClick={() => setSelectedCard(null)}
                className="font-cinzel text-xs text-gold/40 hover:text-gold tracking-widest transition-colors"
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
