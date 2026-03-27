import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Mail, Phone, MapPin, Instagram, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="container mx-auto px-6">
        {/* Top section with columns */}
        <div className="py-10 sm:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Column 1: Company */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="font-instrument text-xl mb-4 sm:mb-6">Formme</h3>
            <p className="text-gray-300 font-light max-w-xs mb-4 sm:mb-6 text-sm sm:text-base">
              From design intent to factory output.
            </p>
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

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-medium uppercase text-sm tracking-wider mb-4 sm:mb-6">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base"
                >
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Home</span>
                </Link>
              </li>
              {/* <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base"
                >
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>About Us</span>
                </Link>
              </li> */}
              {/* <li>
                <Link 
                  to="/reviews" 
                  className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base"
                >
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Reviews</span>
                </Link>
              </li> */}
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base"
                >
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="font-medium uppercase text-sm tracking-wider mb-4 sm:mb-6">Contact Us</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-[#96421f] mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base">Vancouver, BC</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-[#96421f] flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base">+1 604 773 6394</span>
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
        <div className="py-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {currentYear} Formme. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
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
