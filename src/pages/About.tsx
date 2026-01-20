import { Link } from 'react-router-dom';
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
                  FormMe was born from a simple observation: talented designers struggle to find 
                  reliable manufacturers who align with their values of quality and sustainability.
                </p>
                <p>
                  Founded in Vancouver, BC, we set out to create a platform that simplifies the 
                  entire journey from design concept to finished product. Our AI-powered tools 
                  help designers create professional tech packs, while our curated network of 
                  manufacturers ensures ethical production.
                </p>
                <p>
                  Today, we're proud to support independent designers and emerging brands 
                  in bringing their creative visions to life—responsibly.
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

      {/* Core Values Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-background">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#344C3D] mb-4">
              Our Core Values
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Every decision we make is guided by a commitment to better manufacturing.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-left"
              >
                <div className="aspect-square mb-6 overflow-hidden rounded-lg">
                  <img 
                    src={value.image} 
                    alt={value.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif text-[#344C3D] mb-3">{value.title}</h3>
                <p className="text-base text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
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
