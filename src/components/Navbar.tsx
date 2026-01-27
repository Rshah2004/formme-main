"use client";

import { useState, useEffect } from "react";
import { UserIcon, CartIcon } from "./ui/Icons";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LockedFeatureDialog } from "@/components/LockedFeatureDialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

interface NavBarProps {
  initialDark?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ initialDark = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

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

  const navItems = ["collection", "create", "dashboard"];

  const handleNavClick = (item: string, e?: React.MouseEvent) => {
    // Dashboard is accessible without login (preview mode)
    if (item === "dashboard" && !user) {
      e?.preventDefault();
      setMobileMenuOpen(false);
      navigate("/dashboard?preview=true");
      return;
    }
    
    const isAuthRequired = item === "collection" || item === "create";
    
    if (isAuthRequired && !user) {
      e?.preventDefault();
      if (item === "collection") {
        setLockedFeature({
          name: "Collection",
          description: "Create an account to access your personal collection and manage all your designs.",
        });
      } else if (item === "create") {
        setLockedFeature({
          name: "Create",
          description: "Create an account to start designing custom garments and bring your vision to life.",
        });
      }
      setMobileMenuOpen(false);
      return;
    }

    setMobileMenuOpen(false);
  };

  const getNavLink = (item: string) => {
    if (item === "create") return "/coming-soon";
    if (item === "dashboard") return "/dashboard";
    if (item === "collection") return "/coming-soon";
    return "#";
  };

  return (
    <header
      className={cn(
        "flex fixed inset-x-0 top-0 justify-between items-center px-4 sm:px-6 md:px-9 py-0 h-16 sm:h-20 z-[100] transition-all duration-300",
        scrolled
          ? "backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
          : "bg-transparent",
      )}
    >
      <Link to="/" className="flex items-center">
        <div
          className={cn(
            "text-2xl sm:text-3xl font-bold bg-none tracking-tight drop-shadow-sm transition-colors duration-300",
            initialDark && !scrolled ? "text-[#111827]" : "text-foreground",
          )}
        >
          formme
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-8 mr-10 ml-auto">
        {navItems.map((item) => (
          <Link
            key={item}
            to={getNavLink(item)}
            onClick={(e) => handleNavClick(item, e)}
            className={cn(
              "text-lg relative py-1 group transition-colors",
              initialDark && !scrolled
                ? "text-[#111827] hover:text-[#111827]/80"
                : "text-foreground hover:text-foreground/80",
            )}
          >
            {item}
            <span
              className={cn(
                "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                initialDark && !scrolled ? "bg-[#111827]" : "bg-foreground",
              )}
            ></span>
          </Link>
        ))}
      </nav>

      <div className="flex gap-3 sm:gap-6 items-center">
        {user && (
          <Link to="/profile" aria-label="User profile">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <UserIcon />
            </button>
          </Link>
        )}

        {!user && (
          <Link to="/auth" className="hidden sm:block">
            <button className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-primary-foreground bg-primary shadow-sm cursor-pointer border-none rounded-full hover:bg-primary/90 transition-all duration-200">
              Sign up
            </button>
          </Link>
        )}

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden p-2 rounded-full hover:bg-muted transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[350px] bg-background">
            <nav className="flex flex-col gap-6 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item}
                  to={getNavLink(item)}
                  onClick={(e) => handleNavClick(item, e)}
                  className="text-xl font-medium text-foreground hover:text-primary transition-colors capitalize"
                >
                  {item}
                </Link>
              ))}
              
              <div className="border-t border-border pt-6 mt-2">
                {!user ? (
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-6 py-3 text-sm font-medium text-primary-foreground bg-primary shadow-sm cursor-pointer border-none rounded-full hover:bg-primary/90 transition-all duration-200">
                      Sign up
                    </button>
                  </Link>
                ) : (
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-6 py-3 text-sm font-medium text-primary-foreground bg-primary shadow-sm cursor-pointer border-none rounded-full hover:bg-primary/90 transition-all duration-200">
                      My Profile
                    </button>
                  </Link>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      
      <LockedFeatureDialog
        open={!!lockedFeature}
        onOpenChange={(open) => !open && setLockedFeature(null)}
        featureName={lockedFeature?.name || ""}
        description={lockedFeature?.description || ""}
      />
    </header>
  );
};

export default NavBar;