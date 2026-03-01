import { Suspense, useEffect, useMemo, useState } from "react";
import EarthGlobe from "./EarthGlobe";

const NetworkGlobeSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
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
    "Stitched across our network: factories behind Old Navy, US Polo, Fanatics, Jack & Jones, MAX, and Bestseller—quality proven at scale, from the UK onward.";
  const [typedBrandLine, setTypedBrandLine] = useState(fullBrandLine);

  useEffect(() => {
    let i = 0;
    const name = active.name;
    setTypedName("");
    const timer = window.setInterval(() => {
      i += 1;
      setTypedName(name.slice(0, i));
      if (i >= name.length) {
        window.clearInterval(timer);
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [active.name]);

  useEffect(() => {
    let i = 0;
    let typingTimer: number | undefined;
    let restartTimer: number | undefined;

    const typeNext = () => {
      i += 1;
      setTypedBrandLine(fullBrandLine.slice(0, i));
      if (i >= fullBrandLine.length) {
        if (typingTimer) window.clearInterval(typingTimer);
        restartTimer = window.setTimeout(() => {
          i = 0;
          setTypedBrandLine("");
          typingTimer = window.setInterval(typeNext, 20);
        }, 2000);
      }
    };

    setTypedBrandLine("");
    typingTimer = window.setInterval(typeNext, 20);

    return () => {
      if (typingTimer) window.clearInterval(typingTimer);
      if (restartTimer) window.clearTimeout(restartTimer);
    };
  }, [fullBrandLine]);

  const spacedName = typedName.split("").join(" ");

  return (
    <section id="globe-section" className="bg-transparent py-10 md:py-16">
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
              <div className="w-full h-[420px] md:h-[520px]">
                <EarthGlobe onActiveIndexChange={(idx) => idx >= 0 && setActiveIndex(idx)} />
              </div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Active Region
                </p>
                <h4 className="text-3xl md:text-4xl font-serif text-foreground mb-3 tracking-[0.2em]">
                  {spacedName}
                </h4>
                <p className="text-base text-muted-foreground">
                  {active.count} manufacturer{active.count === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <p className="text-sm md:text-base text-muted-foreground mt-8 max-w-3xl mx-auto relative">
              <span className="opacity-0 block" aria-hidden="true">
                {fullBrandLine}
              </span>
              <span className="absolute inset-0">
                {typedBrandLine}
                <span className="inline-flex items-center gap-1 ml-1 align-middle" aria-hidden="true">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="w-4 h-[2px] bg-accent rotate-[-20deg] animate-pulse" />
                </span>
              </span>
            </p>
          </Suspense>
        </div>
      </div>
    </section>
  );
};

export default NetworkGlobeSection;
