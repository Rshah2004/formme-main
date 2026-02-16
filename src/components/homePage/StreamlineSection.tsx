import * as React from "react";
import { Pencil, CheckCircle2, LayoutDashboard, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Pencil,
    title: "Intuitive Design Upload",
    mockElements: ["Design Name", "Category", "Fabric Type", "Measurements", "Tech Pack"],
  },
  {
    icon: CheckCircle2,
    title: "Instant Manufacturer Matching",
    mockElements: ["Match Score", "Sustainability", "Lead Time", "Capacity", "Certifications"],
  },
  {
    icon: LayoutDashboard,
    title: "Organized Production Tracking",
    mockElements: ["Tech Pack Review", "Sample Dev", "Quality Check", "Shipping", "Delivered"],
  },
  {
    icon: BarChart3,
    title: "Detailed Production Insights",
    mockElements: ["Orders", "Status", "Timeline", "Budget", "QC Score"],
  },
];

const MockCard: React.FC<{ feature: typeof features[0]; index: number }> = ({ feature, index }) => {
  const Icon = feature.icon;
  return (
    <div className="group flex flex-col">
      {/* Glass overlay container */}
      <div className="rounded-2xl p-3 sm:p-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:-translate-y-1">
        {/* Inner white card (the "screenshot") */}
        <div className="rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="p-4 sm:p-5">
            {/* Browser chrome dots */}
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
              <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
              <div className="w-2 h-2 rounded-full bg-[#28C840]" />
              <div className="ml-3 flex-1 h-6 rounded-md bg-[#F5F4F0] flex items-center px-3">
                <span className="text-[10px] text-muted-foreground font-mono">formme.io/{["design", "manufacturers", "dashboard", "insights"][index]}</span>
              </div>
            </div>

            {/* Mock sidebar + content */}
            <div className="flex gap-3">
              {/* Sidebar mock */}
              <div className="hidden sm:flex flex-col gap-2 w-28 shrink-0">
                <div className="h-5 rounded bg-[#344C3D]/10 w-20" />
                <div className="h-5 rounded bg-[#344C3D] w-24 flex items-center px-2">
                  <span className="text-[9px] text-white font-medium truncate">{feature.mockElements[0]}</span>
                </div>
                <div className="h-5 rounded bg-[#344C3D]/5 w-20" />
                <div className="h-5 rounded bg-[#344C3D]/5 w-16" />
              </div>

              {/* Content area */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-[#344C3D]" />
                  <div className="h-4 rounded bg-[#344C3D]/10 w-24" />
                </div>
                <div className="space-y-2">
                  {feature.mockElements.slice(1).map((el, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="h-3.5 rounded"
                        style={{
                          width: `${60 + ((index * 17 + i * 23) % 30)}%`,
                          backgroundColor: i === 0 ? "#344C3D" : i === 1 ? "#96421f" : "#F2EDE6",
                        }}
                      />
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">{el}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons mock */}
                <div className="flex gap-2 mt-4">
                  <div className="h-7 rounded-full bg-[#344C3D] flex items-center px-3">
                    <span className="text-[9px] text-white font-medium">
                      {["Generate Tech Pack", "View Match", "Track Order", "View Report"][index]}
                    </span>
                  </div>
                  <div className="h-7 rounded-full border border-[#344C3D]/20 flex items-center px-3">
                    <span className="text-[9px] text-[#344C3D] font-medium">Details</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <h3 className="text-center text-white text-base sm:text-lg md:text-xl font-semibold mt-5 font-serif">
        {feature.title}
      </h3>
    </div>
  );
};

const StreamlineSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-[#344C3D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">
            Streamline Your Production Process
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Formme provides powerful tools to make apparel production faster, smarter, and more efficient
          </p>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
          {features.map((feature, index) => (
            <MockCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StreamlineSection;
