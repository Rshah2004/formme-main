import { Suspense, useEffect, useMemo, useState } from "react";
import EarthGlobe from "./EarthGlobe";

const NetworkGlobeSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [useStaticBrandLine, setUseStaticBrandLine] = useState(false);
  const locations = useMemo(
    () => [
      { name: "Bangladesh", count: 3 },
      { name: "India", count: 2 },
      { name: "China", count: 1 },
      { name: "Pakistan", count: 1 },
      { name: "Canada", count: 1 },
    ],
    []
  );
  const active = locations[activeIndex] || locations[0];
  const [typedName, setTypedName] = useState(active.name);
  const fullBrandLine =
    "Factories in our network have produced for brands like Old Navy, US Polo, Fanatics, Jack & Jones, MAX, and Bestseller.";
  const [typedBrandLine, setTypedBrandLine] = useState(fullBrandLine);

  useEffect(() => {
    setTypedName(active.name);
  }, [active.name]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmallPhoneViewport = typeof window !== "undefined" && window.innerWidth < 640;
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches;
    setUseStaticBrandLine(prefersReduced || (isSmallPhoneViewport && isCoarsePointer));
  }, []);

  useEffect(() => {
    if (useStaticBrandLine) {
      setTypedBrandLine(fullBrandLine);
      return;
    }

    let i = 0;
    let typingTimer: number | undefined;

    const typeNext = () => {
      i += 1;
      setTypedBrandLine(fullBrandLine.slice(0, i));
      if (i >= fullBrandLine.length) {
        if (typingTimer) window.clearInterval(typingTimer);
      }
    };

    setTypedBrandLine("");
    typingTimer = window.setInterval(typeNext, 20);

    return () => {
      if (typingTimer) window.clearInterval(typingTimer);
    };
  }, [fullBrandLine, useStaticBrandLine]);


  return (
    <section id="globe-section" className="bg-transparent py-10 md:py-16 [overflow-anchor:none]">
      <div className="container mx-auto px-6 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-3">
          Global Manufacturer Network
        </p>
        <h3 className="text-2xl md:text-3xl font-serif text-foreground leading-tight mb-2 max-w-lg mx-auto">
          Verified production across five regions.
        </h3>
        <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
          Bangladesh · India · China · Pakistan · Canada
        </p>
        <div id="globe-transition-anchor" className="mx-auto w-full max-w-5xl">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                Loading globe…
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] items-center gap-10">
              <div className="w-full h-[320px] md:h-[520px]">
                <EarthGlobe onActiveIndexChange={(idx) => idx >= 0 && setActiveIndex(idx)} />
              </div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Active Region
                </p>
                <h4 className="text-3xl md:text-4xl font-serif text-foreground mb-3 min-h-[2.75rem] md:min-h-[3.25rem]">
                  {typedName}
                </h4>
                <p className="text-base text-muted-foreground min-h-[1.5rem]">
                  {active.count} manufacturer{active.count === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <p className="text-sm md:text-base text-muted-foreground mt-8 max-w-3xl mx-auto min-h-[3.5rem]">
              {typedBrandLine}
              {!useStaticBrandLine && typedBrandLine.length < fullBrandLine.length && (
                <span className="inline-flex items-center gap-1 ml-1 align-middle" aria-hidden="true">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="w-4 h-[2px] bg-accent rotate-[-20deg] animate-pulse" />
                </span>
              )}
            </p>
          </Suspense>
        </div>
      </div>
    </section>
  );
};

export default NetworkGlobeSection;
