
import React from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '@/components/homePage/HeroSection';
import Features from '@/components/homePage/Features';
import WhatWeOffer from '@/components/homePage/WhatWeOffer';
import CraftsmanshipSection from '@/components/homePage/CraftsmanshipSection';
import MarketplaceShowcase from '@/components/homePage/MarketplaceShowcase';
import ReviewsSection from '@/components/homePage/ReviewsSection';
import EmailSignup from '@/components/homePage/EmailSignup';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen font-inter">
      <HeroSection />
      <Features />
      <WhatWeOffer />
      <CraftsmanshipSection />
      <MarketplaceShowcase />
      <ReviewsSection />
      <EmailSignup />
      
      <section className="py-24 bg-[#FFF7DE]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-[#000000]">Start Creating Today</h2>
            <p className="mb-10 text-[#344C3D] font-light text-lg">Experience the professional difference with our cutting-edge design tools.</p>
            <Link to="/designer" className="inline-block">
              <Button 
                className="group bg-[#344C3D] hover:bg-[#2c4a3c] text-white rounded-lg py-6 px-8 font-medium transition-all duration-300"
              >
                <span>Launch Designer</span>
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
