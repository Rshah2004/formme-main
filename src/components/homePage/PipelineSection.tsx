import { motion } from 'framer-motion';
import { PenTool, TrendingUp, Eye, Truck } from 'lucide-react';

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
    <section className="py-24 bg-[#FAF9F6]">
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
          <h2 className="mt-4 text-4xl md:text-5xl font-serif font-normal text-foreground">
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
            <div key={step.title} className="text-center">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <step.icon 
                  className="w-8 h-8" 
                  style={{ color: index === 1 || index === 3 ? '#C8956C' : '#344C3D' }}
                  strokeWidth={1.5}
                />
              </div>
              
              {/* Connector line (except last) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-border" />
              )}
              
              {/* Title */}
              <h3 className="text-lg font-medium text-foreground mb-2">
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
    </section>
  );
}
