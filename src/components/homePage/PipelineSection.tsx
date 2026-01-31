import { motion } from 'framer-motion';
import { PenTool, TrendingUp, Eye } from 'lucide-react';
import {LayoutDashboard} from "lucide-react"
import {Activity} from "lucide-react"
import {FileText} from "lucide-react"
import {MessageSquare} from "lucide-react"
import {Users} from "lucide-react"
import {Truck} from "lucide-react"
import dashboardMain from "@/assets/dashboard.png";
import techpackPreview from "@/assets/techpack-upload.png";
import kanbanPreview from "@/assets/kanbanPreview.png";
import messagesPreview from "@/assets/messagesPreview.png";
import manfacturerMatching from "@/assets/ManufacturerMatching.png";
import pipelineManagement from "@/assets/pipeline.png";
import { LayoutGrid, Kanban, Sparkles, Factory, GitBranch } from "lucide-react";
const steps = [
  {
    icon: PenTool,
    title: 'Design',
    description: 'Upload your creative vision. Our platform accepts sketches, 3D models, or detailed specifications.',
  },
  {
    icon: TrendingUp,
    title: 'Match',
    description: 'We connect you with verified sustainable manufacturers who specialize in your product category.',
  },
  {
    icon: Eye,
    title: 'Review',
    description: 'Track samples, iterate on prototypes, and approve production-ready designs in real-time.',
  },
  {
    icon: Truck,
    title: 'Deliver',
    description: 'Monitor your production pipeline from factory floor to final delivery, all in one dashboard.',
  },
];
const mainFeatures = [
  {
    icon: LayoutGrid,
    title: "Workspace Dashboard",
    description: "Monitor your entire active portfolio with real-time status updates.",
    image: dashboardMain,
    label: "Workspace Dashboard",
  },
  {
    icon: Kanban,
    title: "Production Kanban",
    description: "Organize manufacturing stages with a structured Kanban view.",
    image: kanbanPreview,
    label: "Production Kanban",
  },
  {
    icon: Sparkles,
    title: "AI Tech Pack Hub",
    description: "Generate and edit tech packs with ease using artificial intelligence.",
    image: techpackPreview,
    label: "AI Tech Pack Hub",
  },
  {
    icon: MessageSquare,
    title: "Collaborative Inbox",
    description: "Manage customer and partner communications in one shared workspace.",
    image: messagesPreview,
    label: "Collaborative Inbox",
  },
      {
    icon: Factory,
    title: "Manufacturer Matching",
    description: "Find verified, export-ready manufacturers for your production needs.",
    image: manfacturerMatching,
    label: "Manufacturer Matching"
  },
  {
    icon: GitBranch,
    title: "Pipeline Management",
    description: "A detailed, multi-step pipeline for every order from start to finish.",
    image: pipelineManagement,
    label: "Pipeline Management"

  },
];

const secondaryFeatures = [

];
export default function PipelineSection() {
  return (
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section header */}
          <motion.div
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.5}}
              className="text-center mb-16"
          >
          <span className="text-sm font-medium tracking-widest text-[#C8956C] uppercase">
            The Pipeline
          </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-serif font-normal text-foreground italic">
              From vision to reality
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process connects creative minds with ethical manufacturing partners.
            </p>
          </motion.div>

          {/* Steps grid */}
          <motion.div
              initial={{opacity: 0, y: 30}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.6, delay: 0.2}}
              className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
                <div key={step.title} className="text-center relative">
                  {/* Icon with circle background */}
                  <div className="flex justify-center mb-5">
                    <div className="w-14 h-14 rounded-full bg-[#F9E8DB] flex items-center justify-center">
                      <step.icon
                          className="w-6 h-6"
                          style={{color: index === 1 || index === 3 ? '#C8956C' : '#344C3D'}}
                          strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-serif italic text-foreground mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
            ))}
          </motion.div>
        </div>
        {/* Product Platform Overview - Strategic Space Usage */}
        <section className="mt-28 py-24 bg-[#F5F4F0] bg-cream">
          <div className="container">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="label-overline">The Platform</span>
              <h2 className="heading-section">
                Streamline Your Production Process
              </h2>
              <p className="text-muted-foreground text-lg">
                FormMe provides a powerful, all-in-one workspace to manage your garment
                production from initial design to final delivery.
              </p>
            </div>

            {/* Main Features Grid - 2x2 with images */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {mainFeatures.map((feature, index) => (
                  <div
                      key={feature.title}
                      className="group bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-hover"
                  >
                    {/* Image Preview */}
                    <div className="relative h-48 md:h-56 bg-secondary/30 overflow-hidden">
                      <img
                          src={feature.image}
                          alt={feature.label}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"/>
                      <span
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground italic font-serif">
                  {feature.label}
                </span>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div
                          className="w-11 h-11 rounded-xl bg-sage-light flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                        <feature.icon
                            className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors"/>
                      </div>
                      <h3 className="text-xl font-serif font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
              ))}
            </div>

            {/* Secondary Features - Simple cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {secondaryFeatures.map((feature) => (
                  <div
                      key={feature.title}
                      className="group bg-card rounded-3xl p-6 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-hover flex items-start gap-5"
                  >
                    <div
                        className="w-11 h-11 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                      <feature.icon
                          className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors"/>
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </section>
      </section>
  );
}

// function FeatureCard({title, description, icon: Icon, image, small}: {
//   title: string,
//   description: string,
//   icon: any,
//   image?: string,
//   small?: boolean
// }) {
//   return (
//       <div
//           className={`bg-[#FAF9F6] border border-border/40 rounded-[24px] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group`}>
//         {image && (
//             <div className={`overflow-hidden border-b border-border/40 bg-white aspect-video`}>
//               <img src={image} alt={title}
//                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"/>
//             </div>
//         )}
//         <div className={`${small ? 'p-6' : 'p-8'} space-y-4`}>
//           <div
//               className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-colors border border-border/10">
//             <Icon className="w-5 h-5"/>
//           </div>
//           <div className="space-y-1">
//             <h3 className="text-xl font-serif font-bold text-primary italic">{title}</h3>
//             <p className="text-muted-foreground leading-relaxed text-xs">
//               {description}
//             </p>
//           </div>
//         </div>
//       </div>
//   );
// }