
import * as React from "react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { 
  ArrowRight, 
  Brush, 
  Factory, 
  Star,
  Shield,
  Clock,
  Award,
  Users,
  Truck,
  Recycle
} from "lucide-react";
import KeywordMarquee from "./KeywordMarquee";

export default function Features() {
  const featuresRef = useRef<HTMLDivElement>(null);
  
  return (
    <section 
      ref={featuresRef} 
      className="py-16 sm:py-24 relative overflow-hidden font-inter bg-[#344C3D]"
    >
      
      
      
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 sm:mb-24 text-center"
        >
          <span className="inline-block text-xs sm:text-sm font-semibold tracking-wider text-[#FFF7DE] uppercase mb-4 sm:mb-6 bg-gradient-to-r from-white/20 via-white/10 to-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-gradient-to-r from-white/30 to-white/10">
            Connect With Our Manufacturers
          </span>
          
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-light tracking-tight leading-tight mb-6 sm:mb-8 bg-gradient-to-r from-white via-[#FFF7DE] to-white bg-clip-text text-transparent">
            From Vision to <span className="bg-gradient-to-r from-[#FFF7DE] via-[#f5efd3] to-[#e8dc9f] bg-clip-text text-transparent font-medium">Production</span>
          </h2>
          
          <p className="text-base sm:text-xl text-[#FFF7DE]/80 max-w-3xl mx-auto font-light leading-relaxed px-4 sm:px-0">
            We bridge the gap between designers and manufacturers. Share your designs, get matched with the right factory, and bring your garments to life—all in one place.
          </p>
        </motion.div>

        {/* Thin keyword marquee */}
        <div className="mb-12 sm:mb-20">
          <KeywordMarquee speedMs={22000} />
        </div>

        {/* Clean 3-step overview */}
<motion.ol
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
  className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16"
>
  <li className="text-center">
    <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-sm font-medium">
      01
    </div>
    <h4 className="mt-3 sm:mt-4 text-lg sm:text-xl font-medium text-white">Share your vision</h4>
    <p className="mt-1 text-xs sm:text-sm text-white/70 px-4 sm:px-0">
      Upload sketches, references, and requirements—get everything in one place.
    </p>
  </li>

  <li className="text-center">
    <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-sm font-medium">
      02
    </div>
    <h4 className="mt-3 sm:mt-4 text-lg sm:text-xl font-medium text-white">Get matched</h4>
    <p className="mt-1 text-xs sm:text-sm text-white/70 px-4 sm:px-0">
      We connect you with the right manufacturer based on capabilities and MOQ.
    </p>
  </li>

  <li className="text-center">
    <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-sm font-medium">
      03
    </div>
    <h4 className="mt-3 sm:mt-4 text-lg sm:text-xl font-medium text-white">Produce with clarity</h4>
    <p className="mt-1 text-xs sm:text-sm text-white/70 px-4 sm:px-0">
      Centralized communication, revisions, and approvals so nothing gets lost.
    </p>
  </li>
</motion.ol>


        {/* CTA */}
        <div className="text-center">
          <Button
  onClick={() => {
    // replace with your actual route or modal trigger
    window.location.href = "/new-design";
  }}
  className="rounded-xl px-8 py-6 bg-white text-[#344C3D] hover:bg-[#FFF7DE] hover:text-[#344C3D] transition font-medium shadow-lg"
>
  Start Producing
  <ArrowRight className="ml-2 w-4 h-4" />
</Button>

        </div>
      </div>
    </section>
  );
}

// Feature Card Component
const FeatureCard = ({ index, feature }: { index: number; feature: FeatureType }) => {
  const delay = 0.2 + index * 0.2;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md p-10 rounded-2xl border border-gradient-to-br from-white/30 to-white/10 hover:bg-gradient-to-br hover:from-white/20 hover:via-white/15 hover:to-white/10 transition-all duration-300"
    >
      {/* Feature number */}
      <div className="mb-8">
        <span className="inline-block text-5xl font-light bg-gradient-to-br from-[#FFF7DE] to-[#e8dc9f] bg-clip-text text-transparent mb-6">
          {feature.number}
        </span>
        
        {/* Feature icon */}
        <div className={cn(
          "flex items-center justify-center w-16 h-16 rounded-xl mb-6 bg-gradient-to-br from-[#FFF7DE]/30 via-[#FFF7DE]/20 to-transparent"
        )}>
          <feature.icon className="w-8 h-8 text-[#FFF7DE]" />
        </div>
      </div>
      
      {/* Feature title */}
      <h3 className="text-2xl font-medium mb-6 text-white">
        {feature.title}
      </h3>
      
      {/* Decorative line */}
      <div className="w-16 h-px bg-gradient-to-r from-[#FFF7DE] to-transparent mb-6"></div>
      
      {/* Feature description */}
      <p className="text-white/80 leading-relaxed font-light mb-8 text-lg">
        {feature.description}
      </p>
      
      {/* Learn more link */}
      <div className="flex items-center text-[#FFF7DE] hover:text-white transition-colors duration-300 cursor-pointer group">
        <div className="w-10 h-px bg-gradient-to-r from-current to-transparent mr-4 group-hover:from-white group-hover:to-transparent"></div>
        <span className="text-base font-medium">Learn more</span>
      </div>
    </motion.div>
  );
};

// Types
interface FeatureType {
  number: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  bgColor: string;
  iconColor: string;
}

interface BenefitType {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
}

// Feature data
const features: FeatureType[] = [
  {
    number: "01",
    title: "Manufacturer Matching",
    description:
      "Find the right production partner based on what you’re making—capabilities, MOQ, timelines, and quality expectations.",
    icon: Factory,
    bgColor: "bg-[#FFF7DE]/20",
    iconColor: "text-[#FFF7DE]",
  },
  {
    number: "02",
    title: "Clear Communication, End-to-End",
    description:
      "One shared space for specs, questions, and updates—so details don’t get missed across time zones, tools, or language.",
    icon: Users,
    bgColor: "bg-[#FFF7DE]/20",
    iconColor: "text-[#FFF7DE]",
  },
  {
    number: "03",
    title: "Fewer Revisions, Faster Production",
    description:
      "Keep requirements, approvals, and iteration history organized to reduce back-and-forth and move from concept to sample quicker.",
    icon: Clock,
    bgColor: "bg-[#FFF7DE]/20",
    iconColor: "text-[#FFF7DE]",
  },
];


// Benefits data
const benefits: BenefitType[] = [
  {
    icon: Shield,
    title: "Design Ownership",
    description:
      "Your files stay yours—share only what’s needed with the manufacturer you choose.",
  },
  {
    icon: Clock,
    title: "Less Back-and-Forth",
    description:
      "Centralized questions, answers, and decisions to speed up iterations.",
  },
  {
    icon: Award,
    title: "Production-Ready Details",
    description:
      "Keep specs and requirements consistent so manufacturing matches your intent.",
  },
  {
    icon: Users,
    title: "Collaboration Built In",
    description:
      "Bring teammates into the same workflow—design, sourcing, and production.",
  },
  {
    icon: Truck,
    title: "Progress Visibility",
    description:
      "Track what’s been asked, answered, approved, and what’s still pending.",
  },
  {
    icon: Recycle,
    title: "Smarter Sampling",
    description:
      "Reduce waste by avoiding miscommunication that leads to wrong samples.",
  },
];


