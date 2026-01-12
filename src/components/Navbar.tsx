"use client";

import { useState, useEffect } from "react";
import { UserIcon, CartIcon } from "./ui/Icons";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LockedFeatureDialog } from "@/components/LockedFeatureDialog";

interface NavBarProps {
  initialDark?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ initialDark = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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

  // Use a much deeper green gradient, multiply look
  // #09100B → #233229 → #09100B, slightly diagonal
  return (
    <header
      className={cn(
        "flex fixed inset-x-0 top-0 justify-between items-center px-9 py-0 h-20 z-[100] transition-all duration-300",
        scrolled
          ? "backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
          : "bg-transparent",
      )}
    >
      <Link to="/" className="flex items-center">
        <div
          className={cn(
            "text-3xl font-bold bg-none -ml-2 tracking-tight drop-shadow-sm transition-colors duration-300",
            initialDark && !scrolled ? "text-[#111827]" : "text-foreground",
          )}
        >
          formme
        </div>
      </Link>
      <nav className="hidden md:flex gap-8 mr-10 ml-auto">
        {["collection", "create", "dashboard", "reviews"].map((item) => {
          const isAuthRequired = item === "collection" || item === "create" || item === "dashboard";
          
          const handleClick = (e: React.MouseEvent) => {
            if (isAuthRequired && !user) {
              e.preventDefault();
              if (item === "collection") {
                setLockedFeature({
                  name: "Dashboard",
                  description: "Create an account to access your personal dashboard and manage all your designs.",
                });
              } else if (item === "create") {
                setLockedFeature({
                  name: "Create",
                  description: "Create an account to start designing custom garments and bring your vision to life.",
                });
              } else {
                setLockedFeature({
                  name: "Dashboard",
                  description: "Create an account to access the full dashboard and manage your projects.",
                });
              }
            }
          };
          
          return (
            <Link
              key={item}
              to={
                item === "create"
                  ? "/coming-soon"
                  : item === "dashboard"
                    ? "/dashboard"
                    : item === "reviews"
                      ? "/reviews"
                      : item === "collection"
                        ? "/coming-soon"
                        : "#"
              }
              onClick={handleClick}
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
          );
        })}
      </nav>
      <div className="flex gap-6 items-center">
        {user && (
          <Link to="/profile" aria-label="User profile">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <UserIcon />
            </button>
          </Link>
        )}
        <button aria-label="Shopping cart" className="p-2 rounded-full hover:bg-muted transition-colors">
          <CartIcon />
        </button>

        {!user && (
          <Link to="/auth">
            <button className="px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary shadow-sm cursor-pointer border-none rounded-full hover:bg-primary/90 transition-all duration-200">
              Sign up
            </button>
          </Link>
        )}
        <button className="md:hidden p-2 rounded-full hover:bg-muted transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
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
