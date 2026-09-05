import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { BG, LAVENDER, INK, MUTED2, PURPLE } from "@/components/homePage/theme";
import { SolidButton, LandingHeader, LandingFooter } from "@/components/homePage/LandingChrome";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col" style={{ background: BG, color: INK }}>
      <SEO title="Page not found" noindex={true} />
      <LandingHeader />

      <div className="flex-1 flex items-center justify-center px-6 pt-32 pb-20" style={{ background: LAVENDER }}>
        <div className="text-center max-w-md p-10 bg-white rounded-2xl" style={{ border: '1px solid #E7E3F5' }}>
          <p className="font-cormorant font-medium leading-none mb-4" style={{ color: PURPLE, fontSize: '72px' }}>404</p>
          <p className="font-inter" style={{ color: MUTED2, fontSize: '15px' }}>
            Oops! We couldn't find the page you're looking for.
          </p>
          <div className="pt-6">
            <SolidButton href="/">Back to home</SolidButton>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default NotFound;
