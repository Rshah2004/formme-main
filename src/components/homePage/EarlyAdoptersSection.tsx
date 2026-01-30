import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const earlyAdopter = {
  name: '9426',
  tagline: 'conceptual, high-end apparel',
  description: 'An independent fashion brand specializing in',
  fullDescription: ', currently placing real production orders through Formme-connected manufacturing partners.',
  status: 'Active Production Order',
  website: 'https://9426.store',
};

export default function EarlyAdoptersSection() {
  return (
    <section className="py-20 md:py-28 bg-[#FAF9F6]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium tracking-widest text-[#C8956C] uppercase">
            Early Adopters
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-serif font-normal text-foreground italic leading-tight">
            Defining the future,<br />one partner at a time.
          </h2>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
            We're working closely with independent brands who are actively producing through manufacturers connected via Formme.
          </p>
        </motion.div>

        {/* Early Adopter Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100"
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left - Brand Logo Placeholder */}
            <div className="flex justify-center">
              <div className="bg-[#F5F4F0] rounded-2xl p-12 w-full max-w-[300px] aspect-square flex items-center justify-center">
                <span className="text-5xl md:text-6xl font-bold text-muted-foreground/40 tracking-tight">
                  {earlyAdopter.name}
                </span>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-6">
              <h3 className="text-4xl md:text-5xl font-serif font-normal text-[#344C3D]">
                {earlyAdopter.name}
                <span className="block w-12 h-0.5 bg-[#C8956C] mt-2"></span>
              </h3>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {earlyAdopter.description}{' '}
                <span className="text-foreground italic underline decoration-[#C8956C] underline-offset-4">
                  {earlyAdopter.tagline}
                </span>
                {earlyAdopter.fullDescription}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                <a
                  href={earlyAdopter.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-[#344C3D] hover:bg-[#2a3d31] text-white rounded-full px-6 py-5">
                    Visit the Label
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </a>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    STATUS
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C8956C]"></span>
                    <span className="text-sm font-medium text-foreground">
                      {earlyAdopter.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
