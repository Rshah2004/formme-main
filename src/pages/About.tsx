import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

// Import images
import heroBg from '@/assets/about-hero-bg.jpg';
import designerImage from '@/assets/about-designer.jpg';
import valueSustainability from '@/assets/value-sustainability.jpg';
import valueQuality from '@/assets/value-quality.jpg';
import valueEthical from '@/assets/value-ethical.jpg';

const About = () => {
  const values = [
    {
      image: valueSustainability,
      title: "Sustainability First",
      description: "We prioritize materials and processes that respect our planet."
    },
    {
      image: valueQuality,
      title: "Uncompromising Quality",
      description: "Excellence in craftsmanship is non-negotiable for our partners."
    },
    {
      image: valueEthical,
      title: "Ethical Production",
      description: "Fair wages and safe working conditions are the baseline."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About"
        canonical="/about"
        description="Learn how formme was built to help independent fashion brands find and work with reliable clothing manufacturers — from first sketch to final delivery."
      />
      <NavBar />
      
      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-white mb-4 sm:mb-6">
              About FormMe
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              We're bridging the gap between creative vision and sustainable manufacturing, empowering designers to bring their ideas to life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-[#FAF9F6]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#344C3D] mb-6 sm:mb-8">
                Our Story
              </h2>
              <div className="space-y-4 sm:space-y-6 text-muted-foreground text-base sm:text-lg leading-relaxed">
                <p>
                  Formme is a fashion-tech platform built to reduce friction between designers and 
                  manufacturers by streamlining tech packs, feasibility checks, and production workflows.
                </p>
                <p>
                  The platform is being developed in close collaboration with manufacturers and 
                  designers to reflect real production constraints.
                </p>
                <p>
                  Founded in Vancouver, BC, Formme is part of the <strong>Innovation UBC Venture Founder</strong> program. 
                  We're committed to simplifying the journey from design concept to finished product, 
                  with AI-powered tools and a curated network of ethical manufacturers.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <img 
                src={designerImage} 
                alt="Fashion designer working with fabric samples" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Shop All Collections Section - Based on reference image */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Two Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex gap-4 sm:gap-6"
            >
              {/* Card 1 - Sustainability */}
              <div className="flex-1 relative rounded-xl overflow-hidden aspect-[3/4]">
                <img 
                  src={valueSustainability} 
                  alt="Sustainable fashion" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a365d]/90 via-[#1a365d]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h4 className="text-xs uppercase tracking-wider mb-2 font-medium">SUSTAINABILITY</h4>
                  <p className="text-sm opacity-90 leading-relaxed">
                    We prioritize eco-friendly materials and ethical manufacturing processes to create fashion that respects our planet.
                  </p>
                  <button className="mt-4 text-sm underline underline-offset-4 hover:no-underline">
                    Learn more
                  </button>
                </div>
              </div>
              
              {/* Card 2 - Quality */}
              <div className="flex-1 relative rounded-xl overflow-hidden aspect-[3/4]">
                <img 
                  src={valueQuality} 
                  alt="Quality craftsmanship" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a365d]/90 via-[#1a365d]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h4 className="text-xs uppercase tracking-wider mb-2 font-medium">QUALITY</h4>
                  <p className="text-sm opacity-90 leading-relaxed">
                    Excellence in craftsmanship is at the heart of everything we do. Every stitch, every detail matters.
                  </p>
                  <button className="mt-4 text-sm underline underline-offset-4 hover:no-underline">
                    Learn more
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* Right Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-right"
            >
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Our</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#344C3D] mb-6">
                Core Values
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md ml-auto">
                Every decision we make is guided by a commitment to better manufacturing, sustainable practices, and ethical production.
              </p>
              <div className="border-t border-[#344C3D] pt-6 max-w-md ml-auto">
                <Link to="/workflow">
                  <Button 
                    variant="outline" 
                    className="border-[#344C3D] text-[#344C3D] hover:bg-[#344C3D] hover:text-white rounded-none px-8"
                  >
                    Explore more
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ethical Production Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-background">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="aspect-video mb-8 overflow-hidden rounded-lg">
              <img 
                src={valueEthical} 
                alt="Ethical production"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#344C3D] mb-4">Ethical Production</h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Fair wages and safe working conditions are the baseline. We partner only with manufacturers who share our commitment to treating workers with dignity and respect.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Terracotta/Warm Brown */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-[#B58C6A]">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4 sm:mb-6">
              Ready to create?
            </h2>
            <p className="text-base sm:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join our growing community of designers building the future of fashion with FormMe.
            </p>
            <Link to="/auth">
              <Button 
                size="lg"
                className="bg-white text-[#B58C6A] hover:bg-white/90 rounded-full px-8 sm:px-12 py-6 text-base sm:text-lg font-medium"
              >
                Start Your Journey
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
