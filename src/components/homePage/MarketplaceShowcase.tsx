
import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MarketplaceShowcase = () => {
  // Professional clothing items showcase
  const featuredItems = [
    {
      id: 1,
      name: "Premium Cotton Crew",
      category: "T-Shirts",
      price: "$48",
      originalPrice: "$65",
      rating: 4.9,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&crop=center",
      colors: ["#FFFFFF", "#000000", "#8B7355", "#344C3D"],
      isNew: true,
      isBestseller: false
    },
    {
      id: 2,
      name: "Sustainable V-Neck",
      category: "T-Shirts",
      price: "$52",
      originalPrice: null,
      rating: 4.8,
      reviews: 189,
      image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=500&fit=crop&crop=center",
      colors: ["#2C2C2C", "#FFFFFF", "#974320", "#4A6A5C"],
      isNew: false,
      isBestseller: true
    },
    {
      id: 3,
      name: "Organic Long Sleeve",
      category: "Long Sleeves",
      price: "$62",
      originalPrice: "$78",
      rating: 5.0,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=500&fit=crop&crop=center",
      colors: ["#344C3D", "#8B7355", "#2C2C2C", "#FFFFFF"],
      isNew: false,
      isBestseller: false
    },
    {
      id: 4,
      name: "Designer Polo",
      category: "Polo Shirts",
      price: "$68",
      originalPrice: null,
      rating: 4.9,
      reviews: 267,
      image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400&h=500&fit=crop&crop=center",
      colors: ["#FFFFFF", "#344C3D", "#8B7355", "#2C2C2C"],
      isNew: true,
      isBestseller: true
    }
  ];

  // Render stars based on rating
  const renderRating = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4", 
          i < Math.floor(rating) ? "fill-[#B8860B] text-[#B8860B]" : "text-gray-300"
        )}
      />
    ));
  };

  return (
    <section className="py-16 sm:py-32 bg-white relative overflow-hidden font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">        
        <div className="text-center mb-12 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#8B7355] uppercase mb-4 sm:mb-6 bg-[#F5F1E8] px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-[#E5D3B3]">
              Premium Collection
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[1.1] mb-6 sm:mb-8 text-[#2C2C2C]">
              Marketplace <span className="text-[#8B7355] font-normal italic">favorites</span>
            </h2>
            <p className="text-base sm:text-xl text-[#5A5A5A] max-w-3xl mx-auto font-light leading-relaxed px-4 sm:px-0">
              Discover our curated selection of premium garments, designed by professionals and loved by our community.
            </p>
          </motion.div>
        </div>
        
        {/* Featured Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-16">
          {featuredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              {/* Product Image Container */}
              <div className="relative bg-[#F8F6F0] rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6 overflow-hidden aspect-[4/5] group-hover:bg-[#F5F1E8] transition-colors duration-300">
                {/* Badges */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col gap-1 sm:gap-2">
                  {item.isNew && (
                    <span className="bg-[#344C3D] text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      NEW
                    </span>
                  )}
                  {item.isBestseller && (
                    <span className="bg-[#B8860B] text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      BESTSELLER
                    </span>
                  )}
                </div>
                
                {/* Product Image */}
                <div 
                  className="w-full h-full bg-cover bg-center rounded-lg sm:rounded-xl group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url(${item.image})` }}
                ></div>
                
                {/* Color Options - Overlay */}
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.colors.map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Product Info */}
              <div className="space-y-1 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-xs sm:text-sm text-[#8B7355] font-medium">{item.category}</span>
                  <div className="flex items-center gap-0.5">
                    {renderRating(item.rating)}
                    <span className="text-xs text-[#5A5A5A] ml-1 hidden sm:inline">({item.reviews})</span>
                  </div>
                </div>
                
                <h3 className="text-sm sm:text-xl font-medium text-[#2C2C2C] group-hover:text-[#8B7355] transition-colors duration-300 line-clamp-2">
                  {item.name}
                </h3>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-lg font-semibold text-[#2C2C2C]">{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-xs sm:text-sm text-[#8B7355] line-through">{item.originalPrice}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-16"
        >
          <div className="text-center bg-gradient-to-br from-[#F8F6F0] to-[#F5F1E8] rounded-xl sm:rounded-2xl p-6 sm:p-8">
            <h3 className="text-2xl sm:text-4xl font-light text-[#2C2C2C] mb-2 sm:mb-3">500+</h3>
            <p className="text-[#5A5A5A] font-medium text-sm sm:text-base">Premium Designs</p>
            <p className="text-xs sm:text-sm text-[#8B7355] mt-1 sm:mt-2">Curated by professionals</p>
          </div>
          <div className="text-center bg-gradient-to-br from-[#F8F6F0] to-[#F5F1E8] rounded-xl sm:rounded-2xl p-6 sm:p-8">
            <h3 className="text-2xl sm:text-4xl font-light text-[#2C2C2C] mb-2 sm:mb-3">98%</h3>
            <p className="text-[#5A5A5A] font-medium text-sm sm:text-base">Customer Satisfaction</p>
            <p className="text-xs sm:text-sm text-[#8B7355] mt-1 sm:mt-2">Based on 2,500+ reviews</p>
          </div>
          <div className="text-center bg-gradient-to-br from-[#F8F6F0] to-[#F5F1E8] rounded-xl sm:rounded-2xl p-6 sm:p-8">
            <h3 className="text-2xl sm:text-4xl font-light text-[#2C2C2C] mb-2 sm:mb-3">72h</h3>
            <p className="text-[#5A5A5A] font-medium text-sm sm:text-base">Production Time</p>
            <p className="text-xs sm:text-sm text-[#8B7355] mt-1 sm:mt-2">From order to delivery</p>
          </div>
        </motion.div>
        
        {/* CTA Section */}
        <div className="text-center">
          <Link 
            to="/marketplace" 
            className="inline-flex items-center bg-[#344C3D] hover:bg-[#2c4a3c] text-white font-semibold text-lg px-8 py-4 rounded-xl group transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Explore Full Marketplace
            <ArrowRight className="ml-3 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceShowcase;
