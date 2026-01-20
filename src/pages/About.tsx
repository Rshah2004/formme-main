import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Users, Target, Lightbulb, Leaf, ArrowRight } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To democratize fashion manufacturing by connecting independent designers with ethical manufacturers worldwide."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We leverage AI and cutting-edge technology to streamline the design-to-production workflow."
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description: "Every partnership we forge prioritizes sustainable practices and ethical manufacturing."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a global network of designers and manufacturers who share our vision for fashion's future."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative bg-[#344C3D] text-white pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif mb-4 sm:mb-6">
              About FormMe
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 leading-relaxed">
              We're bridging the gap between creative vision and sustainable manufacturing, 
              empowering designers to bring their ideas to life.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Story Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mb-4 sm:mb-6">
                Our Story
              </h2>
              <div className="space-y-3 sm:space-y-4 text-muted-foreground text-base sm:text-lg">
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
              className="relative order-first lg:order-last"
            >
              <div className="aspect-square bg-gradient-to-br from-[#344C3D] to-[#96421f] rounded-2xl sm:rounded-3xl flex items-center justify-center max-w-sm mx-auto lg:max-w-none">
                <span className="text-6xl sm:text-8xl md:text-9xl font-serif text-white/20">fm</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mb-3 sm:mb-4">
              What We Stand For
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Our core values guide everything we do
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-[#344C3D]/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <value.icon className="w-6 sm:w-7 h-6 sm:h-7 text-[#344C3D]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">{value.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mb-3 sm:mb-4">
              Meet the Team
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Passionate about fashion, technology, and sustainability
            </p>
          </motion.div>
          
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-[#344C3D] to-[#4a6b56] rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl text-white font-serif">FM</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">FormMe Team</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Building the Future</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-[#344C3D]">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-white mb-4 sm:mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-base sm:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join our growing community of designers and be part of something new—help us shape the future of sustainable fashion.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link to="/auth">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-white text-[#344C3D] hover:bg-white/90 rounded-full px-6 sm:px-8"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/">
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10 rounded-full px-6 sm:px-8"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
