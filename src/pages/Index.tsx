import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, MessageCircle, FileSpreadsheet, FileText } from 'lucide-react';
import { SEO } from '@/components/SEO';
import Footer from '@/components/Footer';
import BookDemoModal from '@/components/homePage/BookDemoModal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* ─── Shared bits ─── */
const CREAM = '#F5F0E8';
const INK = '#0D0D0D';
const INK_PANEL = '#141210';
const ACCENT = '#C97B5A';
const MUTED = '#AEAEAA';
const MUTED2 = '#8A8175';
const BORDER = '#E8E3DA';

const Eyebrow = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <p
    className="text-[10px] uppercase tracking-[0.42em] font-inter mb-5"
    style={{ color: dark ? 'rgba(245,240,232,0.45)' : MUTED2 }}
  >
    {children}
  </p>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] font-inter"
    style={{ borderColor: BORDER, color: MUTED2, background: 'rgba(255,255,255,0.55)' }}
  >
    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ACCENT }} />
    {children}
  </span>
);

/* Small annotation label used throughout — "STYLE / FM-HOOD-004" style tags */
const Tag = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[9px] uppercase tracking-[0.24em] font-inter" style={{ color: MUTED }}>
      {label}
    </span>
    <span className={`text-[13px] leading-tight ${mono ? 'font-inter' : 'font-dm-sans'}`} style={{ color: CREAM }}>
      {value}
    </span>
  </div>
);

const TagDark = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[9px] uppercase tracking-[0.24em] font-inter" style={{ color: MUTED2 }}>
      {label}
    </span>
    <span className="text-[13px] leading-tight font-dm-sans" style={{ color: INK }}>
      {value}
    </span>
  </div>
);

/* ════════════════════════════════════════════════
   HEADER — minimal, integrated
════════════════════════════════════════════════ */
const LandingHeader = ({ onBookDemo }: { onBookDemo: () => void }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Product', href: '#product' },
    { label: 'Factories', href: '#factories' },
    { label: 'Brands', href: '#brands' },
    { label: 'Company', href: '/about', route: true },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${
        scrolled ? 'backdrop-blur-md' : ''
      }`}
      style={{ background: scrolled ? 'rgba(245,240,232,0.82)' : 'transparent' }}
    >
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 md:px-10 h-16 md:h-[76px]">
        <Link to="/" className="text-[15px] tracking-[0.32em] font-dm-sans font-medium" style={{ color: INK }}>
          FORMME
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((item) =>
            item.route ? (
              <Link
                key={item.label}
                to={item.href}
                className="text-[12px] uppercase tracking-[0.18em] font-inter transition-colors"
                style={{ color: MUTED2 }}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-[12px] uppercase tracking-[0.18em] font-inter transition-colors hover:opacity-100"
                style={{ color: MUTED2 }}
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        <button
          onClick={onBookDemo}
          className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] font-inter font-medium"
          style={{ color: INK }}
        >
          Book a demo
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>
    </header>
  );
};

/* ════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════ */
const PANEL_LIGHT = '#EFEAE0';
const PANEL_BORDER = '#E1D8C7';

const fabricSwatches = ['#2B2622', '#8E5A40', '#C97B5A'];

const Hero = ({ onBookDemo, prefersReduced }: { onBookDemo: () => void; prefersReduced: boolean }) => (
  <section className="hero-sec relative pt-32 md:pt-40 pb-20 md:pb-28 px-6" aria-label="Hero">
    <div className="mx-auto max-w-[1400px] flex flex-col items-center text-center">
      <div className="reveal mb-8">
        <Pill>Concept to shipment platform</Pill>
      </div>

      <h1
        className="reveal font-dm-sans font-medium leading-[1.02] tracking-[-0.02em]"
        style={{ color: INK, fontSize: 'clamp(38px, 6.6vw, 96px)' }}
      >
        The operating system
        <br />
        for fashion production.
      </h1>

      <p
        className="reveal mt-8 max-w-xl font-inter font-light leading-relaxed"
        style={{ color: MUTED2, fontSize: 'clamp(15px, 1.6vw, 19px)' }}
      >
        Connect orders, factories and brands from PO to factory floor.
      </p>

      <div className="reveal mt-10 flex items-center gap-8">
        <button
          onClick={onBookDemo}
          className="px-7 py-3.5 rounded-full text-[13px] font-inter font-medium tracking-[0.04em] transition-transform duration-300 hover:-translate-y-0.5"
          style={{ background: INK, color: CREAM }}
        >
          Book a demo
        </button>
        <a
          href="#product"
          className="cta-link text-[13px] font-inter font-medium tracking-[0.04em]"
          style={{ color: INK }}
        >
          See how it works <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>

    {/* Editorial composition — garment + live production data, collaged like a moodboard */}
    <div className="hero-panel reveal mx-auto mt-20 md:mt-24 max-w-[1200px]">
      {/* Desktop — collaged panel, garment tile + floating data cards */}
      <div
        className="hidden md:block relative w-full overflow-hidden rounded-[24px] border"
        style={{ background: PANEL_LIGHT, borderColor: PANEL_BORDER, minHeight: 620 }}
      >
        <div
          className={`hero-garment absolute left-[9%] top-[150px] w-[240px] rounded-2xl overflow-hidden shadow-xl ${prefersReduced ? '' : 'float-soft'}`}
          style={{ background: INK_PANEL, aspectRatio: '3 / 4' }}
        >
          <img
            src="/mockupHoodieFront.png"
            alt="Formme production sample — style FM-HOOD-004"
            className="w-full h-full object-cover object-top scale-[1.35]"
            loading="eager"
          />
        </div>

        {/* Fabric swatch card */}
        <div
          className="hero-chip-0 flex absolute left-[7%] bottom-[10%] flex-col gap-3 rounded-xl px-5 py-4 bg-white shadow-md"
          style={{ border: `1px solid ${PANEL_BORDER}` }}
        >
          <span className="text-[9px] uppercase tracking-[0.24em] font-inter" style={{ color: MUTED2 }}>
            Fabric · Color
          </span>
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              {fabricSwatches.map((c) => (
                <span key={c} className="w-4 h-4 rounded-full border border-black/5" style={{ background: c }} />
              ))}
            </div>
            <span className="text-[12px] font-dm-sans" style={{ color: INK }}>420 GSM · Washed Black</span>
          </div>
        </div>

        {/* Style / Order card */}
        <div
          className={`hero-chip-1 block absolute left-[38%] top-[8%] rounded-xl px-5 py-4 bg-white shadow-md ${prefersReduced ? '' : 'float-soft-delay'}`}
          style={{ border: `1px solid ${PANEL_BORDER}` }}
        >
          <div className="flex gap-7">
            <TagDark label="Style" value="FM-HOOD-004" />
            <TagDark label="Order" value="#FM-2841" />
          </div>
        </div>

        {/* Quantity / Factory card */}
        <div
          className="hero-chip-2 block absolute right-[6%] top-[14%] rounded-xl px-5 py-4 bg-white shadow-md"
          style={{ border: `1px solid ${PANEL_BORDER}` }}
        >
          <div className="flex gap-7">
            <TagDark label="Quantity" value="600 pcs" />
            <TagDark label="Factory" value="Supreme Stitch" />
          </div>
        </div>

        {/* Stage / progress card */}
        <div
          className={`hero-chip-3 flex absolute right-[5%] bottom-[10%] flex-col gap-4 rounded-xl px-5 py-4 bg-white shadow-md ${prefersReduced ? '' : 'float-soft'}`}
          style={{ border: `1px solid ${PANEL_BORDER}` }}
        >
          <div className="flex gap-7">
            <TagDark label="Current stage" value="Sewing" />
            <TagDark label="Expected" value="Sep 08" />
          </div>
          <div className="w-40 h-[3px] rounded-full overflow-hidden" style={{ background: PANEL_BORDER }}>
            <div className="h-full rounded-full" style={{ width: '72%', background: ACCENT }} />
          </div>
        </div>
      </div>

      {/* Mobile — simple stacked card, no absolute positioning */}
      <div
        className="md:hidden relative w-full rounded-[24px] border overflow-hidden flex flex-col items-center gap-5 px-6 pt-8 pb-6"
        style={{ background: PANEL_LIGHT, borderColor: PANEL_BORDER }}
      >
        <div
          className="w-[190px] rounded-2xl overflow-hidden shadow-xl"
          style={{ background: INK_PANEL, aspectRatio: '3 / 4' }}
        >
          <img
            src="/mockupHoodieFront.png"
            alt="Formme production sample — style FM-HOOD-004"
            className="w-full h-full object-cover object-top scale-[1.35]"
            loading="eager"
          />
        </div>

        <div className="w-full max-w-[260px] rounded-xl px-5 py-4 bg-white shadow-md flex flex-col gap-3" style={{ border: `1px solid ${PANEL_BORDER}` }}>
          <div className="flex gap-6">
            <TagDark label="Style" value="FM-HOOD-004" />
            <TagDark label="Order" value="#FM-2841" />
          </div>
          <div className="flex gap-6">
            <TagDark label="Current stage" value="Sewing" />
            <TagDark label="Expected" value="Sep 08" />
          </div>
          <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: PANEL_BORDER }}>
            <div className="h-full rounded-full" style={{ width: '72%', background: ACCENT }} />
          </div>
        </div>
      </div>
    </div>

    {/* Trust strip */}
    <div className="reveal mx-auto mt-16 md:mt-20 max-w-[1400px] flex flex-col items-center gap-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.4em] font-inter" style={{ color: MUTED }}>
        Our manufacturers have produced for
      </p>
      <p
        className="font-dm-sans"
        style={{ fontSize: 'clamp(14px, 1.6vw, 19px)', letterSpacing: '0.06em', color: MUTED2 }}
      >
        Walmart&nbsp;&nbsp;·&nbsp;&nbsp;Old Navy&nbsp;&nbsp;·&nbsp;&nbsp;Costco&nbsp;&nbsp;·&nbsp;&nbsp;Fanatics&nbsp;&nbsp;·&nbsp;&nbsp;Champions&nbsp;&nbsp;·&nbsp;&nbsp;US Polo Assn
      </p>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   PROBLEM — fragmented tools → formme
════════════════════════════════════════════════ */
const scatteredTools = [
  { label: 'WhatsApp', Icon: MessageCircle },
  { label: 'Excel', Icon: FileSpreadsheet },
  { label: 'Email', Icon: Mail },
  { label: 'Documents', Icon: FileText },
];

const ProblemSection = () => (
  <section className="py-32 md:py-40 px-6 border-t" style={{ borderColor: BORDER }}>
    <div className="mx-auto max-w-3xl text-center">
      <Eyebrow>The problem</Eyebrow>
      <h2
        className="reveal font-dm-sans font-medium leading-[1.08] tracking-[-0.015em]"
        style={{ color: INK, fontSize: 'clamp(28px, 4.4vw, 56px)' }}
      >
        Fashion production still runs across disconnected tools.
      </h2>
    </div>

    <div className="reveal mx-auto mt-20 max-w-2xl flex flex-col items-center">
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {scatteredTools.map(({ label, Icon }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-inter"
            style={{ borderColor: BORDER, color: MUTED2 }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: MUTED }} />
            {label}
          </span>
        ))}
      </div>

      <svg width="2" height="56" viewBox="0 0 2 56" className="my-2">
        <line x1="1" y1="0" x2="1" y2="56" stroke={BORDER} strokeWidth="2" className="line-flow" />
      </svg>

      <span
        className="inline-flex items-center rounded-full px-6 py-2.5 text-[12px] uppercase tracking-[0.28em] font-inter font-medium"
        style={{ background: INK, color: CREAM }}
      >
        Formme
      </span>

      <p
        className="mt-14 font-dm-sans font-medium text-center"
        style={{ color: INK, fontSize: 'clamp(22px, 2.8vw, 32px)' }}
      >
        One place for every order.
      </p>
      <p
        className="mt-4 max-w-md text-center font-inter font-light leading-relaxed"
        style={{ color: MUTED2, fontSize: '15px' }}
      >
        Production status, approvals, documents and timelines stay connected from order to shipment.
      </p>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   PRODUCTION FLOW — flagship product-demo section
════════════════════════════════════════════════ */
const flowStages = [
  { label: 'Order', rows: [['PO', '#FM-2841'], ['Factory', 'Supreme Stitch'], ['Quantity', '600 pcs']] },
  { label: 'Development', rows: [['Tech pack', 'Approved'], ['Fabric sourcing', 'Confirmed'], ['Costing', 'Signed off']] },
  { label: 'Sample', rows: [['Proto', 'Approved'], ['Fit revision', '1 round'], ['PP sample', 'Approved']] },
  { label: 'Production', rows: [['Cutting', '✓'], ['Sewing', '72%'], ['Finishing', '—'], ['QC', '—'], ['Packing', '—']] },
  { label: 'QC', rows: [['Fabric', '✓'], ['Measurements', '✓'], ['Stitching', '✓'], ['Final inspection', 'In progress']] },
  { label: 'Shipment', rows: [['Packed', '✓'], ['Documents', '✓'], ['Carrier', 'DHL'], ['ETA', 'Sep 08']] },
];

const FlowPanel = ({ active }: { active: number }) => (
  <div
    className="relative w-full rounded-[18px] overflow-hidden px-7 py-8 md:px-9 md:py-10"
    style={{ background: INK_PANEL, minHeight: 280 }}
  >
    <AnimatePresence mode="wait">
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <p className="text-[10px] uppercase tracking-[0.35em] font-inter mb-6" style={{ color: MUTED2 }}>
          {String(active + 1).padStart(2, '0')} — {flowStages[active].label}
        </p>
        <div className="flex flex-col gap-4">
          {flowStages[active].rows.map(([l, v]) => (
            <div key={l} className="flex items-baseline justify-between border-b pb-3" style={{ borderColor: 'rgba(245,240,232,0.1)' }}>
              <span className="text-[13px] font-inter" style={{ color: MUTED }}>{l}</span>
              <span
                className="text-[14px] font-dm-sans"
                style={{ color: v === '✓' ? '#8FBF9A' : v === '—' ? MUTED2 : CREAM }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
);

const FlowStepper = ({ active, onSelect }: { active: number; onSelect?: (i: number) => void }) => (
  <div className="relative flex flex-col">
    {flowStages.map((s, i) => (
      <button
        key={s.label}
        type="button"
        onClick={() => onSelect?.(i)}
        className="relative flex items-center gap-5 py-4 text-left"
      >
        {i < flowStages.length - 1 && (
          <span
            className="absolute left-[7px] top-[22px] w-px transition-colors duration-500"
            style={{ height: 'calc(100% - 6px)', background: i < active ? ACCENT : BORDER }}
          />
        )}
        <span
          className="relative z-10 w-[15px] h-[15px] rounded-full border-2 flex-shrink-0 transition-colors duration-300"
          style={{
            borderColor: i <= active ? ACCENT : BORDER,
            background: i <= active ? ACCENT : CREAM,
          }}
        />
        <span className="flex items-baseline gap-3">
          <span className="text-[10px] font-inter" style={{ color: MUTED }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <span
            className="text-[15px] uppercase tracking-[0.1em] font-inter transition-colors duration-300"
            style={{ color: i === active ? INK : MUTED2 }}
          >
            {s.label}
          </span>
        </span>
      </button>
    ))}
  </div>
);

const ProductionFlowSection = () => {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        '(min-width: 768px)': () => {
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top top',
            end: () => '+=' + window.innerHeight * 3.8,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idx = Math.min(flowStages.length - 1, Math.floor(self.progress * flowStages.length));
              setActive(idx);
            },
          });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="product" ref={sectionRef} className="relative py-32 md:py-0 md:h-screen md:flex md:items-center px-6 border-t" style={{ borderColor: BORDER, background: CREAM }}>
      <div className="mx-auto max-w-[1200px] w-full">
        <div className="max-w-2xl mb-16 md:mb-20">
          <Eyebrow>The product</Eyebrow>
          <h2
            className="reveal font-dm-sans font-medium leading-[1.06] tracking-[-0.015em]"
            style={{ color: INK, fontSize: 'clamp(28px, 4vw, 50px)' }}
          >
            One system. From order to shipment.
          </h2>
        </div>

        {/* Desktop — scroll-driven */}
        <div className="hidden md:grid grid-cols-[1.1fr_0.9fr] gap-16 items-start">
          <div>
            <FlowStepper active={active} onSelect={setActive} />
          </div>
          <FlowPanel active={active} />
        </div>

        {/* Mobile — static stacked list */}
        <div className="md:hidden flex flex-col gap-10">
          {flowStages.map((s, i) => (
            <div key={s.label} className="reveal">
              <p className="text-[11px] uppercase tracking-[0.24em] font-inter mb-4" style={{ color: ACCENT }}>
                {String(i + 1).padStart(2, '0')} — {s.label}
              </p>
              <div
                className="rounded-[16px] px-6 py-6 flex flex-col gap-3"
                style={{ background: INK_PANEL }}
              >
                {s.rows.map(([l, v]) => (
                  <div key={l} className="flex items-baseline justify-between border-b pb-2.5" style={{ borderColor: 'rgba(245,240,232,0.1)' }}>
                    <span className="text-[12px] font-inter" style={{ color: MUTED }}>{l}</span>
                    <span className="text-[13px] font-dm-sans" style={{ color: v === '✓' ? '#8FBF9A' : v === '—' ? MUTED2 : CREAM }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ════════════════════════════════════════════════
   FACTORIES
════════════════════════════════════════════════ */
const FactoriesSection = () => (
  <section id="factories" className="py-32 md:py-40 px-6 border-t" style={{ borderColor: BORDER }}>
    <div className="mx-auto max-w-[1300px] grid md:grid-cols-2 gap-14 md:gap-20 items-center">
      <div className="reveal order-2 md:order-1">
        <Eyebrow>For manufacturers</Eyebrow>
        <h2
          className="font-dm-sans font-medium leading-[1.06] tracking-[-0.015em] mb-6"
          style={{ color: INK, fontSize: 'clamp(28px, 3.6vw, 46px)' }}
        >
          Run production from one system.
        </h2>
        <p className="font-inter font-light leading-relaxed max-w-md" style={{ color: MUTED2, fontSize: '16px' }}>
          Manage orders, sampling, production, quality and shipments without scattered spreadsheets and messages.
        </p>
      </div>

      <div className="reveal order-1 md:order-2 relative rounded-[18px] overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
        <img src="/factory.jpg" alt="Factory floor running production on formme" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,13,13,0) 40%, rgba(13,13,13,0.55) 100%)' }} />

        <div
          className="absolute left-5 right-5 bottom-5 rounded-xl px-5 py-4 backdrop-blur-sm"
          style={{ background: 'rgba(20,18,16,0.78)', border: '1px solid rgba(245,240,232,0.14)' }}
        >
          <p className="text-[9px] uppercase tracking-[0.24em] font-inter mb-3" style={{ color: MUTED2 }}>Order queue</p>
          <div className="flex flex-col gap-2.5">
            {[
              ['FM-2841', 'Oversized Hoodie', 'Sewing'],
              ['FM-2838', 'Crewneck', 'Cutting'],
              ['FM-2831', 'Track Pant', 'QC'],
            ].map(([po, style, stage]) => (
              <div key={po} className="flex items-center justify-between text-[12px] font-inter" style={{ color: CREAM }}>
                <span style={{ color: MUTED }}>{po}</span>
                <span className="flex-1 mx-3 truncate">{style}</span>
                <span style={{ color: ACCENT }}>{stage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   BRANDS
════════════════════════════════════════════════ */
const BrandsSection = () => (
  <section id="brands" className="py-32 md:py-40 px-6 border-t" style={{ borderColor: BORDER }}>
    <div className="mx-auto max-w-[1300px] grid md:grid-cols-2 gap-14 md:gap-20 items-center">
      <div className="reveal relative rounded-[18px] overflow-hidden" style={{ background: INK_PANEL, aspectRatio: '4 / 5' }}>
        <img
          src="/mockupHoodie.png"
          alt="Brand-facing order tracking on formme"
          className="absolute inset-0 w-full h-full object-contain scale-[0.7] opacity-80"
          loading="lazy"
        />

        <div
          className="absolute left-5 right-5 top-5 rounded-xl px-5 py-5 backdrop-blur-sm"
          style={{ background: 'rgba(20,18,16,0.8)', border: '1px solid rgba(245,240,232,0.14)' }}
        >
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="text-[9px] uppercase tracking-[0.24em] font-inter mb-1.5" style={{ color: MUTED2 }}>Order #2841</p>
              <p className="text-[14px] font-dm-sans" style={{ color: CREAM }}>Oversized Hoodie · 600 units</p>
            </div>
            <span className="text-[20px] font-dm-sans font-medium" style={{ color: ACCENT }}>72%</span>
          </div>

          <div className="w-full h-[3px] rounded-full overflow-hidden mb-6" style={{ background: 'rgba(245,240,232,0.14)' }}>
            <div className="h-full rounded-full" style={{ width: '72%', background: ACCENT }} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Tag label="Current stage" value="Sewing" />
            <Tag label="Expected completion" value="8 Sep" />
          </div>

          <div className="mt-5 pt-4 border-t" style={{ borderColor: 'rgba(245,240,232,0.1)' }}>
            <Tag label="Latest update" value="Line 04 · 2 hours ago" />
          </div>
        </div>
      </div>

      <div className="reveal">
        <Eyebrow>For brands</Eyebrow>
        <h2
          className="font-dm-sans font-medium leading-[1.06] tracking-[-0.015em] mb-6"
          style={{ color: INK, fontSize: 'clamp(28px, 3.6vw, 46px)' }}
        >
          See what's happening without asking what's happening.
        </h2>
        <p className="font-inter font-light leading-relaxed max-w-md" style={{ color: MUTED2, fontSize: '16px' }}>
          Every stage your factory logs — sampling, cutting, sewing, QC, shipping — updates your order in real time. No status-check messages required.
        </p>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   SUPREME STITCH — built with manufacturers
════════════════════════════════════════════════ */
const SupremeStitchSection = ({ prefersReduced }: { prefersReduced: boolean }) => (
  <section className="relative py-40 md:py-52 px-6 overflow-hidden border-t" style={{ borderColor: BORDER }} aria-label="Built with Supreme Stitch">
    <div className="absolute inset-0">
      {!prefersReduced ? (
        <video className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata">
          <source src="/CraftsmanshipVideo.mp4" type="video/mp4" />
        </video>
      ) : (
        <img src="/factory.jpg" alt="" className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.78) 100%)' }} />
    </div>

    <div className="relative z-10 mx-auto max-w-3xl text-center">
      <Eyebrow dark>Built with manufacturers</Eyebrow>
      <h2
        className="reveal font-dm-sans font-medium leading-[1.1] tracking-[-0.015em] mb-8"
        style={{ color: CREAM, fontSize: 'clamp(30px, 4.6vw, 58px)' }}
      >
        Software designed on the factory floor.
      </h2>
      <p className="reveal font-cormorant italic font-light" style={{ color: 'rgba(245,240,232,0.75)', fontSize: 'clamp(20px, 2.4vw, 30px)' }}>
        Supreme Stitch <span style={{ color: ACCENT }}>×</span> Formme
      </p>

      <div className="reveal mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        <TagDarkOnDark label="Factory" value="Supreme Stitch" />
        <TagDarkOnDark label="Location" value="Dhaka, Bangladesh" />
        <TagDarkOnDark label="Status" value="Onboarding onto formme" />
      </div>

      <a
        href="https://www.supremegroupbd.com"
        target="_blank"
        rel="noopener noreferrer"
        className="reveal inline-flex items-center gap-2 mt-14 text-[12px] uppercase tracking-[0.24em] font-inter"
        style={{ color: CREAM, borderBottom: '1px solid rgba(245,240,232,0.35)', paddingBottom: 4 }}
      >
        supremegroupbd.com <span aria-hidden="true">↗</span>
      </a>
    </div>
  </section>
);

const TagDarkOnDark = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1.5 items-center">
    <span className="text-[9px] uppercase tracking-[0.24em] font-inter" style={{ color: 'rgba(245,240,232,0.45)' }}>
      {label}
    </span>
    <span className="text-[14px] font-dm-sans" style={{ color: CREAM }}>
      {value}
    </span>
  </div>
);

/* ════════════════════════════════════════════════
   FINAL CTA
════════════════════════════════════════════════ */
const FinalCTA = ({ onBookDemo }: { onBookDemo: () => void }) => (
  <section className="closing-cta py-40 md:py-52 px-6 flex flex-col items-center text-center" style={{ background: INK }}>
    <h2
      className="font-dm-sans font-medium leading-[1.08] mb-16"
      style={{ color: CREAM, fontSize: 'clamp(34px, 6vw, 78px)' }}
    >
      Orders.
      <br />
      Production.
      <br />
      Quality.
      <br />
      Shipping.
      <br />
      <span style={{ color: ACCENT }}>Connected.</span>
    </h2>

    <button
      onClick={onBookDemo}
      className="px-8 py-4 rounded-full text-[13px] font-inter font-medium tracking-[0.06em] transition-transform duration-300 hover:-translate-y-0.5 mb-16"
      style={{ background: CREAM, color: INK }}
    >
      Book a demo
    </button>

    <p className="text-[13px] tracking-[0.35em] font-inter" style={{ color: 'rgba(245,240,232,0.35)' }}>
      FORMME
    </p>
  </section>
);

/* ─── Page ─── */
const Index = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [showBookDemo, setShowBookDemo] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq?.matches ?? false);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq?.addEventListener('change', handler);
    return () => mq?.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Read reduced-motion directly (rather than depending on the `prefersReduced`
    // state) so this effect only ever runs once — it owns the shared Lenis
    // instance and its cleanup kills all ScrollTriggers, including the ones
    // ProductionFlowSection creates in its own effect, which has no way to
    // recreate them if this effect were to re-run mid-life.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const isMobile = window.innerWidth < 768;
    let lenis: InstanceType<typeof Lenis> | null = null;
    let rafFn: ((time: number) => void) | null = null;
    if (!isMobile) {
      lenis = new Lenis({
        duration: 1.3,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenis.on('scroll', ScrollTrigger.update);
      rafFn = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(rafFn);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      /* Hero garment — subtle parallax as page loads */
      if (!reduced) {
        gsap.from('.hero-garment', { opacity: 0, y: 24, duration: 1.1, ease: 'power3.out', delay: 0.15 });
        gsap.from('.hero-chip-0, .hero-chip-1, .hero-chip-2, .hero-chip-3', {
          opacity: 0, y: 16, stagger: 0.12, duration: 0.9, ease: 'power2.out', delay: 0.5,
        });
      }

      /* Generic reveals */
      gsap.utils.toArray<Element>('.reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 28, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (lenis) {
        lenis.destroy();
        if (rafFn) gsap.ticker.remove(rafFn);
      }
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: CREAM, color: INK }}>
      <SEO
        canonical="/"
        description="Formme is the operating system for fashion production — connecting factories, sourcing teams and brands from purchase order to shipment, with live tracking, sampling and quality control in one place."
      />

      <LandingHeader onBookDemo={() => setShowBookDemo(true)} />

      <Hero onBookDemo={() => setShowBookDemo(true)} prefersReduced={prefersReduced} />
      <ProblemSection />
      <ProductionFlowSection />
      <FactoriesSection />
      <BrandsSection />
      <SupremeStitchSection prefersReduced={prefersReduced} />
      <FinalCTA onBookDemo={() => setShowBookDemo(true)} />

      <Footer />

      <BookDemoModal open={showBookDemo} onOpenChange={setShowBookDemo} />
    </div>
  );
};

export default Index;
