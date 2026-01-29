import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, CheckCircle2, RotateCcw, MapPin, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// All manufacturers data (including primary)
const allManufacturers = [
  {
    id: 'supreme',
    name: 'Supreme Stitch',
    brandName: 'SUPREME GROUP',
    country: 'Bangladesh',
    specialization: 'Premium garment manufacturing',
    description: 'Supreme Stitch (Supreme Group) is a contracted garment manufacturer on Formme, delivering high-quality garments for global leaders including',
    clients: ['Champion', 'Costco', 'Hanes', 'Fanatics'],
    metrics: [
      { value: '$70M+', label: 'ANNUAL REVENUE' },
      { value: '3,000+', label: 'SKILLED WORKERS' },
      { value: '60,000+', label: 'DAILY PRODUCTION' },
      { value: '16+', label: 'YEARS EXPERIENCE' },
    ],
    capabilities: [
      { icon: Globe, text: 'Export-ready for UK, Europe, USA, and Canada' },
      { icon: Users, text: 'Supporting international apparel brands' },
      { icon: CheckCircle2, text: 'Structured QC across sampling & bulk' },
      { icon: RotateCcw, text: 'Repeat & long-term manufacturing orders' },
    ],
    status: 'Verified Partner',
    isPrimary: true,
    externalUrl: 'https://supremegroupbd.com/supremestitch/',
  },
  {
    id: 'rose',
    name: 'Rose Intimates',
    brandName: 'ROSE INTIMATES',
    country: 'Bangladesh',
    specialization: 'Intimates & lingerie',
    description: 'Rose Intimates is a leading manufacturer specializing in high-quality intimate apparel and lingerie, serving international brands with premium craftsmanship.',
    clients: ["Jack & Jones", "max", "PRIMARK", "BESTSELLER", "Carrefour", "Lee Cooper", "Reliance trends"],
    metrics: [
      { value: '1000+', label: 'SKILLED WORKERS' },
      { value: '2.8M', label: 'MONTH PRODUCTION' },
      { value: '11+', label: 'YEARS EXPERIENCE' },
    ],
    capabilities: [
      { icon: Globe, text: 'Export-ready for global markets' },
      { icon: CheckCircle2, text: 'Specialized in intimate apparel' },
      {icon: CheckCircle2, text: 'Bra, Panty, Brief, Boxer, Trunk, Swimwear,T-Shirt'}
    ],
    status: 'Verified Partner',
    isPrimary: false,
    externalUrl: 'http://roseintimates.com/',
  },
{
  id: 'ratool',
  name: 'Ratool Apparels Ltd',
  brandName: 'RATOOL APPARELS',
  country: 'Bangladesh',
  specialization: 'Knit garments & apparel manufacturing',
  description:
    'Ratool Apparels Ltd is a large-scale knit garment manufacturer based in Bangladesh, serving international retailers across North America, Europe, and Australia with certified, export-ready production.',
  clients: [
    'Walmart',
    'Costco',
    'Aldi',
    'Lidl',
    'Next',
    'Kappa',
    'Decimas',
    'Regatta',
  ],
  metrics: [
    { value: '500+', label: 'SEWING MACHINES' },
    { value: '1M', label: 'PRODUCTION CAPACITY PER MONTH' },
    { value: '2011', label: 'FOUNDED' },
  ],
  capabilities: [
    { icon: Globe, text: 'Export-ready for USA, Canada, Europe & Australia' },
    { icon: CheckCircle2, text: 'Certified factory (WRAP, Oeko-Tex, Accord)' },
    { icon: CheckCircle2, text: 'High-volume knitwear production' },
  ],
  status: 'Verified Partner',
  isPrimary: false,
  externalUrl: 'https://ratoolapparels.com',
},
    {
  id: 'navex',
  name: 'Navex Impex',
  brandName: 'NAVEX IMPEX',
  country: 'Pakistan',
  specialization: 'Custom sportswear & activewear',
  description:
    'Small-scale manufacturer specializing in made-to-order sportswear with flexible MOQs and full customization support.',
  clients: [],
  metrics: [
  ],
  capabilities: [
    { icon: CheckCircle2, text: 'Low-MOQ & sample-first production' },
    { icon: CheckCircle2, text: 'Custom sportswear & teamwear' },
    { icon: CheckCircle2, text: 'Cut & sew with printing support' },
  ],
  status: 'Private Network',
  isPrimary: false,
  externalUrl: null,
},

];
export default function ManufacturerShowcase() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const currentManufacturer = allManufacturers[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allManufacturers.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allManufacturers.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-20 md:py-28 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Manufacturer Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Navigation Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-4 md:-ml-8 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full w-10 h-10 bg-white/80 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-4 md:-mr-8 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full w-10 h-10 bg-white/80 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Manufacturer Card */}
          <div 
            ref={sliderRef}
            className="bg-[#FEFDFB] rounded-3xl p-8 md:p-12 shadow-sm border border-border/30 overflow-hidden"
          >
            <motion.div
              key={currentManufacturer.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
                {/* Left Content */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Label */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tracking-widest text-[#C8956C] uppercase">
                      {currentManufacturer.isPrimary ? 'Strategic Partner' : 'Manufacturing Partner'}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-xs font-normal ${
                        currentManufacturer.status === 'Verified Partner'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {currentManufacturer.status}
                    </Badge>
                  </div>

                  {/* Headline */}
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-normal text-foreground leading-tight italic">
                    {currentManufacturer.isPrimary 
                      ? <>Our primary manufacturing<br />partner on Formme</>
                      : <>{currentManufacturer.name}</>
                    }
                  </h2>

                  {/* Country */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{currentManufacturer.country}</span>
                    <span className="mx-2">•</span>
                    <span>{currentManufacturer.specialization}</span>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                    {currentManufacturer.description}
                    {currentManufacturer.clients.length > 0 && (
                      <>
                        {' '}
                        <span className="font-semibold text-foreground">
                          {currentManufacturer.clients.join(', ')}.
                        </span>
                      </>
                    )}
                  </p>

                  {/* Metrics Row */}
                  {currentManufacturer.metrics.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4">
                      {currentManufacturer.metrics.map((metric, index) => (
                        <div key={index} className="text-center md:text-left">
                          <div className="text-2xl md:text-3xl font-serif font-medium text-foreground">
                            {metric.value}
                          </div>
                          <div className="text-[10px] md:text-xs tracking-widest text-muted-foreground mt-1 uppercase">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Capability Badges */}
                  {currentManufacturer.capabilities.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentManufacturer.capabilities.map((capability, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-[#FAF9F6] rounded-lg px-4 py-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <capability.icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-xs md:text-sm font-medium text-foreground uppercase tracking-wide">
                            {capability.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trust Note */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-[#C8956C]"></span>
                    <span>Trusted partner — contract in place for designer–manufacturer collaboration.</span>
                  </div>

                  {/* CTA */}
                  {currentManufacturer.externalUrl ? (
                    <a
                      href={currentManufacturer.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="rounded-full px-6 py-5 text-sm border-foreground/20 hover:bg-foreground/5"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Explore manufacturing partner
                      </Button>
                    </a>
                  ) : (
                    <Button
                      variant="outline"
                      className="rounded-full px-6 py-5 text-sm border-foreground/20 hover:bg-foreground/5"
                      onClick={() => navigate('/coming-soon')}
                    >
                      Request match
                    </Button>
                  )}
                </div>

                {/* Right Side - Brand Logo */}
                <div className="lg:col-span-2 flex items-center justify-center">
                  <div className="bg-[#FAF9F6] rounded-3xl p-10 md:p-16 w-full h-full min-h-[300px] flex flex-col items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="text-3xl md:text-4xl font-bold tracking-tight text-muted-foreground/60">
                        {currentManufacturer.brandName.split(' ')[0]}
                      </div>
                      {currentManufacturer.brandName.split(' ').length > 1 && (
                        <div className="text-lg md:text-xl tracking-[0.3em] text-muted-foreground/50">
                          {currentManufacturer.brandName.split(' ').slice(1).join(' ')}
                        </div>
                      )}
                    </div>
                    <div className="mt-8 text-[10px] md:text-xs tracking-[0.25em] text-muted-foreground/60 uppercase">
                      Verified Manufacturer
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Slider Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {allManufacturers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
