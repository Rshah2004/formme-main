import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Factory, MapPin, Package, Clock, ArrowRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Placeholder manufacturer data for preview
const previewManufacturers = [
  {
    id: '1',
    name: 'Textile Innovations',
    location: 'Portugal',
    specialties: ['Cut & Sew', 'Knitwear'],
    moqRange: '200-500',
    leadTime: '4-6 weeks',
    verified: true,
  },
  {
    id: '2',
    name: 'EcoFab Studio',
    location: 'India',
    specialties: ['Organic Cotton', 'Sustainable'],
    moqRange: '100-300',
    leadTime: '6-8 weeks',
    verified: true,
  },
  {
    id: '3',
    name: 'GreenStitch',
    location: 'Turkey',
    specialties: ['Denim', 'Embroidery'],
    moqRange: '300-1000',
    leadTime: '5-7 weeks',
    verified: true,
  },
];

export default function ManufacturersPreviewSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-[#EEEDEA]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium tracking-widest text-[#C8956C] uppercase">
            Trusted Partners
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-serif font-normal text-foreground">
            Meet our manufacturers
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Vetted, sustainable manufacturing partners ready to bring your designs to life.
          </p>
        </motion.div>

        {/* Manufacturer cards grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {previewManufacturers.map((manufacturer, index) => (
            <motion.div
              key={manufacturer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Card className="h-full bg-white border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Factory className="w-6 h-6 text-primary" />
                    </div>
                    {manufacturer.verified && (
                      <Badge className="bg-primary/10 text-primary border-0 gap-1">
                        <Shield className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Name & Location */}
                  <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {manufacturer.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {manufacturer.location}
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {manufacturer.specialties.map((specialty) => (
                      <Badge 
                        key={specialty} 
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>MOQ: {manufacturer.moqRange}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{manufacturer.leadTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Button 
            onClick={() => navigate('/manufacturers')}
            variant="outline"
            className="rounded-full px-8 py-6 text-base border-foreground/20 hover:bg-foreground/5 gap-2 group"
          >
            View all manufacturers
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
