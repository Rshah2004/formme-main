import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const earlyAdopters = [
  {
    name: "9426",
    tagline: "conceptual, high-end apparel",
    description: "An independent fashion brand specializing in",
    fullDescription: ", currently placing real production orders through Formme.",
    status: "Shipped",
    website: "https://9426.ca",
    featured: true,
  },
  {
    name: "All Dubs",
    tagline: "streetwear with bold graphic direction",
    description: "An emerging independent label building its first production pipeline with",
    fullDescription: ", currently getting set up through Formme.",
    status: "Onboarding",
    website: null,
    featured: true,
  },
  {
    name: "Independent Brand →",
    tagline: "confidential production",
    description: "An independent brand focused on",
    fullDescription: ", currently in production through Formme.",
    status: "In Production",
    website: null,
    featured: false,
  },
];

export default function EarlyAdoptersSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAdopter = earlyAdopters[currentIndex];

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? earlyAdopters.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === earlyAdopters.length - 1 ? 0 : prev + 1));
  };

  return (
<section className="py-16 md:py-20 -mt-24 bg-transparent">
  <div className="max-w-5xl mx-auto px-6">
  {/* Section Header */}
        <motion.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.5}}
            className="text-center mb-14"
        >
                <span className="text-xs font-medium uppercase tracking-[0.35em] text-[#C8956C]/80 ">
Early Adopters</span>
<h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold italic tracking-tight text-[#2F4A3C]">
  Defining the future,
  <span className="block mt-3">
    one partner at a time.
  </span>
</h2>
          <p className="mt-6 text-base text-muted-foreground/80
 max-w-lg mx-auto mb-20">
            We're working closely with independent brands who are actively producing through manufacturers connected via
            Formme.
          </p>
        </motion.div>

    <div className="relative">
      <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-8 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={goPrev}
          className="rounded-full w-9 h-9 bg-white/90 border-border hover:bg-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-8 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={goNext}
          className="rounded-full w-9 h-9 bg-white/90 border-border hover:bg-white"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAdopter.name}
          initial={{opacity: 0, x: 30}}
          animate={{opacity: 1, x: 0}}
          exit={{opacity: 0, x: -30}}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-3xl pt-12 pb-8 px-8 md:pt-16 md:pb-12 md:px-12 shadow-sm border border-gray-100"
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left - Brand Logo Placeholder */}
            <div className="flex justify-center">
              <div className="bg-[#F5F4F0] rounded-2xl p-10 w-full max-w-[260px] aspect-square flex items-center justify-center">
                {currentAdopter.name === "9426" ? (
                  <span className="text-4xl md:text-5xl font-bold text-muted-foreground/40 tracking-tight">
                    {currentAdopter.name}
                  </span>
                ) : currentAdopter.featured ? (
                  <span className="text-3xl md:text-4xl font-bold text-muted-foreground/50 tracking-tight text-center">
                    {currentAdopter.name}
                  </span>
                ) : (
                  <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground/60">
                    Anonymous
                  </span>
                )}
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-4">
              <h3 className="text-3xl md:text-5xl font-serif font-semibold text-[#2F4A3C] italic tracking-tight">
                {currentAdopter.featured ? currentAdopter.name : "Independent Brand"}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                {currentAdopter.description}{" "}
                <span className="text-foreground italic underline decoration-[#C8956C] underline-offset-4">
                  {currentAdopter.tagline}
                </span>
                {currentAdopter.fullDescription}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                {currentAdopter.website ? (
                  <a href={currentAdopter.website} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#344C3D] hover:bg-[#2a3d31] text-white rounded-full px-6 py-5">
                      Visit the Label
                      <ArrowRight className="ml-2 w-4 h-4"/>
                    </Button>
                  </a>
                ) : (
                  <Button
                    className="bg-[#344C3D] hover:bg-[#2a3d31] text-white rounded-full px-6 py-5"
                    disabled
                  >
                    Anonymous Brand
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">STATUS</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C8956C]"></span>
                    <span className="text-sm font-medium text-foreground">{currentAdopter.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
      </div>
    </section>
  );
}
