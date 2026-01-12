import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Box, User, Palette, Layers3, RotateCcw, ZoomIn } from 'lucide-react';

const ComingSoon = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const feature = searchParams.get('feature');

  const is3DFeature = feature === '3d';
  const isMannequinFeature = feature === 'mannequin';

  const getFeatureContent = () => {
    // Default content for professional studio
    return {
      title: "Coming Soon",
      description: "This page is currently under development. We're working hard to bring you the most advanced design tools for fashion professionals.",
      
    };
  };

  const content = getFeatureContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f3] to-[#efede6]">
      <Navbar />
      
      <div className="pt-32 px-6 pb-20 flex items-center justify-center min-h-[80vh]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-6xl md:text-7xl font-light text-gray-800 mb-4">
              {content.title}
            </h1>
            <div className="h-[1px] w-24 bg-[#4A6B4A] mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* <div className='space-y-4'>
            <input placeholder='Enter your email' />
            <Button>Subscribe</Button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
