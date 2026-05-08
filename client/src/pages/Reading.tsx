import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { TAROT_CARDS, READER_CHARACTERS, SPREAD_TYPES, type TarotCard, type ReaderCharacter } from "@shared/tarotData";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import MysticLoader from "@/components/MysticLoader";

type DrawnCard = {
  cardId: string;
  position: string;
  isReversed: boolean;
  card: TarotCard;
};

type Step = "select-spread" | "select-reader" | "ask-question" | "reveal" | "reading";

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

// ── Card Back ─────────────────────────────────────────────────
// ── Card Swipe Carousel (scroll-snap, touch-native) ──────────────────────
function CardSwipeCarousel({
  drawnCards,
  flippedCards,
  currentCardIndex,
  onIndexChange,
  onFlip,
}: {
  drawnCards: DrawnCard[];
  flippedCards: Set<number>;
  currentCardIndex: number;
  onIndexChange: (i: number) => void;
  onFlip: (i: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const PEEK = 9; // vw peeked on each side

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const itemW = el.clientWidth * ((100 - PEEK * 2) / 100);
    el.scrollTo({ left: currentCardIndex * itemW, behavior: "smooth" });
  }, [currentCardIndex]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const itemW = el.clientWidth * ((100 - PEEK * 2) / 100);
    const idx = Math.round(el.scrollLeft / itemW);
    if (idx !== currentCardIndex) onIndexChange(idx);
  }, [currentCardIndex, onIndexChange]);

  return (
    <div className="relative w-full mb-6">
      <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0d0d1a 30%, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0d0d1a 30%, transparent)" }} />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
          paddingLeft: `${PEEK}vw`,
          paddingRight: `${PEEK}vw`,
        }}
      >
        {drawnCards.map((dc, i) => (
          <div
            key={i}
            className="flex-shrink-0 snap-center py-2 flex justify-center items-center"
            style={{ width: `${100 - PEEK * 2}vw`, minWidth: `${100 - PEEK * 2}vw` }}
          >
            <SingleCardFlip
              drawnCard={dc}
              isFlipped={flippedCards.has(i)}
              onFlip={() => onFlip(i)}
            />
          </div>
        ))}
      </div>
      {drawnCards.length > 1 && (
        <div className="flex flex-col items-center gap-2 mt-3">
          <div className="flex gap-2">
            {drawnCards.map((_, i) => (
              <button
                key={i}
                onClick={() => onIndexChange(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentCardIndex ? "20px" : "6px",
                  height: "6px",
                  background: i === currentCardIndex ? "#c9a84c" : "rgba(201,168,76,0.25)",
                }}
              />
            ))}
          </div>
          <span className="font-cinzel text-gold/30 text-xs tracking-widest">← swipe →</span>
        </div>
      )}
    </div>
  );
}

// ── Oracle Carousel (native touch swipe, centers middle on load) ──────────
function OracleCarousel({
  characters,
  selectedId,
  onSelect,
}: {
  characters: ReaderCharacter[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const CARD_WIDTH = 170;
  const GAP = 16;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const middleIndex = Math.floor(characters.length / 2);
    const offset = middleIndex * (CARD_WIDTH + GAP) - (el.clientWidth / 2 - CARD_WIDTH / 2);
    el.scrollLeft = Math.max(0, offset);
  }, [characters.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !selectedId || el.scrollWidth <= el.clientWidth) return;
    const idx = characters.findIndex(c => c.id === selectedId);
    if (idx === -1) return;
    const offset = idx * (CARD_WIDTH + GAP) - (el.clientWidth / 2 - CARD_WIDTH / 2);
    el.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
  }, [selectedId, characters]);

  const OracleCard = ({ r }: { r: ReaderCharacter }) => (
    <button
      key={r.id}
      onClick={() => { onSelect(r.id); if (navigator.vibrate) navigator.vibrate(20); }}
      className="deco-border overflow-hidden text-center transition-all duration-300 hover:glow-gold"
      style={{
        background: "rgba(17,17,17,0.85)",
        borderColor: selectedId === r.id ? "#c9a84c" : "rgba(201,168,76,0.35)",
        transform: selectedId === r.id ? "scale(1.05)" : "scale(1)",
        transition: "transform 0.3s ease, border-color 0.3s ease",
        opacity: selectedId === r.id ? 1 : 0.75,
      }}
    >
      <div className="overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="font-cinzel text-gold text-xs tracking-wide mb-1">{r.name}</div>
        <div className="font-cinzel text-xs" style={{ color: r.accentColor, fontSize: "0.6rem" }}>{r.title}</div>
      </div>
    </button>
  );

  return (
    <div className="relative w-full">
      {/* Desktop: all 3 side by side, centered */}
      <div className="hidden md:flex justify-center items-stretch gap-5">
        {characters.map(r => (
          <div key={r.id} style={{ width: "200px" }}>
            <OracleCard r={r} />
          </div>
        ))}
      </div>

      {/* Mobile: peek carousel */}
      <div className="md:hidden relative overflow-hidden pt-2">
        <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0d0d1a 40%, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0d0d1a 40%, transparent)" }} />
        <div
          ref={scrollRef}
          className="flex overflow-x-auto pb-3 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"], gap: `${GAP}px` }}
        >
          <div className="flex-shrink-0" style={{ width: "calc(50vw - 85px)" }} />
          {characters.map(r => (
            <div key={r.id} className="flex-shrink-0 snap-center" style={{ width: `${CARD_WIDTH}px` }}>
              <OracleCard r={r} />
            </div>
          ))}
          <div className="flex-shrink-0" style={{ width: "calc(50vw - 85px)" }} />
        </div>
        <p className="text-center font-cinzel text-gold/30 text-xs tracking-widest mt-1">← swipe to explore →</p>
      </div>
    </div>
  );
}
function CardBack({ large }: { large?: boolean }) {
  const size = large ? "w-48 md:w-64 h-72 md:h-96" : "w-20 h-32";
  return (
    <div
      className={`${size} rounded-lg flex items-center justify-center`}
      style={{
        background: "linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d0d1a 100%)",
        border: "2px solid rgba(201,168,76,0.6)",
        boxShadow: "0 0 20px rgba(201,168,76,0.2), inset 0 0 20px rgba(74,29,122,0.3)",
      }}
    >
      <div className="text-center">
        <div className="font-display text-gold text-3xl mb-1">✦</div>
        <div className="font-cinzel text-gold/40 text-xs tracking-widest">MYSTIC</div>
        <div className="font-cinzel text-gold/40 text-xs tracking-widest">PAWS</div>
      </div>
    </div>
  );
}

// ── Single Card Flip (large, one at a time) ────────────────────
function SingleCardFlip({
  drawnCard,
  isFlipped,
  onFlip,
}: {
  drawnCard: DrawnCard;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="font-cinzel text-xs text-gold/60 tracking-widest uppercase mb-1">
        {drawnCard.position}
      </div>
      <div
        className="cursor-pointer"
        onClick={onFlip}
        style={{ perspective: "1000px", width: "min(256px, 70vw)", height: "min(384px, 105vw)" }}
      >
        <div
          style={{
            transition: "transform 0.8s cubic-bezier(0.4,0,0.2,1)",
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Back face */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              position: "absolute",
              inset: 0,
            }}
          >
            <div
              className="w-full h-full rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d0d1a 100%)",
                border: "2px solid rgba(201,168,76,0.6)",
                boxShadow: "0 0 30px rgba(201,168,76,0.25), inset 0 0 20px rgba(74,29,122,0.4)",
              }}
            >
              <div className="text-center">
                <div className="font-display text-gold text-4xl mb-2">✦</div>
                <div className="font-cinzel text-gold/40 text-sm tracking-widest">MYSTIC</div>
                <div className="font-cinzel text-gold/40 text-sm tracking-widest">PAWS</div>
                <div className="font-cinzel text-gold/20 text-xs tracking-widest mt-3">TAP TO REVEAL</div>
              </div>
            </div>
          </div>
          {/* Front face */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              position: "absolute",
              inset: 0,
            }}
          >
            <div
              className="w-full h-full rounded-lg overflow-hidden"
              style={{
                border: "2px solid rgba(201,168,76,0.7)",
                boxShadow: "0 0 30px rgba(201,168,76,0.3)",
              }}
            >
              <img
                src={drawnCard.card.image}
                alt={drawnCard.card.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      {isFlipped && (
        <div className="text-center mt-1">
          <div className="font-cinzel text-gold text-sm tracking-wide">{drawnCard.card.name}</div>
        </div>
      )}
    </div>
  );
}

// ── Small card for summary ─────────────────────────────────────
function SmallCard({ drawnCard }: { drawnCard: DrawnCard }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="font-cinzel text-xs text-gold/50 tracking-widest uppercase text-center" style={{ fontSize: "0.6rem" }}>
        {drawnCard.position}
      </div>
      <div
        className="w-24 h-36 rounded overflow-hidden"
        style={{ border: "1px solid rgba(201,168,76,0.5)", boxShadow: "0 0 8px rgba(201,168,76,0.15)" }}
      >
        <img src={drawnCard.card.image} alt={drawnCard.card.name} className="w-full h-full object-cover" />
      </div>
      <div className="font-cinzel text-gold text-center" style={{ fontSize: "0.6rem", letterSpacing: "0.05em", maxWidth: "6rem" }}>
        {drawnCard.card.name}
      </div>
    </div>
  );
}

// ── Main Reading Page ──────────────────────────────────────────
export default function Reading() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);

  const [step, setStep] = useState<Step>("select-spread");
  const [selectedSpread, setSelectedSpread] = useState<string>(params.get("spread") || "yes-no");
  const [selectedReader, setSelectedReader] = useState<string>(params.get("reader") || "mystic-tabby");
  const [question, setQuestion] = useState("");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [interpretation, setInterpretation] = useState("");
  const [sessionId] = useState(getSessionId);
  // Scroll to top on every step change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const spread = SPREAD_TYPES[selectedSpread as keyof typeof SPREAD_TYPES];
  const reader = READER_CHARACTERS.find(r => r.id === selectedReader)!;

  const generateMutation = trpc.tarot.generateReading.useMutation({
    onSuccess: (data) => {
      setInterpretation(data.interpretation);
      setStep("reading");
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  useEffect(() => {
    if (params.get("spread") && params.get("reader")) {
      setStep("ask-question");
    } else if (params.get("spread")) {
      setStep("select-reader");
    }
  }, []);

  const handleDrawCards = useCallback(() => {
    if (!spread) return;
    const cards = shuffleAndDraw(spread.cardCount);
    const drawn: DrawnCard[] = cards.map((card, i) => ({
      cardId: card.id,
      position: spread.positions[i] || `Card ${i + 1}`,
      isReversed: false,
      card,
    }));
    setDrawnCards(drawn);
    setFlippedCards(new Set());
    setCurrentCardIndex(0);
    setStep("reveal");
  }, [spread]);

  const handleFlipCurrent = () => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      next.add(currentCardIndex);
      return next;
    });
    if (navigator.vibrate) navigator.vibrate(40);
  };

  const handleNextCard = () => {
    if (currentCardIndex < drawnCards.length - 1) {
      setCurrentCardIndex(i => i + 1);
    }
  };

  const handleGetReading = () => {
    generateMutation.mutate({
      spreadType: selectedSpread as "three-card" | "celtic-cross" | "yes-no",
      readerCharacterId: selectedReader,
      question: question || undefined,
      drawnCards: drawnCards.map(dc => ({
        cardId: dc.cardId,
        position: dc.position,
        isReversed: false,
      })),
      sessionId,
    });
  };

  // Show full-screen loading overlay while LLM generates
  if (generateMutation.isPending) {
    return <MysticLoader readerName={reader?.name} />;
  }

  const handleReset = () => {
    setStep("select-spread");
    setDrawnCards([]);
    setFlippedCards(new Set());
    setCurrentCardIndex(0);
    setInterpretation("");
    setQuestion("");
  };

  // ── Select Spread ────────────────────────────────────────────
  if (step === "select-spread") {
    return (
      <PageWrapper key={step}>
        <BackLink />
        <SectionTitle>Choose Your Spread</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto items-stretch">
          {Object.values(SPREAD_TYPES).map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedSpread(s.id); setStep("select-reader"); }}
              className="deco-border h-full flex flex-col justify-between p-6 text-center transition-all duration-300 hover:glow-gold"
              style={{ background: "rgba(17,17,17,0.85)", borderColor: selectedSpread === s.id ? "#c9a84c" : "rgba(201,168,76,0.35)" }}
            >
              <div>
                <div className="font-cinzel text-gold text-sm tracking-widest mb-2">{s.name}</div>
                <div className="font-cinzel text-gold/30 text-lg mb-3">{"✦".repeat(Math.min(s.cardCount, 5))}</div>
                <div className="font-sans text-xs text-parchment/60 leading-relaxed">{s.description}</div>
              </div>
              <div className="mt-4 font-cinzel text-xs text-gold/40">{s.cardCount} {s.cardCount === 1 ? "card" : "cards"}</div>
            </button>
          ))}
        </div>
      </PageWrapper>
    );
  }

  // ── Select Reader ────────────────────────────────────────────
  if (step === "select-reader") {
    return (
      <PageWrapper key={step}>
        <BackLink onClick={() => setStep("select-spread")} />
        <SectionTitle>Choose Your Oracle</SectionTitle>
        {/* Extra top padding on mobile so the oracle cards aren't clipped */}
        <div className="pt-2 md:pt-0">
          <OracleCarousel
            characters={READER_CHARACTERS}
            selectedId={selectedReader}
            onSelect={(id) => { setSelectedReader(id); setStep("ask-question"); }}
          />
        </div>
        <p className="font-cinzel text-gold/30 text-xs text-center tracking-widest mt-4">SWIPE OR TAP TO CHOOSE</p>
      </PageWrapper>
    );
  }

  // ── Ask Question ─────────────────────────────────────────────
  if (step === "ask-question") {
    return (
      <PageWrapper key={step}>
        <BackLink onClick={() => setStep("select-reader")} />
        <SectionTitle>Your Question</SectionTitle>
        <div className="max-w-xl mx-auto text-center">
          {reader && (
            <div className="mb-6">
              <div
                className="w-24 h-32 mx-auto rounded overflow-hidden mb-3"
                style={{ border: "1px solid rgba(201,168,76,0.5)" }}
              >
                <img src={reader.image} alt={reader.name} className="w-full h-full object-cover" />
              </div>
              <div className="font-cinzel text-gold text-sm tracking-wide">{reader.name}</div>
            </div>
          )}
          <p className="font-sans text-parchment/70 text-sm mb-6">
            Ask a question or leave blank for a general reading.
          </p>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="What's on your mind? (optional)"
            className="w-full p-4 font-sans text-sm resize-none rounded-none outline-none"
            rows={3}
            style={{
              background: "rgba(17,17,17,0.9)",
              border: "1px solid rgba(201,168,76,0.4)",
              color: "#e8d5a3",
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

  // ── Reveal Cards (one at a time) ─────────────────────────────
  if (step === "reveal") {
    const currentCard = drawnCards[currentCardIndex];
    const currentFlipped = flippedCards.has(currentCardIndex);
    const allFlipped = flippedCards.size === drawnCards.length;
    const isLastCard = currentCardIndex === drawnCards.length - 1;
    // Reveal all cards at once
    const handleRevealAll = () => {
      const all = new Set(drawnCards.map((_, i) => i));
      setFlippedCards(all);
      setCurrentCardIndex(drawnCards.length - 1);
    };
    return (
      <PageWrapper key={step}>
        <BackLink onClick={() => setStep("ask-question")} />
        {/* Progress dots */}
        {drawnCards.length > 1 && (
          <div className="flex justify-center gap-2 mb-4">
            {drawnCards.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer"
                style={{ background: flippedCards.has(i) ? "#c9a84c" : i === currentCardIndex ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.15)" }}
                onClick={() => setCurrentCardIndex(i)}
              />
            ))}
          </div>
        )}
        {question && (
          <p className="font-sans text-center text-parchment/50 text-sm mb-5 max-w-xl mx-auto">
            "{question}"
          </p>
        )}
        {/* Card swipe carousel: scroll-snap, touch-native */}
        <CardSwipeCarousel
          drawnCards={drawnCards}
          flippedCards={flippedCards}
          currentCardIndex={currentCardIndex}
          onIndexChange={setCurrentCardIndex}
          onFlip={(i) => { setFlippedCards(prev => { const n = new Set(prev); n.add(i); return n; }); if (navigator.vibrate) navigator.vibrate(40); }}
        />
        {/* Actions */}
        <div className="flex flex-col items-center gap-3">
          {!currentFlipped && (
            <button
              onClick={handleFlipCurrent}
              className="font-cinzel tracking-widest text-sm px-8 py-3 border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 uppercase pulse-gold"
              style={{ letterSpacing: "0.2em" }}
            >
              Reveal Card
            </button>
          )}
          {currentFlipped && !allFlipped && (
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {!isLastCard && (
                <button
                  onClick={handleNextCard}
                  className="font-cinzel tracking-widest text-sm px-8 py-3 border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 uppercase"
                  style={{ letterSpacing: "0.2em" }}
                >
                  Next Card &#8594;
                </button>
              )}
              <button
                onClick={handleRevealAll}
                className="font-cinzel tracking-widest text-xs px-6 py-2 border border-gold/40 text-gold/50 hover:border-gold hover:text-gold transition-all duration-300 uppercase"
                style={{ letterSpacing: "0.15em" }}
              >
                Reveal All
              </button>
            </div>
          )}
          {allFlipped && (
            <button
              onClick={handleGetReading}
              disabled={generateMutation.isPending}
              className="font-cinzel tracking-widest text-sm px-10 py-4 border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 uppercase pulse-gold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ letterSpacing: "0.25em" }}
            >
              {generateMutation.isPending ? "Reading the cards..." : `Get ${reader?.name}'s Reading`}
            </button>
          )}
        </div>
        {/* Revealed cards strip */}
        {flippedCards.size > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mt-8 opacity-60">
            {drawnCards.filter((_, i) => flippedCards.has(i)).map((dc) => (
              <SmallCard key={dc.cardId} drawnCard={dc} />
            ))}
          </div>
        )}
      </PageWrapper>
    );
  }

  // ── Reading Result ────────────────────────────────────────────
  if (step === "reading") {
    return (
      <PageWrapper key={step}>
        <div className="max-w-3xl mx-auto">
          {/* Reader name + question only — no portrait */}
          <div className="text-center mb-6">
            <h2 className="font-cinzel text-gold text-lg tracking-widest mb-1">{reader?.name}</h2>
            <div className="font-cinzel text-xs tracking-widest" style={{ color: reader?.accentColor }}>{reader?.title}</div>
            {question && <p className="font-sans text-parchment/50 mt-3 text-sm">"{question}"</p>}
          </div>

          {/* Cards drawn */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {drawnCards.map((dc) => (
              <SmallCard key={dc.cardId} drawnCard={dc} />
            ))}
          </div>

          <div className="ornate-divider mb-6">
            <span className="font-cinzel text-xs text-gold/40 tracking-[0.3em]">✦ Reading ✦</span>
          </div>

          {/* Interpretation */}
          <div
            className="p-6 mb-8"
            style={{
              background: "rgba(17,17,17,0.85)",
              border: "1px solid rgba(201,168,76,0.3)",
            }}
          >
            <div className="font-sans text-parchment/90 text-sm leading-relaxed [&_strong]:text-gold [&_strong]:font-semibold [&_p]:mb-3">
              <Streamdown>{interpretation}</Streamdown>
            </div>
          </div>

          {/* Card meanings */}
          <div className="ornate-divider mb-5">
            <span className="font-cinzel text-xs text-gold/40 tracking-[0.3em]">✦ Card Meanings ✦</span>
          </div>
          <div className="space-y-3 mb-10">
            {drawnCards.map(dc => (
              <div
                key={dc.cardId}
                className="p-4 flex gap-4 items-start"
                style={{ background: "rgba(17,17,17,0.7)", border: "1px solid rgba(201,168,76,0.2)" }}
              >
                <img src={dc.card.image} alt={dc.card.name} className="w-10 h-14 object-cover rounded flex-shrink-0" style={{ border: "1px solid rgba(201,168,76,0.4)" }} />
                <div>
                  <div className="font-cinzel text-gold text-sm tracking-wide">{dc.card.name}</div>
                  <div className="font-cinzel text-xs text-gold/40 tracking-widest mb-1">{dc.position}</div>
                  <p className="font-sans text-xs text-parchment/70 leading-relaxed">
                    {dc.card.uprightMeaning}
                  </p>
                </div>
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
            <button
              onClick={() => {
                const text = `✦ My Mystic Paws Tarot Reading ✦\n\nOracle: ${reader?.name}\nSpread: ${spread?.name}\nCards: ${drawnCards.map(dc => dc.card.name).join(", ")}\n\n${interpretation}\n\n— mystic-paws-tarot`;
                navigator.clipboard.writeText(text).then(() => toast.success("Reading copied to clipboard!")).catch(() => toast.error("Could not copy"));
                if (navigator.vibrate) navigator.vibrate(30);
              }}
              className="font-cinzel tracking-widest text-sm px-8 py-3 border border-gold/40 text-gold/60 hover:border-gold hover:text-gold transition-all duration-300 uppercase"
              style={{ letterSpacing: "0.2em" }}
            >
              Share Reading
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
  const positions = [
    { gridArea: "center" }, { gridArea: "cross" }, { gridArea: "below" },
    { gridArea: "above" }, { gridArea: "left" }, { gridArea: "right" },
    { gridArea: "s1" }, { gridArea: "s2" }, { gridArea: "s3" }, { gridArea: "s4" },
  ];
  return (
    <div className="overflow-x-auto pb-4">
      <div
        style={{
          display: "grid",
          gridTemplateAreas: `". above . s4" "left center right s3" ". cross . s2" ". below . s1"`,
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "0.75rem",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        {drawnCards.map((dc, i) => (
          <div key={dc.cardId} style={{ gridArea: positions[i]?.gridArea }}>
            <SmallCard drawnCard={dc} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared Layout ──────────────────────────────────────────────
function PageWrapper({ children }: { children: React.ReactNode }) {
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
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(74,29,122,0.2) 0%, transparent 70%)", zIndex: 0 }}
      />
      <div className="relative container max-w-5xl mx-auto px-6 py-10" style={{ zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
}

function BackLink({ onClick }: { onClick?: () => void }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      {onClick ? (
        <button onClick={onClick} className="font-cinzel text-xs text-gold/50 hover:text-gold tracking-widest transition-colors">
          ← Back
        </button>
      ) : (
        <Link href="/">
          <span className="font-cinzel text-xs text-gold/50 hover:text-gold tracking-widest transition-colors cursor-pointer">
            ← Home
          </span>
        </Link>
      )}
      <span className="font-cinzel text-gold/40 text-sm">✦ Mystic Paws ✦</span>
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
