import { useState, useEffect, useCallback } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { TAROT_CARDS, READER_CHARACTERS, SPREAD_TYPES, type TarotCard, type ReaderCharacter } from "@shared/tarotData";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

type DrawnCard = {
  cardId: string;
  position: string;
  isReversed: boolean;
  card: TarotCard;
};

type Step = "select-spread" | "select-reader" | "ask-question" | "drawing" | "reveal" | "reading";

function getSessionId(): string {
  let id = sessionStorage.getItem("tarot_session_id");
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("tarot_session_id", id);
  }
  return id;
}

function shuffleAndDraw(count: number): TarotCard[] {
  const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── Card Back Component ────────────────────────────────────────
function CardBack({ size = "normal" }: { size?: "normal" | "small" }) {
  const w = size === "small" ? "w-20" : "w-32 md:w-40";
  const h = size === "small" ? "h-32" : "h-48 md:h-60";
  return (
    <div
      className={`${w} ${h} rounded-lg flex items-center justify-center`}
      style={{
        background: "linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d0d1a 100%)",
        border: "2px solid rgba(201,168,76,0.6)",
        boxShadow: "0 0 15px rgba(201,168,76,0.2), inset 0 0 15px rgba(74,29,122,0.3)",
      }}
    >
      <div className="text-center">
        <div className="font-display text-gold text-2xl mb-1">✦</div>
        <div className="font-display text-gold/40 text-xs tracking-widest">MYSTIC</div>
        <div className="font-display text-gold/40 text-xs tracking-widest">PAWS</div>
      </div>
    </div>
  );
}

// ── Tarot Card Component ───────────────────────────────────────
function TarotCardDisplay({
  drawnCard,
  isFlipped,
  onFlip,
  showPosition = true,
  size = "normal",
}: {
  drawnCard: DrawnCard;
  isFlipped: boolean;
  onFlip?: () => void;
  showPosition?: boolean;
  size?: "normal" | "small";
}) {
  const w = size === "small" ? "w-20" : "w-32 md:w-40";
  const h = size === "small" ? "h-32" : "h-48 md:h-60";

  return (
    <div className="flex flex-col items-center gap-2">
      {showPosition && (
        <div className="font-cinzel text-xs text-gold/60 tracking-widest text-center uppercase">
          {drawnCard.position}
        </div>
      )}
      <div
        className={`card-container ${w} ${h} cursor-pointer`}
        onClick={onFlip}
        style={{ perspective: "1000px" }}
      >
        <div
          className="card-inner w-full h-full"
          style={{
            transition: "transform 0.75s cubic-bezier(0.4,0,0.2,1)",
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            position: "relative",
          }}
        >
          {/* Back */}
          <div
            className="card-face absolute inset-0 rounded-lg overflow-hidden"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d0d1a 100%)",
                border: "2px solid rgba(201,168,76,0.6)",
                boxShadow: "0 0 15px rgba(201,168,76,0.2), inset 0 0 15px rgba(74,29,122,0.3)",
              }}
            >
              <div className="text-center">
                <div className="font-display text-gold text-2xl mb-1">✦</div>
                <div className="font-display text-gold/40 text-xs tracking-widest">MYSTIC</div>
                <div className="font-display text-gold/40 text-xs tracking-widest">PAWS</div>
              </div>
            </div>
          </div>
          {/* Front */}
          <div
            className="card-face absolute inset-0 rounded-lg overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div
              className="w-full h-full relative"
              style={{
                border: "2px solid rgba(201,168,76,0.7)",
                boxShadow: "0 0 20px rgba(201,168,76,0.25)",
              }}
            >
              <img
                src={drawnCard.card.image}
                alt={drawnCard.card.name}
                className="w-full h-full object-cover"
                style={{
                  transform: drawnCard.isReversed ? "rotate(180deg)" : "none",
                }}
              />
              {drawnCard.isReversed && (
                <div
                  className="absolute top-1 right-1 font-cinzel text-xs px-1 py-0.5 rounded"
                  style={{
                    background: "rgba(139,105,20,0.85)",
                    color: "#e8d5a3",
                    fontSize: "0.6rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  REV
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isFlipped && (
        <div className="text-center">
          <div className="font-cinzel text-gold text-xs tracking-wide">{drawnCard.card.name}</div>
          {drawnCard.isReversed && (
            <div className="font-cinzel text-gold-dark text-xs tracking-widest">Reversed</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Reading Page ──────────────────────────────────────────
export default function Reading() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);

  const [step, setStep] = useState<Step>("select-spread");
  const [selectedSpread, setSelectedSpread] = useState<string>(params.get("spread") || "single");
  const [selectedReader, setSelectedReader] = useState<string>(params.get("reader") || "mystic-tabby");
  const [question, setQuestion] = useState("");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [interpretation, setInterpretation] = useState("");
  const [sessionId] = useState(getSessionId);

  const spread = SPREAD_TYPES[selectedSpread as keyof typeof SPREAD_TYPES];
  const reader = READER_CHARACTERS.find(r => r.id === selectedReader)!;

  const generateMutation = trpc.tarot.generateReading.useMutation({
    onSuccess: (data) => {
      setInterpretation(data.interpretation);
      setStep("reading");
    },
    onError: () => {
      toast.error("The oracle is silent... Please try again.");
    },
  });

  // Auto-advance if params set
  useEffect(() => {
    if (params.get("spread") && params.get("reader")) {
      setStep("ask-question");
    } else if (params.get("spread")) {
      setStep("select-reader");
    } else if (params.get("reader")) {
      setStep("select-spread");
    }
  }, []);

  const handleDrawCards = useCallback(() => {
    if (!spread) return;
    const cards = shuffleAndDraw(spread.cardCount);
    const drawn: DrawnCard[] = cards.map((card, i) => ({
      cardId: card.id,
      position: spread.positions[i] || `Card ${i + 1}`,
      isReversed: Math.random() < 0.35,
      card,
    }));
    setDrawnCards(drawn);
    setFlippedCards(new Set());
    setStep("reveal");
  }, [spread]);

  const handleFlipCard = (index: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handleFlipAll = () => {
    setFlippedCards(new Set(drawnCards.map((_, i) => i)));
  };

  const handleGetReading = () => {
    generateMutation.mutate({
      spreadType: selectedSpread as "single" | "three-card" | "celtic-cross" | "yes-no",
      readerCharacterId: selectedReader,
      question: question || undefined,
      drawnCards: drawnCards.map(dc => ({
        cardId: dc.cardId,
        position: dc.position,
        isReversed: dc.isReversed,
      })),
      sessionId,
    });
  };

  const handleReset = () => {
    setStep("select-spread");
    setDrawnCards([]);
    setFlippedCards(new Set());
    setInterpretation("");
    setQuestion("");
  };

  // ── Step: Select Spread ──────────────────────────────────────
  if (step === "select-spread") {
    return (
      <PageWrapper>
        <BackLink />
        <SectionTitle>Choose Your Spread</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto stagger-children">
          {Object.values(SPREAD_TYPES).map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedSpread(s.id); setStep("select-reader"); }}
              className={`deco-border p-5 text-center transition-all duration-300 hover:glow-gold ${selectedSpread === s.id ? "glow-gold" : ""}`}
              style={{ background: "rgba(17,17,17,0.85)", borderColor: selectedSpread === s.id ? "#c9a84c" : "rgba(201,168,76,0.35)" }}
            >
              <div className="font-cinzel text-gold text-sm tracking-widest mb-2">{s.name}</div>
              <div className="font-display text-gold/50 text-xl mb-2">
                {"✦".repeat(Math.min(s.cardCount, 5))}
              </div>
              <div className="font-garamond text-xs text-parchment/60 italic">{s.description}</div>
              <div className="mt-2 font-cinzel text-xs text-gold/40">{s.cardCount} {s.cardCount === 1 ? "card" : "cards"}</div>
            </button>
          ))}
        </div>
      </PageWrapper>
    );
  }

  // ── Step: Select Reader ──────────────────────────────────────
  if (step === "select-reader") {
    return (
      <PageWrapper>
        <BackLink onClick={() => setStep("select-spread")} />
        <SectionTitle>Choose Your Oracle</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto stagger-children">
          {READER_CHARACTERS.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedReader(r.id); setStep("ask-question"); }}
              className={`deco-border p-6 text-center transition-all duration-300 hover:glow-gold ${selectedReader === r.id ? "glow-gold" : ""}`}
              style={{ background: "rgba(17,17,17,0.85)", borderColor: selectedReader === r.id ? "#c9a84c" : "rgba(201,168,76,0.35)" }}
            >
              <div className="text-5xl mb-3 float-anim">{r.emoji}</div>
              <div className="font-cinzel text-gold text-sm tracking-wide mb-1">{r.name}</div>
              <div className="font-cinzel text-xs mb-3" style={{ color: r.accentColor }}>{r.title}</div>
              <p className="font-garamond text-xs text-parchment/60 italic leading-relaxed">{r.description}</p>
            </button>
          ))}
        </div>
      </PageWrapper>
    );
  }

  // ── Step: Ask Question ───────────────────────────────────────
  if (step === "ask-question") {
    return (
      <PageWrapper>
        <BackLink onClick={() => setStep("select-reader")} />
        <SectionTitle>Pose Your Question</SectionTitle>
        <div className="max-w-xl mx-auto text-center">
          <div className="text-5xl mb-4 float-anim">{reader?.emoji}</div>
          <p className="font-garamond text-parchment/70 italic mb-6">
            {reader?.name} awaits. You may ask a specific question, or simply draw the cards and let the cosmos speak.
          </p>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="What question weighs upon your heart? (optional)"
            className="w-full p-4 font-garamond text-parchment/90 italic resize-none rounded-none outline-none"
            rows={3}
            style={{
              background: "rgba(17,17,17,0.9)",
              border: "1px solid rgba(201,168,76,0.4)",
              color: "#e8d5a3",
              fontSize: "1.05rem",
            }}
          />
          <button
            onClick={handleDrawCards}
            className="mt-6 font-cinzel tracking-widest text-sm px-10 py-4 border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 uppercase pulse-gold"
            style={{ letterSpacing: "0.25em" }}
          >
            Draw the Cards
          </button>
        </div>
      </PageWrapper>
    );
  }

  // ── Step: Reveal Cards ───────────────────────────────────────
  if (step === "reveal") {
    const allFlipped = flippedCards.size === drawnCards.length;
    return (
      <PageWrapper>
        <BackLink onClick={() => setStep("ask-question")} />
        <SectionTitle>The Cards Are Drawn</SectionTitle>
        {question && (
          <p className="font-garamond text-center text-parchment/60 italic mb-6 max-w-xl mx-auto">
            "{question}"
          </p>
        )}
        <p className="font-cinzel text-center text-gold/50 text-xs tracking-widest mb-8">
          {allFlipped ? "ALL CARDS REVEALED" : "CLICK EACH CARD TO REVEAL"}
        </p>

        {/* Celtic Cross layout */}
        {selectedSpread === "celtic-cross" ? (
          <CelticCrossLayout
            drawnCards={drawnCards}
            flippedCards={flippedCards}
            onFlip={handleFlipCard}
          />
        ) : (
          <div className={`flex flex-wrap justify-center gap-6 mb-10 ${drawnCards.length > 1 ? "stagger-children" : ""}`}>
            {drawnCards.map((dc, i) => (
              <TarotCardDisplay
                key={dc.cardId}
                drawnCard={dc}
                isFlipped={flippedCards.has(i)}
                onFlip={() => handleFlipCard(i)}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          {!allFlipped && (
            <button
              onClick={handleFlipAll}
              className="font-cinzel text-xs tracking-widest text-gold/60 hover:text-gold border border-gold/30 hover:border-gold px-6 py-2 transition-all"
            >
              Reveal All Cards
            </button>
          )}
          {allFlipped && (
            <button
              onClick={handleGetReading}
              disabled={generateMutation.isPending}
              className="font-cinzel tracking-widest text-sm px-10 py-4 border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 uppercase pulse-gold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ letterSpacing: "0.25em" }}
            >
              {generateMutation.isPending ? "The Oracle Speaks..." : `Receive ${reader?.name}'s Reading`}
            </button>
          )}
        </div>
      </PageWrapper>
    );
  }

  // ── Step: Reading ────────────────────────────────────────────
  if (step === "reading") {
    return (
      <PageWrapper>
        <div className="max-w-3xl mx-auto">
          {/* Reader header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3 float-anim">{reader?.emoji}</div>
            <h2 className="font-cinzel text-gold text-xl tracking-widest mb-1">{reader?.name}</h2>
            <div className="font-cinzel text-xs tracking-widest" style={{ color: reader?.accentColor }}>
              {reader?.title}
            </div>
            {question && (
              <p className="font-garamond text-parchment/60 italic mt-3 text-sm">"{question}"</p>
            )}
          </div>

          <div className="ornate-divider mb-8">
            <span className="font-cinzel text-xs text-gold/40 tracking-[0.3em]">✦ The Reading ✦</span>
          </div>

          {/* Cards summary */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {drawnCards.map((dc, i) => (
              <TarotCardDisplay
                key={dc.cardId}
                drawnCard={dc}
                isFlipped={true}
                showPosition={true}
                size="small"
              />
            ))}
          </div>

          <div className="ornate-divider mb-8">
            <span className="font-cinzel text-xs text-gold/40 tracking-[0.3em]">✦ The Interpretation ✦</span>
          </div>

          {/* Interpretation */}
          <div
            className="p-6 mb-8 tarot-prose"
            style={{
              background: "rgba(17,17,17,0.85)",
              border: "1px solid rgba(201,168,76,0.3)",
            }}
          >
            <Streamdown>{interpretation}</Streamdown>
          </div>

          {/* Card details */}
          <div className="ornate-divider mb-6">
            <span className="font-cinzel text-xs text-gold/40 tracking-[0.3em]">✦ Card Meanings ✦</span>
          </div>
          <div className="space-y-4 mb-10">
            {drawnCards.map(dc => (
              <div
                key={dc.cardId}
                className="p-4"
                style={{ background: "rgba(17,17,17,0.7)", border: "1px solid rgba(201,168,76,0.2)" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img src={dc.card.image} alt={dc.card.name} className="w-10 h-14 object-cover rounded" style={{ border: "1px solid rgba(201,168,76,0.5)" }} />
                  <div>
                    <div className="font-cinzel text-gold text-sm tracking-wide">{dc.card.name}</div>
                    <div className="font-cinzel text-xs text-gold/50 tracking-widest">{dc.position} · {dc.isReversed ? "Reversed" : "Upright"}</div>
                  </div>
                </div>
                <p className="font-garamond text-sm text-parchment/70 italic">
                  {dc.isReversed ? dc.card.reversedMeaning : dc.card.uprightMeaning}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleReset}
              className="font-cinzel tracking-widest text-sm px-8 py-3 border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 uppercase"
              style={{ letterSpacing: "0.2em" }}
            >
              New Reading
            </button>
            <Link href="/history">
              <button
                className="font-cinzel tracking-widest text-sm px-8 py-3 border border-gold/40 text-gold/60 hover:border-gold hover:text-gold transition-all duration-300 uppercase"
                style={{ letterSpacing: "0.2em" }}
              >
                View History
              </button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return null;
}

// ── Celtic Cross Layout ────────────────────────────────────────
function CelticCrossLayout({
  drawnCards,
  flippedCards,
  onFlip,
}: {
  drawnCards: DrawnCard[];
  flippedCards: Set<number>;
  onFlip: (i: number) => void;
}) {
  // Positions: 0=center, 1=crossing, 2=below, 3=above, 4=past(left), 5=future(right), 6-9=staff(bottom to top right)
  const positions = [
    { label: drawnCards[0]?.position, gridArea: "center" },
    { label: drawnCards[1]?.position, gridArea: "cross" },
    { label: drawnCards[2]?.position, gridArea: "below" },
    { label: drawnCards[3]?.position, gridArea: "above" },
    { label: drawnCards[4]?.position, gridArea: "left" },
    { label: drawnCards[5]?.position, gridArea: "right" },
    { label: drawnCards[6]?.position, gridArea: "s1" },
    { label: drawnCards[7]?.position, gridArea: "s2" },
    { label: drawnCards[8]?.position, gridArea: "s3" },
    { label: drawnCards[9]?.position, gridArea: "s4" },
  ];

  return (
    <div className="overflow-x-auto pb-4">
      <div
        style={{
          display: "grid",
          gridTemplateAreas: `
            ". above . s4"
            "left center right s3"
            ". cross . s2"
            ". below . s1"
          `,
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gridTemplateRows: "auto auto auto auto",
          gap: "1rem",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {drawnCards.map((dc, i) => (
          <div key={dc.cardId} style={{ gridArea: positions[i]?.gridArea }}>
            <TarotCardDisplay
              drawnCard={dc}
              isFlipped={flippedCards.has(i)}
              onFlip={() => onFlip(i)}
              size="small"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared Layout Components ───────────────────────────────────
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen" style={{ zIndex: 1 }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(74,29,122,0.2) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />
      <div className="relative container max-w-5xl mx-auto px-6 py-10" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

function BackLink({ onClick }: { onClick?: () => void }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      {onClick ? (
        <button
          onClick={onClick}
          className="font-cinzel text-xs text-gold/50 hover:text-gold tracking-widest transition-colors"
        >
          ← Back
        </button>
      ) : (
        <Link href="/">
          <span className="font-cinzel text-xs text-gold/50 hover:text-gold tracking-widest transition-colors cursor-pointer">
            ← Home
          </span>
        </Link>
      )}
      <span className="font-display text-gold/40 text-sm">✦ Mystic Paws ✦</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center mb-10">
      <h1 className="font-cinzel text-2xl md:text-3xl text-gold tracking-widest mb-4">{children}</h1>
      <div className="ornate-divider max-w-xs mx-auto">
        <span className="font-cinzel text-xs text-gold/30 tracking-[0.3em]">✦ ✦ ✦</span>
      </div>
    </div>
  );
}
