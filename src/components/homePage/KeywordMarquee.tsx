import * as React from "react";

interface KeywordMarqueeProps {
  speedMs?: number; // duration for one full loop
}

const keywords = [
  "Designer ↔ Manufacturer matching",
  "Clear specs & requirements",
  "Centralized communication",
  "Revision + approval tracking",
  "Time zone friendly workflows",
  "Fewer misunderstandings",
  "Faster sampling cycles",
  "Production visibility",
];


const KeywordMarquee: React.FC<KeywordMarqueeProps> = ({ speedMs = 22000 }) => {
  return (
    <div className="relative group overflow-hidden rounded-full">
      {/* Bar background set to brand green (matches Explore button) */}
      <div className="w-full rounded-full border shadow-sm" style={{
        background: "#344C3D",
        borderColor: "rgba(255,255,255,0.12)",
      }}>
        {/* Masks for edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#344C3D] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#344C3D] to-transparent" />

        {/* keyframes + pause on hover */}
        <style>{`
          @keyframes pill-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .pill-marquee { animation: pill-scroll ${speedMs}ms linear infinite; }
          .group:hover .pill-marquee { animation-play-state: paused; }
        `}</style>

        <div className="flex items-center whitespace-nowrap py-3 md:py-4">
          <div className="pill-marquee flex items-center gap-4 md:gap-6 min-w-max px-4">
            {[...keywords, ...keywords].map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center px-4 py-1.5 rounded-full text-xs md:text-sm text-white/95"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordMarquee;
