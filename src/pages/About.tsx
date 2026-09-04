import { useState } from 'react';
import { Factory, LayoutGrid, BarChart3, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import BookDemoModal from '@/components/homePage/BookDemoModal';
import { BG, LAVENDER, INK, DARK_PANEL, MUTED2, BORDER, PURPLE } from '@/components/homePage/theme';
import { Eyebrow, SolidButton, OutlineButton, LandingHeader, LandingFooter } from '@/components/homePage/LandingChrome';
import { useLandingReveal } from '@/components/homePage/useLandingReveal';
import designerImage from '@/assets/about-designer.jpg';

const pillars = [
  {
    icon: Factory,
    title: 'Built with manufacturers',
    description: "We're developing formme in close collaboration with manufacturers and designers, so the workflow reflects real production constraints — not a guess at them.",
  },
  {
    icon: LayoutGrid,
    title: 'One connected workflow',
    description: 'Tech packs, feasibility checks, sampling, and production tracking in a single system, instead of scattered spreadsheets and email threads.',
  },
  {
    icon: BarChart3,
    title: 'Live visibility',
    description: "Brands see what's happening in production without asking. Factories run their floor from one source of truth, instead of chasing updates.",
  },
];

const About = () => {
  const prefersReduced = useLandingReveal();
  const [showBookDemo, setShowBookDemo] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: INK }}>
      <SEO
        title="About"
        canonical="/about"
        description="Formme is the operating system for fashion production — built in Vancouver, BC to connect factories and brands from tech pack to shipment."
      />

      <LandingHeader onBookDemo={() => setShowBookDemo(true)} />

      {/* Hero */}
      <section className="relative" style={{ background: LAVENDER }}>
        <div className="mx-auto max-w-[900px] px-6 pt-36 pb-20 md:pt-44 md:pb-24 text-center">
          <div className="reveal flex justify-center">
            <Eyebrow>About formme</Eyebrow>
          </div>
          <h1 className="reveal font-cormorant font-medium leading-[1.08] tracking-[-0.01em]" style={{ color: INK, fontSize: 'clamp(36px, 5vw, 58px)' }}>
            Built for the realities of{' '}
            <span className="italic" style={{ color: PURPLE }}>fashion production.</span>
          </h1>
          <p className="reveal mt-6 max-w-xl mx-auto font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '15px' }}>
            Formme is a fashion-tech platform built to reduce friction between designers and manufacturers — streamlining tech packs, feasibility checks, and production workflows into one connected system.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 md:py-24 px-6" style={{ background: BG }}>
        <div className="mx-auto max-w-[1300px] grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="reveal order-2 lg:order-1">
            <Eyebrow>Our story</Eyebrow>
            <h2 className="font-dm-sans font-semibold leading-[1.15] mb-5" style={{ color: INK, fontSize: 'clamp(26px, 3vw, 38px)' }}>
              From first sketch to finished production.
            </h2>
            <div className="flex flex-col gap-4 font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '15px' }}>
              <p>
                We're building formme to close the gap between what a designer draws and what a factory can actually produce — reducing the back-and-forth that slows tech packs, sampling, and production down.
              </p>
              <p>
                The platform is being developed in close collaboration with manufacturers and designers, so it reflects real production constraints rather than how software imagines them.
              </p>
              <p>
                Formme is founded in Vancouver, BC, and part of the <strong style={{ color: INK }}>Innovation UBC Venture Founder</strong> program.
              </p>
            </div>
          </div>
          <div className="reveal order-1 lg:order-2">
            <img
              src={designerImage}
              alt="Designer working with fabric samples"
              className="w-full h-auto rounded-2xl"
              style={{ border: `1px solid ${BORDER}` }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 md:py-24 px-6" style={{ background: LAVENDER }}>
        <div className="mx-auto max-w-[1300px]">
          <div className="reveal max-w-lg mb-14">
            <Eyebrow>What we're building</Eyebrow>
            <h2 className="font-dm-sans font-semibold leading-[1.15]" style={{ color: INK, fontSize: 'clamp(26px, 3vw, 38px)' }}>
              One system for factories and brands.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div key={title} className="reveal rounded-2xl bg-white p-7" style={{ border: `1px solid ${BORDER}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(93,82,214,0.1)' }}>
                  <Icon className="w-5 h-5" strokeWidth={1.75} style={{ color: PURPLE }} />
                </div>
                <h3 className="font-dm-sans font-semibold mb-2.5" style={{ color: INK, fontSize: '17px' }}>{title}</h3>
                <p className="font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '13.5px' }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24 px-6" style={{ background: DARK_PANEL }}>
        <div className="mx-auto max-w-[1300px] flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <h2 className="reveal font-dm-sans font-semibold leading-[1.15]" style={{ color: '#fff', fontSize: 'clamp(28px, 4vw, 46px)' }}>
            Want to build production<br />with us?
          </h2>
          <div className="reveal flex flex-col items-start gap-5">
            <p className="font-inter max-w-xs" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              We're working closely with early manufacturer and brand partners — reach out if you want in.
            </p>
            <div className="flex items-center gap-4">
              <SolidButton onClick={() => setShowBookDemo(true)}>Book a demo</SolidButton>
              <OutlineButton href="/" dark>See how it works <ArrowRight className="w-3.5 h-3.5" /></OutlineButton>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />

      <BookDemoModal open={showBookDemo} onOpenChange={setShowBookDemo} />
    </div>
  );
};

export default About;
