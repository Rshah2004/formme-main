import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Leaf, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";


export default function StatsAndCTA() {
  const navigate = useNavigate();

  return (
    <>
      {/*/!* Stats bar *!/*/}
      {/*<section className="bg-[#344C3D] py-16">*/}
      {/*  <div className="max-w-6xl mx-auto px-6">*/}
      {/*    <motion.div*/}
      {/*      initial={{ opacity: 0, y: 20 }}*/}
      {/*      whileInView={{ opacity: 1, y: 0 }}*/}
      {/*      viewport={{ once: true }}*/}
      {/*      transition={{ duration: 0.5 }}*/}
      {/*      className="grid grid-cols-2 md:grid-cols-4 gap-8"*/}
      {/*    >*/}
      {/*      {stats.map((stat, index) => (*/}
      {/*        <motion.div*/}
      {/*          key={stat.label}*/}
      {/*          initial={{ opacity: 0, y: 20 }}*/}
      {/*          whileInView={{ opacity: 1, y: 0 }}*/}
      {/*          viewport={{ once: true }}*/}
      {/*          transition={{ duration: 0.5, delay: 0.1 * index }}*/}
      {/*          className="text-center"*/}
      {/*        >*/}
      {/*          <stat.icon className="w-6 h-6 mx-auto mb-3 text-white/80" strokeWidth={1.5} />*/}
      {/*          <div className="text-4xl md:text-5xl font-serif text-white mb-1">*/}
      {/*            {stat.value}*/}
      {/*          </div>*/}
      {/*          <div className="text-sm text-white/70">*/}
      {/*            {stat.label}*/}
      {/*          </div>*/}
      {/*        </motion.div>*/}
      {/*      ))}*/}
      {/*    </motion.div>*/}
      {/*  </div>*/}
      {/*</section>*/}

      {/* Ready to create CTA */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-normal text-foreground mb-4">
              Ready to create?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join our waitlist now for early access to Formme and we'll help you bring your next vision to life.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
  <a
    href="https://docs.google.com/forms/d/e/1FAIpQLScV3VYQ9HgNmI4IYHwFgt2ALaeXy9iSLmB6PYtd2Z-1YWhUpg/viewform?usp=header"
    target="_blank"
    rel="noopener noreferrer"
  >
    <button className="w-full px-10 py-4 text-base font-semibold text-primary-foreground bg-primary shadow-sm cursor-pointer border-none rounded-full hover:bg-primary/90 transition-all duration-200">
      Join Waitlist
    </button>
  </a>
              {/* <Button
                  onClick={async () => {
                    const {data: {session}} = await supabase.auth.getSession();
                    if (session) {
                      navigate("/dashboard");
                    } else {
                      navigate("/auth");
                    }
                  }}
                className="bg-[#344C3D] hover:bg-[#2a3d31] text-white rounded-full px-8 py-6 text-base"
              >
                Get started free
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowBookDemo(true)}
                className="rounded-full px-8 py-6 text-base border-foreground/20 hover:bg-foreground/5"
              >
                Book a demo
              </Button> */}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
