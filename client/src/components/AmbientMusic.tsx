import { useState, useEffect, useRef } from "react";

const MUSIC_URL = "/manus-storage/ambient_tarot_2406184f.mp3";

export default function AmbientMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true); // start muted, user opts in

  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.35;
    audio.muted = true;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.muted = false;
      audio.play().catch(() => {});
      setMuted(false);
    } else {
      audio.muted = true;
      setMuted(true);
    }
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
    <button
      onClick={toggle}
      title={muted ? "Play ambient music" : "Mute music"}
      className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
      style={{
        background: "rgba(17,17,17,0.85)",
        border: "1px solid rgba(201,168,76,0.5)",
        color: "#c9a84c",
        boxShadow: muted ? "none" : "0 0 12px rgba(201,168,76,0.4)",
      }}
      aria-label={muted ? "Unmute ambient music" : "Mute ambient music"}
    >
      {muted ? (
        // Muted icon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        // Playing icon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
