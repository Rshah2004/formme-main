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

  const currentManufacturer = allManufacturers[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allManufacturers.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allManufacturers.length - 1 ? 0 : prev + 1));
  };

  const isDark = currentManufacturer.variant === "dark";

  return (
    <section className="py-20 md:py-28 bg-[#EEEDEA]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Manufacturer Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Navigation Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-4 md:-ml-8 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full w-10 h-10 bg-white/80 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-4 md:-mr-8 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full w-10 h-10 bg-white/80 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Manufacturer Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentManufacturer.id}
              ref={sliderRef}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className={`rounded-3xl p-8 md:p-12 shadow-sm overflow-hidden ${
                isDark ? "bg-[#FEFDFB] border border-border/30" : "bg-white border border-gray-100"
              }`}
            >
              <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
                {/* Left Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Label */}
                  <span className="text-xs font-medium tracking-widest text-[#C8956C] uppercase">
                    {currentManufacturer.label}
                  </span>

                  {/* Headline */}
                  <h2 className="text-3xl md:text-4xl font-serif font-normal text-[#344C3D] leading-tight italic">
                    {currentManufacturer.name}
                  </h2>

                  {/* Description */}
                  <p className="text-muted-foreground text-base leading-relaxed max-w-xl">
                    {currentManufacturer.description}
                    {currentManufacturer.clients.length > 0 && (
                      <>
                        {" "}
                        <span className="font-semibold text-foreground">{currentManufacturer.clients.join(", ")}.</span>
                      </>
                    )}
                  </p>

                  {/* Metrics Row */}
                  {currentManufacturer.metrics.length > 0 && (
                    <div className="flex gap-12 py-4 border-b border-gray-100">
                      {currentManufacturer.metrics.map((metric, index) => (
                        <div key={index}>
                          <div className="text-2xl md:text-3xl font-serif font-medium text-foreground">
                            {metric.value}
                          </div>
                          <div className="text-[10px] tracking-widest text-muted-foreground mt-1 uppercase">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Capability Badges */}
                  {currentManufacturer.capabilities.length > 0 && (
                    <div className="space-y-3">
                      {currentManufacturer.capabilities.map((capability, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#F9E8DB] flex items-center justify-center flex-shrink-0">
                            <capability.icon className="w-4 h-4 text-[#C8956C]" />
                          </div>
                          <span className="text-xs font-medium text-foreground uppercase tracking-wide">
                            {capability.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  {currentManufacturer.externalUrl ? (
                    <a href={currentManufacturer.externalUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="rounded-full px-6 py-5 text-sm bg-[#344C3D] hover:bg-[#2a3d31] text-white">
                        View Profile
                      </Button>
                    </a>
                  ) : (
                    <Button
                      className="rounded-full px-6 py-5 text-sm bg-[#344C3D] hover:bg-[#2a3d31] text-white"
                      onClick={() => navigate("/coming-soon")}
                    >
                      Request match
                    </Button>
                  )}
                </div>

                {/* Right Side - Brand Logo */}
                <div className="flex items-center justify-center">
                  <div
                    className={`rounded-3xl p-10 md:p-16 w-full min-h-[280px] flex flex-col items-center justify-center ${
                      isDark ? "bg-[#F5F4F0]" : "bg-[#FAF9F6]"
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-3xl md:text-4xl font-bold tracking-tight text-muted-foreground/60">
                        {currentManufacturer.brandLogo}
                      </div>
                      <div className="text-sm tracking-[0.3em] text-muted-foreground/50">
                        {currentManufacturer.brandSubtext}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {allManufacturers.map((manu, index) => (
              <button
                key={manu.id}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-[#344C3D] w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2.5"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
      {/* Early Brand Partners Section */}
      <div className="container mx-auto px-6 mt-40">
        <div className="max-w-5xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <span className="text-sm font-mono text-secondary uppercase tracking-[0.4em] font-bold">
              Early Adopters
            </span>
            <h2 className="text-4xl md:text-7xl font-serif font-bold text-primary italic leading-tight">
              Defining the future, <br /> one partner at a time.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              We’re working closely with independent brands who are actively producing through manufacturers connected
              via Formme.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-secondary/5 to-primary/5 rounded-[48px] blur-2xl group-hover:opacity-100 transition-opacity opacity-0" />
            <div className="relative bg-white border border-border/40 rounded-[40px] p-10 md:p-20 shadow-sm overflow-hidden">
              {/* Subtle Background Text */}
              <div className="absolute top-10 right-10 text-[12rem] font-serif font-black text-accent/10 pointer-events-none select-none italic leading-none">
                9426
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center relative z-10">
                <div className="lg:col-span-2">
                  <div className="aspect-square bg-accent/20 rounded-3xl flex items-center justify-center p-12 hover:bg-accent/30 transition-colors cursor-crosshair group/logo">
                    <img
                      src={brand9426}
                      alt="9426 Logo"
                      className="w-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h3 className="text-5xl md:text-7xl font-serif font-bold text-primary italic tracking-tighter">
                        9426
                      </h3>
                      <div className="h-[2px] w-12 bg-secondary/30" />
                    </div>
                    <p className="text-2xl text-muted-foreground font-light leading-relaxed">
                      An independent fashion brand specializing in{" "}
                      <span className="text-primary font-medium italic underline underline-offset-8 decoration-secondary/40">
                        conceptual, high-end apparel
                      </span>
                      , currently placing real production orders through Formme-connected manufacturing partners.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                    <a
                      href="https://9426.ca/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-14 px-10 bg-primary text-white rounded-full font-bold text-sm hover:bg-secondary hover:shadow-2xl hover:shadow-secondary/20 transition-all flex items-center gap-3 group/btn"
                    >
                      Visit the Label{" "}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/60 mb-1">
                        Status
                      </span>
                      <span className="text-xs font-bold text-primary flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        Active Production Order
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
