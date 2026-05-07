import { useEffect, useState } from "react";

const MESSAGES = [
  "The oracle is consulting the stars...",
  "Reading the threads of fate...",
  "The cards are speaking...",
  "Channeling ancient wisdom...",
  "The veil between worlds thins...",
  "Interpreting the cosmic signs...",
];

export default function MysticLoader({ readerName }: { readerName?: string }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % MESSAGES.length);
        setFade(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background: "radial-gradient(ellipse at center, #1a0d2e 0%, #0d0d1a 60%, #000 100%)",
      }}
    >
      {/* Orbiting stars */}
      <div className="relative w-48 h-48 mb-10">
        {/* Central glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
        {/* Rotating ring */}
        <div
          className="absolute inset-4 rounded-full border border-gold/20"
          style={{ animation: "spin 8s linear infinite" }}
        />
        <div
          className="absolute inset-8 rounded-full border border-gold/10"
          style={{ animation: "spin 12s linear infinite reverse" }}
        />
        {/* Orbiting dots */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: i % 2 === 0 ? "#c9a84c" : "rgba(201,168,76,0.4)",
              top: "50%",
              left: "50%",
              transform: `rotate(${deg}deg) translateX(68px) translateY(-50%)`,
              animation: `spin ${6 + i}s linear infinite`,
              transformOrigin: "-68px 50%",
            }}
          />
        ))}
        {/* Center card back */}
        <div
          className="absolute inset-0 m-auto w-20 h-28 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d0d1a 100%)",
            border: "1px solid rgba(201,168,76,0.5)",
            boxShadow: "0 0 30px rgba(201,168,76,0.2)",
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <div className="text-center">
            <div className="font-cinzel text-gold text-2xl">✦</div>
            <div className="font-cinzel text-gold/30 text-xs tracking-widest mt-1">MYSTIC</div>
            <div className="font-cinzel text-gold/30 text-xs tracking-widest">PAWS</div>
          </div>
        </div>
      </div>

      {/* Reader name */}
      {readerName && (
        <div className="font-cinzel text-gold/60 text-xs tracking-[0.3em] uppercase mb-3">
          {readerName} is reading
        </div>
      )}

      {/* Rotating message */}
      <div
        className="font-sans text-parchment/70 text-sm text-center max-w-xs transition-opacity duration-400"
        style={{ opacity: fade ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        {MESSAGES[msgIndex]}
      </div>

      {/* Gold shimmer bar */}
      <div className="mt-8 w-48 h-px relative overflow-hidden" style={{ background: "rgba(201,168,76,0.15)" }}>
        <div
          className="absolute inset-y-0 w-16"
          style={{
            background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
            animation: "shimmer 2s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { left: -4rem; }
          100% { left: calc(100% + 4rem); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
