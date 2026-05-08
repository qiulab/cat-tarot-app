import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { TAROT_CARDS, READER_CHARACTERS, SPREAD_TYPES } from "@shared/tarotData";
import { Streamdown } from "streamdown";

function getSessionId(): string {
  let id = sessionStorage.getItem("tarot_session_id");
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("tarot_session_id", id);
  }
  return id;
}

type DrawnCardData = {
  cardId: string;
  position: string;
  isReversed: boolean;
};

export default function History() {
  const sessionId = getSessionId();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: readings, isLoading } = trpc.tarot.getHistory.useQuery({ sessionId });

  const getReader = (id: string) => READER_CHARACTERS.find(r => r.id === id);
  const getCard = (id: string) => TAROT_CARDS.find(c => c.id === id);
  const getSpread = (id: string) => SPREAD_TYPES[id as keyof typeof SPREAD_TYPES];

  return (
    <motion.div
      className="relative min-h-screen"
      style={{ zIndex: 1 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(74,29,122,0.2) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />
      <div className="relative container max-w-4xl mx-auto px-6 py-10" style={{ zIndex: 1 }}>
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
          <h1 className="font-cinzel text-3xl text-gold tracking-widest mb-4">Past Readings</h1>
          <div className="ornate-divider max-w-xs mx-auto mb-4">
            <span className="font-cinzel text-xs text-gold/30 tracking-[0.3em]">✦ ✦ ✦</span>
          </div>
          <p className="font-sans text-parchment/60">
            The echoes of your consultations with the feline oracles
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-20">
            <div className="font-cinzel text-gold/40 text-sm tracking-widest animate-pulse">
              Consulting the archives...
            </div>
          </div>
        )}

        {!isLoading && (!readings || readings.length === 0) && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-30">🐱</div>
            <div className="font-cinzel text-gold/40 text-sm tracking-widest mb-4">
              No readings yet in this session
            </div>
            <Link href="/reading">
              <button className="font-cinzel text-xs tracking-widest px-6 py-3 border border-gold/40 text-gold/60 hover:border-gold hover:text-gold transition-all">
                Begin Your First Reading
              </button>
            </Link>
          </div>
        )}

        {readings && readings.length > 0 && (
          <div className="space-y-4 stagger-children">
            {readings.map(reading => {
              const reader = getReader(reading.readerCharacterId);
              const spread = getSpread(reading.spreadType);
              const cards = (reading.cards as DrawnCardData[]) || [];
              const isExpanded = expandedId === reading.id;

              return (
                <div
                  key={reading.id}
                  className="transition-all duration-300"
                  style={{ background: "rgba(17,17,17,0.85)", border: "1px solid rgba(201,168,76,0.3)" }}
                >
                  {/* Reading header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : reading.id)}
                    className="w-full p-5 text-left flex items-center gap-4"
                  >
                    <div className="text-3xl flex-shrink-0">{reader?.emoji || "🐱"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-cinzel text-gold text-sm tracking-wide">
                          {reader?.name || reading.readerCharacterId}
                        </span>
                        <span className="font-cinzel text-xs text-gold/40 tracking-widest">
                          {spread?.name || reading.spreadType}
                        </span>
                      </div>
                      {reading.question && (
                        <p className="font-sans text-parchment/60 text-sm mt-1 truncate">
                          "{reading.question}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {cards.slice(0, 5).map((dc, i) => {
                          const card = getCard(dc.cardId);
                          return card ? (
                            <img
                              key={i}
                              src={card.image}
                              alt={card.name}
                              className="w-6 h-9 object-cover rounded-sm"
                              style={{
                                border: "1px solid rgba(201,168,76,0.4)",
                                transform: dc.isReversed ? "rotate(180deg)" : "none",
                              }}
                            />
                          ) : null;
                        })}
                        {cards.length > 5 && (
                          <span className="font-cinzel text-xs text-gold/30">+{cards.length - 5}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="font-cinzel text-xs text-gold/30 tracking-widest">
                        {new Date(reading.createdAt).toLocaleDateString()}
                      </div>
                      <div className="font-cinzel text-xs text-gold/20 mt-1">
                        {new Date(reading.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="text-gold/40 mt-2 text-xs">{isExpanded ? "▲" : "▼"}</div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-gold/20 p-5">
                      {/* Cards */}
                      <div className="flex flex-wrap gap-3 mb-5">
                        {cards.map((dc, i) => {
                          const card = getCard(dc.cardId);
                          return card ? (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <img
                                src={card.image}
                                alt={card.name}
                                className="w-14 h-20 object-cover rounded"
                                style={{
                                  border: "1px solid rgba(201,168,76,0.5)",
                                  transform: dc.isReversed ? "rotate(180deg)" : "none",
                                }}
                              />
                              <div className="font-cinzel text-center" style={{ fontSize: "0.55rem", color: "rgba(201,168,76,0.6)" }}>
                                {dc.position}
                              </div>
                              <div className="font-cinzel text-center" style={{ fontSize: "0.5rem", color: "rgba(201,168,76,0.4)" }}>
                                {card.name}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>

                      {/* Interpretation */}
                      {reading.interpretation && (
                        <>
                          <div className="ornate-divider mb-4">
                            <span className="font-cinzel text-xs text-gold/30 tracking-[0.3em]">✦ Reading ✦</span>
                          </div>
                          <div className="tarot-prose">
                            <Streamdown>{reading.interpretation}</Streamdown>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/reading">
            <button className="font-cinzel tracking-widest text-sm px-8 py-3 border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 uppercase" style={{ letterSpacing: "0.2em" }}>
              New Reading
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
