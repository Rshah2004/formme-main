import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Factory, Truck, Leaf, Users, Sparkles } from 'lucide-react';

const offers = [
  {
    icon: Palette,
    title: 'Custom Design Tools',
    description: 'Professional-grade design studio to bring your creative vision to life with intuitive controls.',
  },
  {
    icon: Factory,
    title: 'Manufacturer Matching',
    description: 'Connect with vetted manufacturers worldwide who specialize in sustainable production.',
  },
  {
    icon: Truck,
    title: 'End-to-End Production',
    description: 'From concept to delivery, we handle the entire production workflow seamlessly.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Focus',
    description: 'Partner with eco-conscious manufacturers committed to ethical production practices.',
  },
  {
    icon: Users,
    title: 'Community Marketplace',
    description: 'Showcase and sell your designs in our curated marketplace of unique creations.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Tech Packs',
    description: 'Generate professional tech packs automatically with our intelligent design system.',
  },
];

const WhatWeOffer: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-3 sm:mb-4 text-foreground">
            What We Offer
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
            Everything you need to design, produce, and sell custom garments — all in one platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors">
                <offer.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-foreground">
                {offer.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {offer.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeOffer;
