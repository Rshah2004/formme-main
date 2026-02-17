import * as React from "react";

const ManufacturerGlobe: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute -inset-6 rounded-full bg-[#344C3D]/10 blur-2xl" />
      <div className="relative h-72 w-72 rounded-full border border-[#344C3D]/30 bg-gradient-to-b from-white via-[#E6EFE8] to-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(52,76,61,0.25),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_65%,rgba(52,76,61,0.18),transparent_50%)]" />

        {/* Globe surface */}
        <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full">
          <defs>
            <clipPath id="globe-clip">
              <circle cx="150" cy="150" r="120" />
            </clipPath>
          </defs>

          {/* Latitude lines */}
          {[70, 95, 120, 145, 170].map((y) => (
            <line
              key={y}
              x1="40"
              x2="260"
              y1={y}
              y2={y}
              stroke="rgba(52,76,61,0.12)"
              strokeWidth="1"
            />
          ))}

          {/* Rotating map layer */}
          <g clipPath="url(#globe-clip)">
            <g className="globe-map">
              <path
                d="M30,120 C60,90 110,90 140,110 C165,128 180,150 165,175 C150,200 110,200 90,185 C70,170 55,150 30,120 Z"
                fill="rgba(52,76,61,0.35)"
              />
              <path
                d="M170,85 C200,70 240,80 255,110 C268,140 252,165 225,175 C200,185 185,165 175,145 C165,125 160,100 170,85 Z"
                fill="rgba(52,76,61,0.3)"
              />
              <path
                d="M120,210 C140,195 170,200 185,220 C200,240 185,260 160,265 C130,270 110,250 120,210 Z"
                fill="rgba(52,76,61,0.28)"
              />
              {/* Duplicate map to create seamless loop */}
              <g transform="translate(260,0)">
                <path
                  d="M30,120 C60,90 110,90 140,110 C165,128 180,150 165,175 C150,200 110,200 90,185 C70,170 55,150 30,120 Z"
                  fill="rgba(52,76,61,0.35)"
                />
                <path
                  d="M170,85 C200,70 240,80 255,110 C268,140 252,165 225,175 C200,185 185,165 175,145 C165,125 160,100 170,85 Z"
                  fill="rgba(52,76,61,0.3)"
                />
                <path
                  d="M120,210 C140,195 170,200 185,220 C200,240 185,260 160,265 C130,270 110,250 120,210 Z"
                  fill="rgba(52,76,61,0.28)"
                />
              </g>
            </g>
          </g>
        </svg>

        {/* Location dots */}
        <div className="absolute inset-0">
          <Dot x="58%" y="46%" label="Bangladesh" count="3" />
          <Dot x="55%" y="52%" label="India" count="2" />
          <Dot x="63%" y="48%" label="China" count="1" />
          <Dot x="52%" y="47%" label="Pakistan" count="1" />
        </div>
      </div>

      <style>{`
        @keyframes globe-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-260px); }
        }
        .globe-map {
          animation: globe-move 22s linear infinite;
        }
      `}</style>
    </div>
  );
};

const Dot = ({ x, y, label, count }: { x: string; y: string; label: string; count: string }) => (
  <div className="absolute" style={{ left: x, top: y }}>
    <span className="relative flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#344C3D]/40" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-[#344C3D]" />
    </span>
    <div className="absolute left-4 top-[-6px] whitespace-nowrap text-[10px] text-[#344C3D] font-semibold">
      {label} · {count}
    </div>
  </div>
);

export default ManufacturerGlobe;
