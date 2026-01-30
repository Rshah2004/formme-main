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

export default function PipelineSection() {
  return (
    <section className="py-24 bg-[#F5F4F0]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <div key={step.title} className="text-center relative">
              {/* Icon with circle background */}
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-[#F9E8DB] flex items-center justify-center">
                  <step.icon 
                    className="w-6 h-6" 
                    style={{ color: index === 1 || index === 3 ? '#C8956C' : '#344C3D' }}
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
        <section className="py-32">
          <div className="container mx-auto px-6">
            <div className="bg-white rounded-[64px] p-12 md:p-24 shadow-sm border border-border/10">
              <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <span className="text-sm font-medium tracking-widest text-[#C8956C] uppercase"> The Platform</span>
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-primary italic leading-tight">
                  Streamline Your <br /> Production Process
                </h2>
                <p className="text-xl text-muted-foreground font-light leading-relaxed">
                  FormMe provides a powerful, all-in-one workspace to manage your garment production from initial design to final delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                <FeatureCard
                  title="Workspace Dashboard"
                  description="Monitor your entire active portfolio with real-time status updates and automated pipeline visualization."
                  icon={LayoutDashboard}
                  image={dashboardMain}
                  large
                />
                <FeatureCard
                  title="Production Kanban"
                  description="Organize manufacturing stages with a structured Kanban view, ensuring every piece stays on track."
                  icon={Activity}
                  image={kanbanPreview}
                  large
                />
                <FeatureCard
                  title="AI Tech Pack Hub"
                  description="Generate and store digital tech packs that are instantly accessible to your manufacturing partners."
                  icon={FileText}
                  image={techpackPreview}
                  large
                />
                <FeatureCard
                  title="Collaborative Inbox"
                  description="Communicate directly with manufacturers in a dedicated messaging system for instant feedback."
                  icon={MessageSquare}
                  image={messagesPreview}
                  large
                />

                <FeatureCard
                  title="Manufacturer Matching"
                  description="Find and connect with verified, export-ready manufacturers specifically vetted for your product category."
                  icon={Users}
                  image={manfacturerMatching}
                  large
                />
                <FeatureCard
                  title="Pipeline Management"
                  description="A detailed, multi-step pipeline for every order, managing sampling, QC, and logistics in one place."
                  icon={Truck}
                  image={pipelineManagement}
                  large
                />
              </div>
            </div>
          </div>
        </section>
    </section>
  );
}
function FeatureCard({ title, description, icon: Icon, image, large }: { title: string, description: string, icon: any, image?: string, large?: boolean }) {
  return (
    <div className={`bg-[#FAF9F6] border border-border/40 rounded-[32px] overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group ${large ? 'md:col-span-1' : ''}`}>
      {image && (
        <div className={`overflow-hidden border-b border-border/40 bg-white ${large ? 'aspect-[16/8]' : 'aspect-video'}`}>
          <img src={image} alt={title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
        </div>
      )}
      <div className="p-10 space-y-6">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-colors border border-border/10">
          <Icon className="w-7 h-7" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-serif font-bold text-primary italic">{title}</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

