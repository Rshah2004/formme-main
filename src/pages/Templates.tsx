
// import { useState } from "react";
// import Navbar from "@/components/Navbar";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { templateCategories } from "@/data/templateData";
// import { useNavigate } from "react-router-dom";
// import TshirtSVG from '@/assets/tshirt.svg?react';

// const Templates = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen flex flex-col bg-white">
//       <Navbar />
      
//       <div className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
//         <div className="flex flex-col items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800">
//             Design Templates
//           </h1>
//           <p className="text-gray-600 mt-2 max-w-lg text-center">
//             Choose a template to start designing
//           </p>
//         </div>
        
//         <div className="flex justify-center mb-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
//             <div 
//               className="p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-100 cursor-pointer"
//               onClick={() => navigate("/simple")}
//             >
//               <h2 className="text-xl font-semibold mb-2">Simple Designer</h2>
//               <p className="text-gray-600 mb-4">
//                 Choose from our pre-made garments and customize colors and fabrics.
//               </p>
//               <Button>Start Simple Design</Button>
//             </div>
            
//             <div 
//               className="p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-100 opacity-60 cursor-not-allowed"
//             >
//               <h2 className="text-xl font-semibold mb-2">Advanced Designer</h2>
//               <p className="text-gray-600 mb-4">
//                 For professionals. Complete creative freedom with our full suite of design tools.
//               </p>
//               <Button disabled>Coming Soon</Button>
//             </div>
//           </div>
//         </div>
        
//         <Tabs defaultValue="tshirts" className="w-full">
//           <div className="flex justify-center">
//             <TabsList className="mb-6">
//               <TabsTrigger value="tshirts" className="px-4">T-Shirts</TabsTrigger>
//               <TabsTrigger value="hoodies" className="px-4">Hoodies</TabsTrigger>
//               <TabsTrigger value="pants" className="px-4">Pants</TabsTrigger>
//               <TabsTrigger value="shorts" className="px-4">Shorts</TabsTrigger>
//             </TabsList>
//           </div>
          
//           <TabsContent value="tshirts">
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {templateCategories.tshirts.map((item) => (
//                 <div 
//                   key={item.id}
//                   className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group cursor-pointer"
//                   onClick={() => navigate("/simple")}
//                 >
//                   <div className="aspect-square bg-gray-100 relative overflow-hidden">
//                     <div className="w-full h-full flex items-center justify-center">
//                     <TshirtSVG width={200} height={200} />
//                     </div>
                    
//                     <Button 
//                       className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white text-gray-900 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
//                       size="sm"
//                     >
//                       Use This Template
//                     </Button>
//                   </div>
                  
//                   <div className="p-3">
//                     <h3 className="font-medium text-gray-900">{item.name}</h3>
//                     <div className="flex items-center justify-between mt-1">
//                       <span className="text-sm text-gray-500">{item.creator}</span>
//                       {item.price ? (
//                         <span className="font-medium">${item.price}</span>
//                       ) : (
//                         <span className="text-sm text-green-600 font-medium">Free</span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </TabsContent>
          
//           <TabsContent value="hoodies">
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {/* Placeholder for hoodie templates */}
//               {[1, 2, 3, 4].map((item) => (
//                 <div 
//                   key={`hoodie-${item}`}
//                   className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group cursor-pointer"
//                   onClick={() => navigate("/simple")}
//                 >
//                   <div className="aspect-square bg-gray-100 relative overflow-hidden">
//                     <div className="w-full h-full flex items-center justify-center">
//                       <svg width="65%" height="65%" viewBox="0 0 300 400" fill={["#4ECDC4", "#FFD166", "#FF6B6B", "#6B8096"][item-1]} stroke="#333" strokeWidth="1.5">
//                         <path d="M100,40 C100,40 125,20 150,20 C175,20 200,40 200,40 L240,90 L220,130 C220,130 200,120 200,160 
//                                 L200,350 L100,350 L100,160 C100,120 80,130 80,130 L60,90 Z" />
//                         <path d="M125,20 C125,20 150,5 175,20" fill="none" stroke="#333" strokeWidth="2" />
//                         <ellipse cx="150" cy="15" rx="30" ry="10" fill={["#4ECDC4", "#FFD166", "#FF6B6B", "#6B8096"][item-1]} stroke="#333" />
//                       </svg>
//                     </div>
                    
//                     <Button 
//                       className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white text-gray-900 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
//                       size="sm"
//                     >
//                       Use This Template
//                     </Button>
//                   </div>
                  
//                   <div className="p-3">
//                     <h3 className="font-medium text-gray-900">Hoodie Style {item}</h3>
//                     <div className="flex items-center justify-between mt-1">
//                       <span className="text-sm text-gray-500">Forme Studio</span>
//                       <span className="text-sm text-green-600 font-medium">Free</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </TabsContent>
          
//           <TabsContent value="pants">
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {/* Placeholder for pants templates */}
//               {[1, 2, 3, 4].map((item) => (
//                 <div 
//                   key={`pants-${item}`}
//                   className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group cursor-pointer"
//                   onClick={() => navigate("/simple")}
//                 >
//                   <div className="aspect-square bg-gray-100 relative overflow-hidden">
//                     <div className="w-full h-full flex items-center justify-center">
//                       <svg width="45%" height="65%" viewBox="0 0 300 400" fill={["#F4A261", "#2A9D8F", "#E9C46A", "#264653"][item-1]} stroke="#333" strokeWidth="1.5">
//                         <path d="M120,50 L100,350 L140,350 L150,80 L160,350 L200,350 L180,50 Z" />
//                       </svg>
//                     </div>
                    
//                     <Button 
//                       className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white text-gray-900 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
//                       size="sm"
//                     >
//                       Use This Template
//                     </Button>
//                   </div>
                  
//                   <div className="p-3">
//                     <h3 className="font-medium text-gray-900">Pants Style {item}</h3>
//                     <div className="flex items-center justify-between mt-1">
//                       <span className="text-sm text-gray-500">Forme Studio</span>
//                       <span className="text-sm text-green-600 font-medium">Free</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </TabsContent>
          
//           <TabsContent value="shorts">
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {/* Placeholder for shorts templates */}
//               {[1, 2, 3, 4].map((item) => (
//                 <div 
//                   key={`shorts-${item}`}
//                   className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group cursor-pointer"
//                   onClick={() => navigate("/simple")}
//                 >
//                   <div className="aspect-square bg-gray-100 relative overflow-hidden">
//                     <div className="w-full h-full flex items-center justify-center">
//                       <svg width="45%" height="65%" viewBox="0 0 300 400" fill={["#FF6B6B", "#4ECDC4", "#FFD166", "#6B8096"][item-1]} stroke="#333" strokeWidth="1.5">
//                         <path d="M120,50 L115,150 L140,150 L150,80 L160,150 L185,150 L180,50 Z" />
//                       </svg>
//                     </div>
                    
//                     <Button 
//                       className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white text-gray-900 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
//                       size="sm"
//                     >
//                       Use This Template
//                     </Button>
//                   </div>
                  
//                   <div className="p-3">
//                     <h3 className="font-medium text-gray-900">Shorts Style {item}</h3>
//                     <div className="flex items-center justify-between mt-1">
//                       <span className="text-sm text-gray-500">Forme Studio</span>
//                       <span className="text-sm text-green-600 font-medium">Free</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
      
//       <footer className="w-full py-6 bg-white border-t mt-auto">
//         <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
//           <p>© 2023 Forme Design Studio. All rights reserved.</p>
//           <div className="flex space-x-6 mt-4 sm:mt-0">
//             <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
//             <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
//             <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Templates;

"use client";

import * as React from "react";
import NavBar from "../components/Navbar";
import HeroSection from "../components/homePage/HeroSection";
import CraftsmanshipSection from "../components/homePage/CraftsmanshipSection";
import Features from "../components/homePage/Features";
import backgroundVideo from "/backgroundVideo.mp4"; // adjust based on actual file path
import ReviewsSection from '@/components/homePage/ReviewsSection';
import MarketplaceShowcase from '@/components/homePage/MarketplaceShowcase';
import Footer from '@/components/Footer';
const HomePage = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Video with Blur */}
      <video
        className="absolute top-0 left-[150px] w-[1296px] h-[832px] object-cover z-[-1] blur-[30px] bg-[rgba(217,217,217,0)]"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/backgroundVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-[rgba(217,217,217,0.2)] backdrop-blur-[30px] z-[-1]" />
      <NavBar />
      <main className="flex-grow"> 
        <HeroSection />
        {/* <CraftsmanshipSection /> */}
        <Features />
        {/* <MarketplaceShowcase />
        <ReviewsSection /> */}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
