import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

const categories = [
  {
    title: 'Sustainable Outerwear',
    subtitle: 'Coats, jackets & blazers',
    image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&h=600&fit=crop',
  },
  {
    title: 'Everyday Essentials',
    subtitle: 'Dresses, tops & basics',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=600&fit=crop',
  },
  {
    title: 'Premium Knitwear',
    subtitle: 'Sweaters & cardigans',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=600&fit=crop',
  },
  {
    title: 'Tailored Bottoms',
    subtitle: 'Trousers, skirts & shorts',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=600&fit=crop',
  },
];

export default function WhatYouCanCreate() {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-start md:justify-between mb-12"
        >
          <div className="max-w-xl">
            <span className="text-sm font-medium tracking-widest text-[#C8956C] uppercase">
              Just Launched
            </span>
            <h2 className="mt-3 text-4xl md:text-5xl font-serif font-normal text-foreground italic">
              What you can create
            </h2>
            <p className="mt-4 text-muted-foreground">
              Be among the first designers to bring your vision to life with our sustainable manufacturing partners.
            </p>
          </div>
          
          <Button 
            onClick={async () => {
              const { data: { session } } = await supabase.auth.getSession();
              navigate(session ? "/dashboard" : "/auth");
            }}
            className="mt-6 md:mt-0 bg-[#344C3D] hover:bg-[#2a3d31] text-white rounded-full px-6 py-5"
          >
            Start designing
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        {/* Categories grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="group cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Text */}
              <h3 className="text-lg font-medium text-foreground">
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.subtitle}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
