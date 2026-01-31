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
    description: "Our first manufacturing partner, delivering high-quality garments for global leaders including",
    clients: [ "Old Navy", "US POLO", "Champion", "Costco", "Hanes", "Fanatics", "Walmart"],
    metrics: [
      { value: "$70M+", label: "ANNUAL REVENUE" },
      { value: "3,000+", label: "SKILLED WORKERS" },
      { value: "60,000+", label: "DAILY PRODUCTION" },
      { value: "15+", label: "YEARS IN MARKET"}
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
    clients: ["Bestseller", "Max", "Jack & Jones"],
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
      <section className="py-20 md:py-28 -mt-24 bg-white">

        <div className="max-w-7xl mx-auto px-6">
          {/* Manufacturer Slider */}
          <motion.div
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.6}}
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
                <ChevronLeft className="w-5 h-5"/>
              </Button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-4 md:-mr-8 z-10">
              <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNext}
                  className="rounded-full w-10 h-10 bg-white/80 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-white"
              >
                <ChevronRight className="w-5 h-5"/>
              </Button>
            </div>

            {/* Manufacturer Card */}
            <AnimatePresence mode="wait">
              <motion.div
                  key={currentManufacturer.id}
                  ref={sliderRef}
                  initial={{opacity: 0, x: 50}}
                  animate={{opacity: 1, x: 0}}
                  exit={{opacity: 0, x: -50}}
                  transition={{duration: 0.4}}
                  className={`rounded-3xl p-8 md:p-12 shadow-sm overflow-hidden ${
                      isDark ? "bg-[#FAF7F4]  border border-border/30" : "bg-white border border-gray-100"
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
                            <span
                                className="font-semibold text-foreground">{currentManufacturer.clients.join(", ")}.</span>
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
                                <div
                                    className="w-8 h-8 rounded-full bg-[#F9E8DB] flex items-center justify-center flex-shrink-0">
                                  <capability.icon className="w-4 h-4 text-[#C8956C]"/>
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
      </section>
  );
}
