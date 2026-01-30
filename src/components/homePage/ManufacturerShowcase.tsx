import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Users,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Factory,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// All manufacturers data
const allManufacturers = [
  {
    id: "supreme",
    label: "STRATEGIC PARTNER",
    name: "Supreme Stitch (Supreme Group)",
    description: "Our primary manufacturing partner, delivering high-quality garments for global leaders including",
    clients: ["Champion", "Costco", "Hanes", "Fanatics"],
    metrics: [
      { value: "$70M+", label: "ANNUAL REVENUE" },
      { value: "3,000+", label: "SKILLED WORKERS" },
    ],
    capabilities: [
      { icon: Globe, text: "EXPORT-READY FOR UK, EUROPE, USA, AND CANADA" },
      { icon: CheckCircle2, text: "STRUCTURED QC ACROSS SAMPLING & BULK" },
    ],
    externalUrl: "https://supremegroupbd.com/supremestitch/",
    brandLogo: "SUPREME",
    brandSubtext: "STITCH",
    variant: "dark" as const, // dark card bg
  },
  {
    id: "rose",
    label: "INTIMATES SPECIALIST",
    name: "Rose Intimates Limited",
    description: "A 100% export-oriented manufacturer specializing in intimates for global leaders like",
    clients: ["Bestseller", "Max", "Yamamay"],
    metrics: [
      { value: "2.8M", label: "MONTHLY CAPACITY" },
      { value: "1,150+", label: "MAN POWER" },
    ],
    capabilities: [
      { icon: CheckCircle2, text: "BSCI, SEDEX, OEKO-TEX CERTIFIED" },
      { icon: Factory, text: "46 PRODUCTION LINES • AUTO CUTTING" },
    ],
    externalUrl: "http://roseintimates.com/",
    brandLogo: "ROSE",
    brandSubtext: "INTIMATES",
    variant: "light" as const, // light card bg
  },
  {
    id: "ratool",
    label: "KNIT SPECIALIST",
    name: "Ratool Apparels Ltd",
    description:
      "A large-scale knit garment manufacturer serving international retailers across North America, Europe, and Australia including",
    clients: ["Walmart", "Costco", "Aldi", "Lidl"],
    metrics: [
      { value: "500+", label: "SEWING MACHINES" },
      { value: "1M", label: "MONTHLY CAPACITY" },
    ],
    capabilities: [
      { icon: Globe, text: "EXPORT-READY FOR USA, CANADA, EUROPE & AUSTRALIA" },
      { icon: CheckCircle2, text: "CERTIFIED FACTORY (WRAP, OEKO-TEX, ACCORD)" },
    ],
    externalUrl: "https://ratoolapparels.com",
    brandLogo: "RATOOL",
    brandSubtext: "APPARELS",
    variant: "dark" as const,
  },
  {
    id: "navex",
    label: "SPORTSWEAR SPECIALIST",
    name: "Navex Impex",
    description:
      "Small-scale manufacturer specializing in made-to-order sportswear with flexible MOQs and full customization support.",
    clients: [],
    metrics: [],
    capabilities: [
      { icon: Settings, text: "LOW-MOQ & SAMPLE-FIRST PRODUCTION" },
      { icon: CheckCircle2, text: "CUT & SEW WITH PRINTING SUPPORT" },
    ],
    externalUrl: null,
    brandLogo: "NAVEX",
    brandSubtext: "IMPEX",
    variant: "light" as const,
  },
];

export default function ManufacturerShowcase() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const current = allManufacturers[currentIndex];

  const goPrev = () => setCurrentIndex((i) => (i === 0 ? allManufacturers.length - 1 : i - 1));
  const goNext = () => setCurrentIndex((i) => (i === allManufacturers.length - 1 ? 0 : i + 1));

  return (
    <section className="py-24 bg-[#EEEDEA]">
      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Arrows */}
        <Button
          onClick={goPrev}
          size="icon"
          variant="outline"
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 rounded-full bg-white shadow"
        >
          <ChevronLeft />
        </Button>

        <Button
          onClick={goNext}
          size="icon"
          variant="outline"
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-6 rounded-full bg-white shadow"
        >
          <ChevronRight />
        </Button>

        {/* Slider */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            ref={sliderRef}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className={`rounded-[40px] p-8 md:p-12 border border-border/40 flex flex-col
              ${current.variant === "accent" ? "bg-accent/30" : "bg-white shadow-sm"}`}
          >
            {/* Content */}
            <div className="flex-grow space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-secondary uppercase tracking-[0.3em] font-bold">
                  {current.label}
                </span>

                <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary italic leading-tight">
                  {current.name}
                </h2>

                <p className="text-base text-muted-foreground leading-relaxed">
                  {current.description}{" "}
                  {current.clients.length > 0 && (
                    <span className="text-primary font-bold">{current.clients.join(", ")}</span>
                  )}
                  .
                </p>
              </div>

              {/* Metrics */}
              {current.metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-4 py-6 border-y border-border/20">
                  {current.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-2xl font-serif font-black text-primary">{m.value}</p>
                      <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Capabilities */}
              <div className="space-y-4">
                {current.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <cap.icon className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-bold uppercase tracking-wide text-primary">{cap.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="pt-8 mt-8 border-t border-border/40 flex items-center justify-between">
              {current.externalUrl ? (
                <a
                  href={current.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-8 bg-primary text-white rounded-full text-xs font-bold hover:bg-secondary transition inline-flex items-center"
                >
                  View Profile
                </a>
              ) : (
                <button
                  onClick={() => navigate("/coming-soon")}
                  className="h-12 px-8 bg-primary text-white rounded-full text-xs font-bold"
                >
                  Request Match
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {allManufacturers.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setCurrentIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30 w-2.5"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
