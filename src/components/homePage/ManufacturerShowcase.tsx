import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, CheckCircle2, RotateCcw, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Primary partner data
const primaryPartner = {
  name: 'Supreme Stitch',
  brandName: 'SUPREME GROUP',
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
};

// Other verified partners
const otherPartners = [
  {
    id: '1',
    name: 'Rose Intimates',
    country: 'Bangladesh',
    specialization: 'Intimates & lingerie',
    status: 'Verified Partner',
    externalUrl: 'http://roseintimates.com/',
  },
  {
    id: '2',
    name: 'Navex Impex',
    country: 'India',
    specialization: 'Knitwear & casual apparel',
    status: 'Private Network',
    externalUrl: null,
  },
  {
    id: '3',
    name: 'Ratul Apparel',
    country: 'India',
    specialization: 'Woven garments & exports',
    status: 'Verified Partner',
    externalUrl: null,
  },
];

export default function ManufacturerShowcase() {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section 1: Primary Manufacturing Partner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#FEFDFB] rounded-3xl p-8 md:p-12 shadow-sm border border-border/30"
        >
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Left Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Label */}
              <span className="text-sm font-medium tracking-widest text-[#C8956C] uppercase">
                Strategic Partner
              </span>

              {/* Headline */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-normal text-foreground leading-tight italic">
                Our primary manufacturing<br />partner on Formme
              </h2>

              {/* Description */}
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                {primaryPartner.description}{' '}
                <span className="font-semibold text-foreground">
                  {primaryPartner.clients.join(', ')}.
                </span>
              </p>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4">
                {primaryPartner.metrics.map((metric, index) => (
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

              {/* Capability Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {primaryPartner.capabilities.map((capability, index) => (
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

              {/* Trust Note */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-[#C8956C]"></span>
                <span>Trusted partner — contract in place for designer–manufacturer collaboration.</span>
              </div>

              {/* CTA */}
              <a
                href="https://supremegroupbd.com/supremestitch/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="rounded-full px-6 py-5 text-sm border-foreground/20 hover:bg-foreground/5"
                >
                  Explore manufacturing partner
                </Button>
              </a>
            </div>

            {/* Right Side - Brand Logo */}
            <div className="lg:col-span-2 flex items-center justify-center">
              <div className="bg-[#FAF9F6] rounded-3xl p-10 md:p-16 w-full h-full min-h-[300px] flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-4xl md:text-5xl font-bold tracking-tight text-muted-foreground/60">
                    SUPREME
                  </div>
                  <div className="text-xl md:text-2xl tracking-[0.3em] text-muted-foreground/50">
                    GROUP
                  </div>
                </div>
                <div className="mt-8 text-[10px] md:text-xs tracking-[0.25em] text-muted-foreground/60 uppercase">
                  Verified Manufacturer
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Other Verified Manufacturing Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <h3 className="text-2xl md:text-3xl font-serif font-normal text-foreground mb-8">
            Other Verified Manufacturing Partners
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otherPartners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="bg-white rounded-xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-3">
                  {/* Partner Name */}
                  <h4 className="text-lg font-semibold text-foreground">
                    {partner.name}
                  </h4>

                  {/* Country */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {partner.country}
                  </div>

                  {/* Specialization */}
                  <p className="text-sm text-muted-foreground">
                    {partner.specialization}
                  </p>

                  {/* Status Badge */}
                  <Badge
                    variant="secondary"
                    className={`text-xs font-normal ${
                      partner.status === 'Verified Partner'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {partner.status}
                  </Badge>

                  {/* CTA - only show for partners with external URL */}
                  {partner.externalUrl ? (
                    <a
                      href={partner.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-3 text-sm text-primary hover:text-primary hover:bg-primary/5"
                      >
                        Visit website
                      </Button>
                    </a>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-3 text-sm text-primary hover:text-primary hover:bg-primary/5"
                      onClick={() => navigate('/coming-soon')}
                    >
                      Request match
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

