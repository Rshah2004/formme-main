import { useState } from "react";
import techpackPreview from "@/assets/techpack-upload.png";
import kanbanPreview from "@/assets/kanbanPreview.png";
import sampleReview from "@/assets/sampleReview.png";
import manfacturerMatching from "@/assets/ManufacturerMatching.png";

const tabs = [
  {
    id: "reliable",
    label: "Find Reliable Manufacturers",
    title: "Find reliable manufacturing partners, fast.",
    description:
      "Review verified factories with real production history and craftsmanship you can trust. Choose partners aligned with your category, MOQ, and quality expectations.",
    video: "/CraftsmanshipVideo.mp4",
    chip: "Verified Network",
  },
  {
    id: "tech-packs",
    label: "Design & Tech Packs",
    title: "Structured inputs, not scattered files.",
    description:
      "Define measurements, fabric specs, and construction details in a guided workflow. Every order starts with a complete, factory-ready tech pack—generated or uploaded.",
    image: techpackPreview,
    imageClass: "brightness-110 contrast-95",
    chip: "Tech Pack Builder",
  },
  {
    id: "matching",
    label: "Manufacturer Matching",
    title: "Matched to verified factories, not a directory.",
    description:
      "Submit your requirements and get connected to pre-vetted manufacturers based on category, MOQ, and capability. No cold outreach, no guesswork.",
    image: manfacturerMatching,
    imageClass: "brightness-110 contrast-95",
    chip: "Smart Matching",
  },
  {
    id: "sampling",
    label: "Sampling & Approvals",
    title: "Track every sample, every revision.",
    description:
      "Manage the back-and-forth of sampling in one timeline. Approve or request changes with context—measurements, photos, and notes stay linked to the order.",
    image: sampleReview,
    imageClass: "object-contain p-6 scale-90",
    chip: "Sample Tracker",
  },
  {
    id: "tracking",
    label: "Production Tracking",
    title: "Real-time visibility from cut to ship.",
    description:
      "Monitor production stages, communicate with manufacturers, and track delivery—all without leaving the platform.",
    image: kanbanPreview,
    imageClass: "brightness-110 contrast-95 scale-90",
    chip: "Order Status",
  },
];

const PlatformSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const active = tabs[activeTab];

  return (
    <section id="platform" className="py-16 md:py-20 pb-20 md:pb-24 bg-transparent">
      <div className="container mx-auto px-6 text-center">
        <h2
          id="platform-heading"
          className="text-4xl md:text-[3.5rem] font-serif text-foreground leading-tight mb-6 max-w-2xl mx-auto"
        >
          The future of garment production, today.
        </h2>

        <div className="inline-flex flex-wrap justify-center gap-3 mb-6">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(i)}
              className={`px-5 md:px-7 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                i === activeTab
                  ? "bg-white text-foreground border-border shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
                  : "bg-white/70 text-muted-foreground border-border/50 hover:text-foreground hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.18)] mt-8">
          <div className="grid md:grid-cols-2 min-h-[600px]">
            <div className="p-10 md:p-16 flex flex-col justify-center text-left">
              <h3 className="text-2xl md:text-3xl font-serif text-foreground leading-snug mb-5">
                {active.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {active.description}
              </p>
              {/* Learn more removed */}
            </div>

            <div className="relative p-8 md:p-12 flex items-center justify-center">
              <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden bg-white shadow-[0_26px_60px_rgba(0,0,0,0.18)]">
                {active.video ? (
                  <video
                    src={active.video}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={active.image}
                    alt={active.label}
                    className={`absolute inset-0 w-full h-full object-cover object-center ${
                      active.imageClass ?? ""
                    }`}
                  />
                )}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-white text-foreground text-sm font-medium px-5 py-2.5 rounded-full shadow-[0_12px_26px_rgba(0,0,0,0.18)]">
                    {active.chip}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function PipelineSection() {
  return <PlatformSection />;
}

// function FeatureCard({title, description, icon: Icon, image, small}: {
//   title: string,
//   description: string,
//   icon: any,
//   image?: string,
//   small?: boolean
// }) {
//   return (
//       <div
//           className={`bg-[#FAF9F6] border border-border/40 rounded-[24px] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group`}>
//         {image && (
//             <div className={`overflow-hidden border-b border-border/40 bg-white aspect-video`}>
//               <img src={image} alt={title}
//                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"/>
//             </div>
//         )}
//         <div className={`${small ? 'p-6' : 'p-8'} space-y-4`}>
//           <div
//               className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-colors border border-border/10">
//             <Icon className="w-5 h-5"/>
//           </div>
//           <div className="space-y-1">
//             <h3 className="text-xl font-serif font-bold text-primary italic">{title}</h3>
//             <p className="text-muted-foreground leading-relaxed text-xs">
//               {description}
//             </p>
//           </div>
//         </div>
//       </div>
//   );
// }
