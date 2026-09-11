import { ArrowRight, BarChart3, Check, Factory, LayoutGrid } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { LandingHeader, LandingFooter, CONTACT_HREF } from '@/components/homePage/LandingChrome';
import designerImage from '@/assets/about-formme-feature.jpg';
import { useLandingReveal } from '@/components/homePage/useLandingReveal';
import '@/components/homePage/production-landing.css';

const storyPoints = [
  'Ran factory floors and managed production for 40+ years, combined',
  'Later built and ran their own clothing brand',
  'Felt the same gap from both sides of the table',
];

const stats = [
  { value: '40+', label: 'Years combined in apparel manufacturing' },
  { value: '120+', label: 'Brands & manufacturers we’ve connected with' },
];

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
  /* Same Lenis smooth scroll and fade-in as the audience pages. */
  useLandingReveal();
  return (
  <div className="production-page about-page">
    <SEO
      title="About"
      canonical="/about"
      description="Formme is the operating system for fashion production — built by a team with 40+ years in apparel manufacturing, in Vancouver, BC, to connect factories and brands from tech pack to shipment."
    />

    <LandingHeader />

    <section className="about-hero">
      <div className="production-container about-hero-inner reveal">
        <span className="production-eyebrow"><span className="production-dot" /> ABOUT FORMME</span>
        <h1>Built for the realities of<br /><em>fashion production.</em></h1>
        <p>
          Formme is a fashion-tech platform built to close the gap between designers and manufacturers —
          streamlining tech packs, feasibility checks, and production workflows into one connected system.
        </p>
      </div>
    </section>

    <section className="production-section about-story">
      <div className="production-container about-story-grid reveal">
        <div className="about-story-copy">
          <span className="production-eyebrow">OUR STORY</span>
          <h2>Built by people who’ve<br />lived the problem.</h2>
          <ul className="about-story-points">
            {storyPoints.map(item => <li key={item}><Check size={15} />{item}</li>)}
          </ul>
          <p>
            We're building formme because we've lived the gap between what a designer draws and what a
            factory can actually produce — not guessing at it from the outside, but having felt it firsthand.
          </p>
          <p>
            Over the past year, we've connected with <strong>120+ brands and manufacturers</strong> to
            understand where production breaks down — and formme is shaped by what we heard from all of
            them, not assumptions about what production teams need.
          </p>
          <p className="about-story-location">
            Founded in Vancouver, BC · Part of the <strong>Innovation UBC Venture Founder</strong> program.
          </p>
        </div>
        <div className="about-story-media">
          <img src={designerImage} alt="Formme presented as the fashion stream organiser at a startup event" loading="lazy" />
          <div className="about-stats">
            {stats.map(s => (
              <div key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="production-section about-pillars">
      <div className="production-container">
        <div className="about-pillars-heading">
          <span className="production-eyebrow">WHAT WE'RE BUILDING</span>
          <h2>One system for factories and brands.</h2>
        </div>
        <div className="about-pillars-grid">
          {pillars.map(({ icon: Icon, title, description }) => (
            <div className="about-pillar" key={title}>
              <span className="about-pillar-icon"><Icon size={20} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="about-cta">
      <div className="production-container about-cta-inner">
        <h2>Want to build production<br />with us?</h2>
        <div>
          <p>We're working closely with early manufacturer and brand partners — reach out if you want in.</p>
          <div className="about-cta-actions">
            <a className="production-button" href={CONTACT_HREF}>Get in touch <ArrowRight size={16} /></a>
            <a className="production-button production-button-outline" href="/">See how it works <ArrowRight size={15} /></a>
          </div>
        </div>
      </div>
    </section>

    <LandingFooter />
  </div>
  );
};

export default About;
