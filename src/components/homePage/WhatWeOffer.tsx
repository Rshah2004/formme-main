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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-foreground">
            What We Offer
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to design, produce, and sell custom garments — all in one platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <offer.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-foreground">
                {offer.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
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
