
import React from 'react';
import { Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ReviewsSection = () => {
  // Professional testimonial data with more varied sizes
  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Creative Director",
      company: "Studio Design Co.",
      review: "The platform revolutionized our design workflow. The professional tools and sustainable approach perfectly align with our values.",
      rating: 5,
      avatar: "SC",
      gradient: "from-[#344C3D] to-[#2a3d32]",
      size: "large"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Fashion Designer",
      company: "Verde Atelier",
      review: "Outstanding quality and attention to detail. The ethical manufacturing process gives us confidence in every piece we create.",
      rating: 5,
      avatar: "MR",
      gradient: "from-[#974320] to-[#7a3619]",
      size: "small"
    },
    {
      id: 3,
      name: "Emma Thompson",
      role: "Brand Manager",
      company: "Conscious Collective",
      review: "The intuitive interface combined with premium materials makes this our go-to platform for sustainable fashion production.",
      rating: 5,
      avatar: "ET",
      gradient: "from-[#344C3D] to-[#974320]",
      size: "extra-large"
    },
    {
      id: 4,
      name: "David Park",
      role: "Textile Artist",
      company: "Eco Threads",
      review: "Incredible platform that respects both creativity and sustainability. The fabric quality is unmatched in the industry.",
      rating: 5,
      avatar: "DP",
      gradient: "from-[#2a3d32] to-[#344C3D]",
      size: "medium"
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Design Lead",
      company: "Future Fashion",
      review: "Revolutionary approach to fashion design. Love the professional tools and ethical standards that come with every project.",
      rating: 5,
      avatar: "LW",
      gradient: "from-[#974320] to-[#b85c2e]",
      size: "super-large"
    },
    {
      id: 6,
      name: "Alex Turner",
      role: "Creative Consultant",
      company: "Turner Studio",
      review: "Exceptional platform with top-tier materials and seamless workflow. Exactly what modern designers need.",
      rating: 5,
      avatar: "AT",
      gradient: "from-[#344C3D] to-[#2a3d32]",
      size: "tiny"
    }
  ];

  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  // Render stars based on rating
  const renderRating = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "w-5 h-5", 
          i < rating ? "fill-[#B8860B] text-[#B8860B]" : "text-gray-300"
        )}
      />
    ));
  };

  // Get size classes with more varied sizing - mobile responsive
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'super-large':
        return 'w-[280px] sm:w-[400px] md:w-[520px] h-[320px] sm:h-[380px] md:h-[450px]';
      case 'extra-large':
        return 'w-[260px] sm:w-[380px] md:w-[480px] h-[300px] sm:h-[360px] md:h-[420px]';
      case 'large':
        return 'w-[240px] sm:w-[340px] md:w-[420px] h-[280px] sm:h-[340px] md:h-[390px]';
      case 'medium':
        return 'w-[220px] sm:w-[300px] md:w-[360px] h-[260px] sm:h-[320px] md:h-[370px]';
      case 'small':
        return 'w-[200px] sm:w-[260px] md:w-[300px] h-[240px] sm:h-[300px] md:h-[340px]';
      case 'tiny':
        return 'w-[180px] sm:w-[240px] md:w-[280px] h-[220px] sm:h-[280px] md:h-[320px]';
      default:
        return 'w-[220px] sm:w-[300px] md:w-[360px] h-[260px] sm:h-[320px] md:h-[370px]';
    }
  };

  return (
    <section className="bg-white relative overflow-hidden font-inter">
      <div className="w-full px-4 sm:px-8">        
        {/* Continuously moving testimonials with full width and increased spacing */}
        <div className="relative mb-12 sm:mb-20">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6 sm:gap-12 md:gap-16 items-end"
              animate={{
                x: [0, -2400],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 60,
                  ease: "linear",
                },
              }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={`${testimonial.id}-${index}`}
                  className={cn(
                    "flex-shrink-0 relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_16px_50px_rgb(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between",
                    getSizeClasses(testimonial.size)
                  )}
                >
                  {/* Quote icon */}
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-15">
                    <Quote className="w-6 h-6 sm:w-10 sm:h-10 text-[#8B7355]" />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    {/* Rating */}
                    <div className="flex mb-3 sm:mb-6">
                      {renderRating(testimonial.rating)}
                    </div>
                    
                    {/* Review text */}
                    <p className="text-[#2C2C2C] leading-[1.6] sm:leading-[1.7] mb-4 sm:mb-8 font-normal text-sm sm:text-base md:text-lg flex-1 line-clamp-4 sm:line-clamp-none">
                      "{testimonial.review}"
                    </p>
                  </div>
                  
                  {/* Client info - always at bottom */}
                  <div className="border-t border-gray-100 pt-3 sm:pt-6 flex items-center mt-auto">
                    <div 
                      className={cn(
                        "w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white text-sm sm:text-lg font-semibold bg-gradient-to-br mr-3 sm:mr-4",
                        testimonial.gradient
                      )}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#2C2C2C] mb-0.5 sm:mb-1 text-sm sm:text-base">{testimonial.name}</h4>
                      <p className="text-xs sm:text-sm text-[#5A5A5A] font-medium mb-0.5 sm:mb-1">{testimonial.role}</p>
                      <p className="text-xs sm:text-sm text-[#8B7355] font-semibold">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        
        <div className="text-center">
          <Link 
            to="/reviews" 
            className="inline-flex items-center text-[#8B7355] font-semibold text-lg group hover:text-[#6B5A47] transition-colors duration-300"
          >
            Read all testimonials
            <svg className="ml-3 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
