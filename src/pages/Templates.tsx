
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
import PipelineSection from "../components/homePage/PipelineSection";
import WhatYouCanCreate from "../components/homePage/WhatYouCanCreate";
import EarlyAdoptersSection from "../components/homePage/EarlyAdoptersSection";
import StatsAndCTA from "../components/homePage/StatsAndCTA";
import Footer from '@/components/Footer';
import Features from '@/components/homePage/Features';

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
        <CraftsmanshipSection />
        <PipelineSection />
        <WhatYouCanCreate />
        <section className="-mt-6 sm:-mt-8 pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-20 md:pb-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center mb-6 sm:mb-8">
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest text-[#C8956C]">Manufacturing Network</p>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-normal text-[#344C3D] mt-3">
                  Production strength, without direct factory contact
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl">
                  We protect the relationship while still showing capability—so you can assess fit without reaching suppliers directly.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Verified compliance", "MOQ‑friendly", "Sampling first", "Global logistics"].map((chip) => (
                    <span key={chip} className="px-3 py-1 rounded-full bg-[#F2EDE6] text-[#344C3D] text-xs font-medium">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-[#FAF7F4] via-white to-[#FAF7F4] p-6 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-[#C8956C]">Network Snapshot</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {[
                    { label: "Manufacturers", value: "7+ on board" },
                    { label: "Annual Capacity", value: "50M+ units" },
                    { label: "Average MOQ", value: "30–150" },
                    { label: "Lead Time", value: "3–6 weeks" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border/30 bg-white p-4">
                      <p className="text-[10px] uppercase tracking-widest text-[#C8956C]">{stat.label}</p>
                      <p className="text-lg font-semibold text-[#344C3D] mt-2">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-[#344C3D]">
                  Factories in our network have produced for brands such as Old Navy, US Polo, Fanatics, Jack &amp; Jones, and Bestseller.
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Factory identities and contact details are protected to ensure procurement stays inside Formme.
                </p>
              </div>
            </div>

            <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-[#E7E1D7] to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border/30 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#344C3D]">Categories Produced</h3>
                  <span className="text-xs uppercase tracking-widest text-[#C8956C]">Coverage</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Core categories our network is already equipped to produce.
                </p>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["Cut & sew", "Knits", "Athleisure", "Intimates", "Outerwear", "Denim"].map((item) => (
                    <div key={item} className="rounded-xl border border-border/30 bg-[#FAF7F4] px-3 py-2 text-xs font-medium text-[#344C3D]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/30 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#344C3D]">Capabilities</h3>
                  <span className="text-xs uppercase tracking-widest text-[#C8956C]">Operations</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  End‑to‑end support from sampling to compliance.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {["Tech pack review", "Sampling", "Grading", "Embroidery & print", "QC checkpoints", "Compliance"].map((item) => (
                    <div key={item} className="rounded-xl border border-border/30 bg-[#FAF7F4] px-3 py-2 text-xs font-medium text-[#344C3D]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <EarlyAdoptersSection />
        <StatsAndCTA />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
