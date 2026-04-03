import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Mail, MapPin, Instagram, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const featureLinks = [
    { label: "Structured Pipeline", to: "/auth?mode=signup" },
    { label: "Manufacturer Matching", to: "/auth?mode=signup" },
    { label: "Production Tracking", to: "/auth?mode=signup" },
    { label: "Small-Batch Production", to: "/auth?mode=signup" },
  ];
  const companyLinks = [
    { label: "Support", to: "/support" },
    { label: "Dashboard Preview", to: "/dashboard?preview=true" },
    { label: "Book a Demo", to: "/auth?mode=signup" },
  ];

  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="container mx-auto px-6">
        {/* Top section with columns */}
        <div className="py-10 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(2,1fr)_1.1fr] gap-8 sm:gap-10">
          <div>
            <h3 className="font-instrument text-2xl mb-4">Formme</h3>
            <p className="text-gray-300 font-light max-w-sm mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
              Production infrastructure for modern apparel brands. Move from creative intent to manufacturer-ready execution in one structured system.
            </p>
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors mb-6"
            >
              Book a demo
            </Link>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/formme.design/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/formmedesign"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium uppercase text-sm tracking-wider mb-4 sm:mb-6">Platform</h4>
            <ul className="space-y-2 sm:space-y-3">
              {featureLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base"
                  >
                    <ChevronRight className="h-4 w-4 mr-2 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium uppercase text-sm tracking-wider mb-4 sm:mb-6">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base"
                  >
                    <ChevronRight className="h-4 w-4 mr-2 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium uppercase text-sm tracking-wider mb-4 sm:mb-6">Contact</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-[#96421f] mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base">Vancouver, BC</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-[#96421f] flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base break-all">formme.design@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-800" />

        {/* Bottom section with copyright */}
        <div className="py-8 flex flex-col gap-4 md:flex-row md:justify-between md:items-center text-sm text-gray-400">
          <p>© {currentYear} Formme. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <Link to="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
