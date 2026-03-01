import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LockedFeatureDialog } from "@/components/LockedFeatureDialog";

const HeroSection: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lockedFeature, setLockedFeature] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const videoId = "landing-fabric-video";
    const overlayId = "landing-video-overlay";
    const range = 360;
    let raf: number | null = null;

    const update = () => {
      const video = document.getElementById(videoId) as HTMLVideoElement | null;
      const overlay = document.getElementById(overlayId) as HTMLDivElement | null;
      if (!video || !overlay) return;
      if (video.playbackRate !== 0.75) {
        video.playbackRate = 0.75;
      }

      const y = window.scrollY || 0;
      const progress = Math.min(1, Math.max(0, y / range));
      const opacity = 1 - progress;
      const blur = 10 * progress;

      video.style.opacity = String(opacity);
      video.style.filter = `blur(${blur.toFixed(2)}px)`;
      overlay.style.opacity = String(0.2 * opacity);
    };

    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleDashboardClick = () => {
    if (!user) {
      // Navigate to dashboard preview mode for unauthenticated users
      navigate("/dashboard?preview=true");
    } else {
      navigate("/dashboard");
    }
  };

  const handleCreateClick = () => {
    if (!user) {
      setLockedFeature({
        name: "Create",
        description: "Create an account to start designing custom garments and bring your creative vision to life.",
      });
    } else {
      navigate("/coming-soon");
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-32 sm:pt-40 md:pt-52 px-5 sm:px-10 md:pl-24 md:pr-10">

      <div className="relative z-10 max-w-3xl">
        <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-[#2E3F36] mb-4">
          A digital workspace for apparel production and manufacturing
        </p>
        <h1
          className="text-[48px] sm:text-[72px] md:text-[96px] lg:text-[128px] font-instrument font-bold leading-none text-transparent 
          bg-gradient-to-r from-[#09100B] via-[#4A6A5C] to-[#09100B] 
          bg-[length:300%_100%] bg-clip-text animate-shimmer"
          style={{ textShadow: "0px 4px 4px rgba(0, 0, 0, 0.4)" }}
        >
          formme
        </h1>

        <p className="mb-8 sm:mb-10 text-xl sm:text-2xl md:text-3xl text-black">
          Design garments with precision. Move from concept to factory with a workflow that feels tactile.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-full sm:max-w-none">
          <button
            onClick={handleDashboardClick}
            className="w-full sm:w-[180px] md:w-[219px] h-[56px] sm:h-[64px] md:h-[72px] flex-shrink-0 text-white text-sm sm:text-base font-medium 
                       rounded-[30px] relative overflow-hidden
                       bg-[#344C3D] shadow-[3px_7px_5px_0px_rgba(0,0,0,0.25)]
                       hover:opacity-90 transition-opacity"
          >
            <div className="absolute inset-0 bg-[url('/imageButtons.png')] bg-cover bg-center mix-blend-multiply"></div>
            <span className="relative z-10">Dashboard</span>
          </button>

          <button
            onClick={handleCreateClick}
            className="w-full sm:w-[180px] md:w-[219px] h-[56px] sm:h-[64px] md:h-[72px] flex-shrink-0 text-white text-sm sm:text-base font-medium 
                       rounded-[30px] relative overflow-hidden
                       bg-[#974320] shadow-[3px_7px_5px_0px_rgba(0,0,0,0.25)]
                       hover:opacity-90 transition-opacity"
          >
            <div className="absolute inset-0 bg-[url('/imageButtons.png')] bg-cover bg-center mix-blend-multiply"></div>
            <span className="relative z-10">Create</span>
          </button>
        </div>
      </div>
    
      <LockedFeatureDialog
        open={!!lockedFeature}
        onOpenChange={(open) => !open && setLockedFeature(null)}
        featureName={lockedFeature?.name || ""}
        description={lockedFeature?.description || ""}
      />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#2E3F36]">
        <span className="font-instrument text-xs uppercase tracking-[0.45em] text-[#1F2B24] animate-pulse">
          Scroll
        </span>
        <span className="h-12 w-[2px] bg-[#1F2B24]/50 relative overflow-hidden rounded-full">
          <span className="absolute top-1 left-0 w-full h-3 bg-[#1F2B24] animate-bounce rounded-full" />
        </span>
        <span className="w-2 h-2 rounded-full bg-[#1F2B24] animate-ping opacity-70" />
      </div>
    </section>
  );
};

export default HeroSection;
