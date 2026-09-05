import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, ArrowRight, ArrowDown, ChevronDown, FileText, Shirt, Factory, ShieldCheck, Package,
  LayoutGrid, ClipboardList, BarChart3, Settings, Linkedin, CircleDot, Scissors, Truck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';
import BookDemoModal from '@/components/homePage/BookDemoModal';
import { BG, LAVENDER, INK, DARK_PANEL, MUTED, MUTED2, BORDER, BORDER_DARK, PURPLE, PURPLE_BG, GREEN, GREEN_BG, RED } from '@/components/homePage/theme';
import type { Audience } from '@/components/homePage/theme';
import { Logo, Eyebrow, SolidButton, OutlineButton, LandingHeader, LandingFooter, CONTACT_HREF } from '@/components/homePage/LandingChrome';
import { AudienceGate } from '@/components/homePage/AudienceGate';
import { useLandingReveal } from '@/components/homePage/useLandingReveal';
import gsap from 'gsap';

const TagRow = ({ label, value, swatch, image }: { label: string; value: string; swatch?: string; image?: string }) => (
  <div className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: BORDER }}>
    <span className="text-[11px] font-inter" style={{ color: MUTED }}>{label}</span>
    <span className="text-[12px] font-dm-sans flex items-center gap-1.5" style={{ color: INK }}>
      {swatch && <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: swatch }} />}
      {image && <img src={image} alt="" className="w-5 h-5 rounded-sm object-cover flex-shrink-0" />}
      {value}
    </span>
  </div>
);

/* Status dot for a checklist row: filled check (done), partial ring (active/in-progress), dashed outline (upcoming) */
const StatusDot = ({ state, progress }: { state: 'done' | 'active' | 'upcoming'; progress?: number }) => {
  if (state === 'done') {
    return (
      <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: GREEN }}>
        <Check className="w-2.5 h-2.5" style={{ color: '#fff' }} strokeWidth={3.5} />
      </span>
    );
  }
  if (state === 'active') {
    const pct = progress ?? 50;
    const r = 6;
    const c = 2 * Math.PI * r;
    return (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r={r} fill="none" stroke={BORDER} strokeWidth="2" />
        <circle
          cx="8" cy="8" r={r} fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 8 8)"
        />
      </svg>
    );
  }
  return <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ border: `1.5px dashed ${MUTED}` }} />;
};

const ChecklistRow = ({ label, state = 'upcoming', note, progress }: { label: string; state?: 'done' | 'active' | 'upcoming'; note: string; progress?: number }) => (
  <div className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: BORDER }}>
    <div className="flex items-center gap-2">
      <StatusDot state={state} progress={progress} />
      <span className="text-[12px] font-inter" style={{ color: INK }}>{label}</span>
    </div>
    {progress !== undefined ? (
      <div className="flex items-center gap-2">
        <div className="w-14 h-[3px] rounded-full overflow-hidden" style={{ background: BORDER }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: PURPLE }} />
        </div>
        <span className="text-[10px] font-inter" style={{ color: MUTED2 }}>{note}</span>
      </div>
    ) : (
      <span className="text-[10px] font-inter" style={{ color: state === 'done' ? GREEN : MUTED }}>{note}</span>
    )}
  </div>
);

/* ════════════════════════════════════════════════
   HERO — brand order → formme → factory execution / brand visibility
════════════════════════════════════════════════ */
const workflowSteps = [
  { icon: FileText, label: 'Tech Pack' },
  { icon: Scissors, label: 'Sampling' },
  { icon: Package, label: 'Production' },
  { icon: ShieldCheck, label: 'Quality' },
  { icon: Truck, label: 'Shipment' },
];

/* Rounded-chip step number used to mark each step in the hero's product story */
const NumberChip = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-flex items-center justify-center rounded-md px-2 py-1 text-[11px] font-inter font-bold leading-none flex-shrink-0"
    style={{ background: PURPLE_BG, color: PURPLE, border: '1px solid rgba(93,82,214,0.25)' }}
  >
    {children}
  </span>
);

const StepBadge = ({ n, label, sub }: { n: string; label: string; sub?: string }) => (
  <div className="flex items-center gap-2">
    <NumberChip>{n}</NumberChip>
    <div className="flex flex-col leading-tight">
      <span className="text-[11px] uppercase tracking-[0.1em] font-inter font-semibold" style={{ color: PURPLE }}>{label}</span>
      {sub && <span className="text-[10px] uppercase tracking-[0.1em] font-inter" style={{ color: MUTED }}>{sub}</span>}
    </div>
  </div>
);

/* Straight labeled arrow connecting two steps — grid-aligned, so it never drifts from the cards it points between */
const FlowArrow = ({ label, className }: { label: string; className?: string }) => (
  <div className={`relative z-30 flex flex-col items-center justify-center px-1 ${className ?? ''}`}>
    <span className="text-[9px] font-inter mb-2 whitespace-nowrap" style={{ color: MUTED }}>{label}</span>
    <ArrowRight className="w-4 h-4" style={{ color: PURPLE, opacity: 0.5 }} />
  </div>
);

/* Compact card used for both the Factory Execution and Brand Visibility outputs */
const OutputCard = ({ step, label, className, children }: { step: string; label: string; className?: string; children: React.ReactNode }) => (
  <div className={`rounded-2xl bg-white p-5 ${className ?? ''}`} style={{ border: `1px solid ${BORDER}`, boxShadow: '0 8px 24px -12px rgba(93,82,214,0.18)' }}>
    <div className="flex items-center gap-2 pb-3 mb-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
      <NumberChip>{step}</NumberChip>
      <span className="text-[11px] uppercase tracking-[0.1em] font-inter font-semibold" style={{ color: PURPLE }}>{label}</span>
    </div>
    {children}
  </div>
);

/* Callout label pointing at a spot on the hero garment photo — dot, connector tick, label pill */
const HoodieCallout = ({ x, y, side, label, value }: { x: number; y: number; side: 'left' | 'right'; label: string; value: string }) => (
  <div
    className="hero-callout absolute flex items-center gap-2 z-20"
    style={
      side === 'right'
        ? { left: `${x}%`, top: `${y}%`, transform: 'translateY(-50%)' }
        : { right: `${100 - x}%`, top: `${y}%`, transform: 'translateY(-50%)', flexDirection: 'row-reverse' }
    }
  >
    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PURPLE }} />
    <span className="h-px w-4 flex-shrink-0" style={{ background: 'rgba(93,82,214,0.45)' }} />
    <span className="rounded-md bg-white shadow-sm px-2.5 py-1.5 whitespace-nowrap" style={{ border: `1px solid ${BORDER}` }}>
      <span className="block text-[8px] uppercase tracking-[0.08em] font-inter font-semibold" style={{ color: MUTED2 }}>{label}</span>
      <span className="block text-[10px] font-dm-sans font-medium" style={{ color: INK }}>{value}</span>
    </span>
  </div>
);

const Hero = ({ prefersReduced }: { prefersReduced: boolean }) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReduced) return;
    const ctx = gsap.context(() => {
      gsap.set(['.hero-step1', '.hero-step2', '.hero-step3a', '.hero-step3b'], { opacity: 0, y: 14 });
      gsap.set(['.hero-arrow-1', '.hero-arrow-2'], { opacity: 0 });
      gsap.set('.hero-callout', { opacity: 0 });
      gsap.set('.hero-progress-fill', { width: 0 });

      gsap.timeline({ delay: 0.25 })
        .to('.hero-step1', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
        .to('.hero-arrow-1', { opacity: 1, duration: 0.4, ease: 'power1.out' }, '-=0.15')
        .to('.hero-step2', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.1')
        .to('.hero-callout', { opacity: 1, duration: 0.3, stagger: 0.08, ease: 'power1.out' }, '-=0.2')
        .to('.hero-arrow-2', { opacity: 1, duration: 0.4, ease: 'power1.out' }, '-=0.1')
        .to('.hero-step3a', { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.1')
        .to('.hero-step3b', { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.15')
        .to('.hero-progress-fill', { width: '72%', duration: 0.9, ease: 'power2.out' }, '-=0.1');
    }, heroRef);
    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <section ref={heroRef} className="hero-sec relative" aria-label="Hero" style={{ background: LAVENDER }}>
      <div className="mx-auto max-w-[1600px] px-6 pt-20 md:pt-24 pb-20 md:pb-24">
        <div className="grid md:grid-cols-[0.4fr_0.6fr] gap-14 md:gap-8 items-start min-[1600px]:items-center">
          {/* Left — positioning */}
          <div className="min-w-0">
            <div className="reveal">
              <Eyebrow>Fashion production, connected</Eyebrow>
            </div>
            <h1 className="reveal font-cormorant font-medium leading-[1.08] tracking-[-0.01em]" style={{ color: INK, fontSize: 'clamp(40px, 4.6vw, 60px)' }}>
              The operating system for{' '}
              <span className="italic" style={{ color: PURPLE }}>fashion production.</span>
            </h1>
            <p className="reveal mt-6 max-w-sm font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '15px' }}>
              Formme helps factories run production and gives brands live visibility — from tech pack to shipment.
            </p>
            <div className="reveal mt-8 flex items-center gap-6">
              <SolidButton href={CONTACT_HREF}>Get in touch</SolidButton>
              <a href="#product" className="cta-link text-[13px] font-inter font-medium" style={{ color: PURPLE }}>
                See how it works <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="reveal mt-9 flex items-center gap-3 flex-wrap">
              {workflowSteps.map(({ icon: Icon, label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <span style={{ color: PURPLE, opacity: 0.5 }}>&middot;</span>}
                  <span className="flex items-center gap-1.5 text-[12px] font-inter font-medium" style={{ color: PURPLE }}>
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                    {label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right — the product story */}
          <div className="relative">
            {/* Desktop composition */}
            <div className="hidden min-[1600px]:grid relative grid-cols-[1fr_auto_0.95fr_auto_1fr] gap-3 items-center w-fit ml-auto translate-x-6">
              {/* Step 1 — Brand order */}
              <div className="hero-step1 relative z-10">
                <div className="mb-4">
                  <StepBadge n="01" label="Brand order" />
                </div>
                <div className="rounded-2xl bg-white p-5 w-[228px]" style={{ border: `1px solid ${BORDER}`, boxShadow: '0 8px 24px -12px rgba(93,82,214,0.18)' }}>
                  <p className="text-[13px] font-dm-sans font-bold mb-4" style={{ color: PURPLE }}>Tech Pack</p>
                  <TagRow label="Style" value="FM-HOOD-004" />
                  <TagRow label="Order" value="#FM-2841" />
                  <TagRow label="Quantity" value="600 pcs" />
                  <TagRow label="Fabric" value="420 GSM cotton" />
                  <TagRow label="Color" value="Washed black" swatch="#1A1A1A" />
                  <TagRow label="Size run" value="XS–XXL" />

                  <div className="mt-4 rounded-xl flex items-center justify-center gap-3 py-5" style={{ background: LAVENDER }}>
                    <Shirt className="w-12 h-12" strokeWidth={1} style={{ color: MUTED2 }} />
                    <Shirt className="w-12 h-12 scale-x-[-1]" strokeWidth={1} style={{ color: MUTED2 }} />
                  </div>

                  <div className="mt-1">
                    <TagRow label="Style" value="FM-HOOD-004" />
                    <TagRow label="Fit" value="Oversized" />
                    <TagRow label="Hood" value="Double layer" />
                    <TagRow label="Pocket" value="Kangaroo" />
                    <TagRow label="Rib" value="2x2" />
                    <TagRow label="Label" value="Woven" />
                  </div>

                  <div className="mt-3 flex gap-1">
                    {['#1A1A1A', '#6B6878', '#D9D6E8', '#1A1A1A'].map((c, i) => (
                      <span key={i} className="flex-1 h-5 rounded-sm" style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </div>

              <FlowArrow label="Order created" className="hero-arrow-1" />

              {/* Step 2 — Formme */}
              <div className="hero-step2 relative z-10 flex flex-col items-center">
                <div className="relative w-[268px]" style={{ aspectRatio: '766 / 912', perspective: '900px' }}>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'url(/mockupHoodieFront.png)',
                      backgroundSize: '200.52% 112.28%',
                      backgroundPosition: '50% 16.96%',
                      backgroundRepeat: 'no-repeat',
                      transform: 'rotateY(-26deg)',
                      filter: 'drop-shadow(0 18px 26px rgba(21,19,28,0.16))',
                    }}
                  />
                  <HoodieCallout x={40} y={27} side="right" label="Style" value="FM-HOOD-004" />
                  <HoodieCallout x={51} y={46} side="right" label="Fabric" value="420 GSM cotton" />
                  <HoodieCallout x={40} y={61} side="left" label="Color" value="Washed black" />
                  <HoodieCallout x={48} y={70} side="right" label="Quantity" value="600 pcs" />
                  <HoodieCallout x={39} y={90} side="right" label="Size run" value="XS–XXL" />
                </div>
                <div className="relative z-10 mt-4 rounded-xl shadow-md px-4 py-3 flex items-center gap-2.5 w-[260px]" style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
                  <img src="/logo-mark.png" alt="" className="w-8 h-8 object-contain flex-shrink-0" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[13px] font-dm-sans font-bold" style={{ color: INK }}>FORMME</span>
                    <span className="text-[10px] font-inter" style={{ color: MUTED }}>Connected Order #FM-2841</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between hero-arrow-2" style={{ height: '300px' }}>
                <FlowArrow label="Production updated" />
                <FlowArrow label="Status synced" />
              </div>

              {/* Step 3 — outputs */}
              <div className="flex flex-col gap-4">
                <OutputCard step="02A" label="Factory execution" className="hero-step3a">
                  <ChecklistRow label="Cutting" state="done" note="Complete" />
                  <ChecklistRow label="Sewing" state="active" note="72%" progress={72} />
                  <ChecklistRow label="Finishing" note="Upcoming" />
                  <ChecklistRow label="Quality" note="Upcoming" />
                  <ChecklistRow label="Packing" note="Upcoming" />
                  <TagRow label="Line" value="Line 04" />
                  <TagRow label="Expected completion" value="08 Sep" />
                </OutputCard>

                <OutputCard step="02B" label="Brand visibility" className="hero-step3b">
                  <TagRow label="Order" value="#FM-2841" />
                  <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: BORDER }}>
                    <span className="text-[11px] font-inter" style={{ color: MUTED }}>Production progress</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-[3px] rounded-full overflow-hidden" style={{ background: BORDER }}>
                        <div className="hero-progress-fill h-full rounded-full" style={{ background: PURPLE }} />
                      </div>
                      <span className="text-[12px] font-dm-sans" style={{ color: INK }}>72%</span>
                    </div>
                  </div>
                  <TagRow label="Current stage" value="Sewing" swatch={PURPLE} />
                  <TagRow label="Factory" value="Supreme Stitch" image="/factory.jpg" />
                  <TagRow label="Expected completion" value="08 Sep" />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[11px] font-inter" style={{ color: MUTED }}>Latest update</span>
                    <span className="text-[12px] font-dm-sans text-right" style={{ color: INK }}>Sewing — Line 04<br /><span style={{ color: MUTED2, fontSize: 10 }}>2 hours ago</span></span>
                  </div>
                </OutputCard>
              </div>
            </div>

            {/* Mobile — simple vertical sequence */}
            <div className="min-[1600px]:hidden flex flex-col items-center gap-3">
              <div className="reveal w-full">
                <div className="mb-3 flex justify-center">
                  <StepBadge n="01" label="Brand order" />
                </div>
                <div className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${BORDER}` }}>
                  <p className="text-[13px] font-dm-sans font-bold mb-3" style={{ color: PURPLE }}>Tech Pack</p>
                  <TagRow label="Style" value="FM-HOOD-004" />
                  <TagRow label="Order" value="#FM-2841" />
                  <TagRow label="Quantity" value="600 pcs" />
                  <TagRow label="Fabric" value="420 GSM cotton" />
                  <TagRow label="Color" value="Washed black" swatch="#1A1A1A" />
                  <TagRow label="Size run" value="XS–XXL" />
                </div>
              </div>

              <ArrowDown className="reveal w-4 h-4" style={{ color: MUTED }} />

              <div className="reveal flex flex-col items-center">
                <div className="relative w-[220px] mx-10" style={{ aspectRatio: '766 / 912', perspective: '700px' }}>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'url(/mockupHoodieFront.png)',
                      backgroundSize: '200.52% 112.28%',
                      backgroundPosition: '50% 16.96%',
                      backgroundRepeat: 'no-repeat',
                      transform: 'rotateY(-26deg)',
                      filter: 'drop-shadow(0 14px 20px rgba(21,19,28,0.16))',
                    }}
                  />
                  <HoodieCallout x={40} y={27} side="right" label="Style" value="FM-HOOD-004" />
                  <HoodieCallout x={51} y={46} side="right" label="Fabric" value="420 GSM cotton" />
                  <HoodieCallout x={40} y={61} side="left" label="Color" value="Washed black" />
                  <HoodieCallout x={48} y={70} side="right" label="Quantity" value="600 pcs" />
                  <HoodieCallout x={39} y={90} side="right" label="Size run" value="XS–XXL" />
                </div>
                <div className="relative z-10 mt-4 rounded-xl shadow-md px-4 py-3 flex items-center gap-2.5 w-[240px]" style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
                  <img src="/logo-mark.png" alt="" className="w-8 h-8 object-contain flex-shrink-0" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[13px] font-dm-sans font-bold" style={{ color: INK }}>FORMME</span>
                    <span className="text-[10px] font-inter" style={{ color: MUTED }}>Connected Order #FM-2841</span>
                  </div>
                </div>
              </div>

              <ArrowDown className="reveal w-4 h-4" style={{ color: MUTED }} />

              <div className="reveal w-full">
                <OutputCard step="02A" label="Factory execution">
                  <ChecklistRow label="Cutting" state="done" note="Complete" />
                  <ChecklistRow label="Sewing" state="active" note="72%" progress={72} />
                  <ChecklistRow label="Finishing" note="Upcoming" />
                  <ChecklistRow label="Quality" note="Upcoming" />
                  <ChecklistRow label="Packing" note="Upcoming" />
                  <TagRow label="Line" value="Line 04" />
                  <TagRow label="Expected completion" value="08 Sep" />
                </OutputCard>
              </div>

              <ArrowDown className="reveal w-4 h-4" style={{ color: MUTED }} />

              <div className="reveal w-full">
                <OutputCard step="02B" label="Brand visibility">
                  <TagRow label="Order" value="#FM-2841" />
                  <TagRow label="Production progress" value="72%" />
                  <TagRow label="Current stage" value="Sewing" swatch={PURPLE} />
                  <TagRow label="Factory" value="Supreme Stitch" image="/factory.jpg" />
                  <TagRow label="Expected completion" value="08 Sep" />
                  <TagRow label="Latest update" value="Sewing — Line 04, 2h ago" />
                </OutputCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ════════════════════════════════════════════════
   FOR MANUFACTURERS / FOR BRANDS
════════════════════════════════════════════════ */
const manufacturerChecklist = ['Real-time production tracking', 'Smarter planning & capacity', 'Quality & inspection in one place', 'On-time shipments, every time'];
const brandChecklist = ['Matched with vetted, reliable manufacturers', 'Live order & production visibility', 'Quality, rework & approvals', 'Shipment tracking & ETAs', 'Fewer follow-ups, more clarity'];

const lineProgress = [
  { line: 'Line 01', dots: [1, 1, 1, 1, 1, 0], color: PURPLE },
  { line: 'Line 02', dots: [1, 1, 1, 0, 0, 0], color: '#D9A441' },
  { line: 'Line 03', dots: [1, 1, 1, 1, 1, 1], color: GREEN },
  { line: 'Line 04', dots: [1, 1, 1, 1, 0, 0], color: PURPLE },
];

const upcomingDeliveries = [
  { code: 'FM-HOOD-004', date: '06 Sep', factory: 'Supreme Stitch', qty: '600 PCS', stage: 'Finishing', stageColor: '#D9A441' },
  { code: 'FM-TS-101', date: '10 Sep', factory: 'Ace Garments', qty: '300 PCS', stage: 'Cutting', stageColor: RED },
  { code: 'FM-JOG-201', date: '12 Sep', factory: 'Moda Works', qty: '600 PCS', stage: 'Finishing', stageColor: '#D9A441' },
];

const orderProgressRows = [
  { code: 'FM-HOOD-004', qty: '600 PCS', cols: [100, 100, 72, 0, 0] },
  { code: 'FM-TS-101', qty: '300 PCS', cols: [100, 70, 40, 0, 0] },
  { code: 'FM-JOG-201', qty: '600 PCS', cols: [100, 100, 60, 20, 0] },
];

const recentUpdates = [
  { text: 'Line 04 moved to sewing', meta: 'FM-HOOD-004 · 2 hours ago' },
  { text: 'Quality check passed', meta: 'FM-TS-101 · 4 hours ago' },
  { text: 'Shipment scheduled for 12 Sep', meta: 'FM-JOG-201 · 1 day ago' },
];

const FactoriesSection = () => (
  <section id="factories" className="py-20 md:py-24 px-6" style={{ background: BG }}>
    <div className="mx-auto max-w-[1300px] grid lg:grid-cols-2 gap-6">
      {/* Dark manufacturer card */}
      <div className="reveal rounded-3xl p-8 md:p-10" style={{ background: DARK_PANEL }}>
        <Eyebrow dark>For manufacturers</Eyebrow>
        <h2 className="font-dm-sans font-semibold leading-[1.15] mb-4" style={{ color: '#fff', fontSize: 'clamp(24px, 2.6vw, 32px)' }}>
          Run production from one system.
        </h2>
        <p className="font-inter leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          Plan, track, and manage every step of production in real time. Reduce delays, errors, and follow-ups.
        </p>
        <div className="flex flex-col gap-2.5 mb-7">
          {manufacturerChecklist.map((c) => (
            <div key={c} className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PURPLE }} strokeWidth={3} />
              <span className="text-[13px] font-inter" style={{ color: 'rgba(255,255,255,0.8)' }}>{c}</span>
            </div>
          ))}
        </div>
        <OutlineButton href="#factories" dark>Explore for factories <ArrowRight className="w-3.5 h-3.5" /></OutlineButton>

        <div className="mt-9 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER_DARK}` }}>
          <p className="text-[11px] font-dm-sans font-medium mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>Production Overview</p>
          <div className="grid grid-cols-3 gap-3 mb-5 pb-5" style={{ borderBottom: `1px solid ${BORDER_DARK}` }}>
            {[['Orders', '24'], ['In Production', '12'], ['On-time Rate', '85%']].map(([l, v]) => (
              <div key={l}>
                <p className="font-dm-sans font-bold text-[18px]" style={{ color: '#fff' }}>{v}</p>
                <p className="text-[9px] font-inter mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.1em] font-inter mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Line Progress</p>
          <div className="flex flex-col gap-2.5 mb-6">
            {lineProgress.map((l) => (
              <div key={l.line} className="flex items-center gap-3">
                <span className="text-[10px] font-inter w-12 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>{l.line}</span>
                <div className="relative flex items-center gap-0 flex-1">
                  <div className="absolute left-[5px] right-[5px] h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  {l.dots.map((d, i) => (
                    <span key={i} className="relative flex-1 flex justify-center first:justify-start last:justify-end">
                      <span className="w-[7px] h-[7px] rounded-full" style={{ background: d ? l.color : 'rgba(255,255,255,0.16)' }} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.1em] font-inter mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Upcoming Deliveries</p>
          <div className="flex flex-col gap-3">
            {upcomingDeliveries.map((d) => (
              <div key={d.code} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-inter">
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>{d.code}</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>{d.qty}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-inter">
                  <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.stageColor }} /> {d.factory}
                  </span>
                  <span style={{ color: d.stageColor }}>{d.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Light brand card */}
      <div id="brands" className="reveal rounded-3xl p-8 md:p-10" style={{ background: LAVENDER }}>
        <Eyebrow>For brands</Eyebrow>
        <h2 className="font-dm-sans font-semibold leading-[1.15] mb-4" style={{ color: INK, fontSize: 'clamp(24px, 2.6vw, 32px)' }}>
          See what's happening without asking what's happening.
        </h2>
        <p className="font-inter leading-relaxed mb-6" style={{ color: MUTED2, fontSize: '14px' }}>
          Live updates across orders, quality, and shipments — so you can make faster decisions and keep your customers happy.
        </p>
        <div className="flex flex-col gap-2.5 mb-7">
          {brandChecklist.map((c) => (
            <div key={c} className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PURPLE }} strokeWidth={3} />
              <span className="text-[13px] font-inter" style={{ color: MUTED2 }}>{c}</span>
            </div>
          ))}
        </div>
        <OutlineButton href="#brands">Explore for brands <ArrowRight className="w-3.5 h-3.5" /></OutlineButton>

        <div className="mt-9 rounded-2xl bg-white p-5 shadow-md" style={{ border: `1px solid ${BORDER}` }}>
          <p className="text-[11px] font-dm-sans font-medium mb-4" style={{ color: INK }}>Brand Dashboard</p>
          <p className="text-[10px] uppercase tracking-[0.1em] font-inter mb-2" style={{ color: MUTED }}>Order Overview</p>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[['Total Orders', '12'], ['In Production', '8'], ['On-time Rate', '92%']].map(([l, v]) => (
              <div key={l} className="rounded-lg p-2.5" style={{ border: `1px solid ${BORDER}` }}>
                <p className="font-dm-sans font-bold text-[16px]" style={{ color: INK }}>{v}</p>
                <p className="text-[8px] font-inter mt-1 leading-tight" style={{ color: MUTED }}>{l}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.1em] font-inter mb-3" style={{ color: MUTED }}>Order Progress</p>
          <div className="hidden sm:grid grid-cols-[1.4fr_repeat(5,1fr)] gap-1 mb-1.5">
            <span />
            {['Cutting', 'Sewing', 'Finishing', 'QC', 'Shipment'].map((h) => (
              <span key={h} className="text-[7px] uppercase text-center font-inter" style={{ color: MUTED }}>{h}</span>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 mb-6">
            {orderProgressRows.map((r) => (
              <div key={r.code} className="grid grid-cols-[1.4fr_repeat(5,1fr)] gap-1 items-center">
                <div className="min-w-0">
                  <p className="text-[10px] font-inter truncate" style={{ color: INK }}>{r.code}</p>
                  <p className="text-[8px] font-inter" style={{ color: MUTED }}>{r.qty}</p>
                </div>
                {r.cols.map((c, i) => (
                  <span key={i} className="text-[9px] text-center font-inter" style={{ color: c === 100 ? GREEN : c === 0 ? MUTED : INK }}>{c}%</span>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.1em] font-inter" style={{ color: MUTED }}>Recent Updates</p>
            <span className="text-[10px] font-inter" style={{ color: PURPLE }}>View all</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {recentUpdates.map((u) => (
              <div key={u.text} className="flex items-start gap-2">
                <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-px" style={{ background: PURPLE_BG }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: PURPLE }} />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-inter" style={{ color: INK }}>{u.text}</span>
                  <span className="text-[9px] font-inter" style={{ color: MUTED }}>{u.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   WORKFLOW — tech pack to shipment
════════════════════════════════════════════════ */
/* Shared small building blocks for the workflow stage visuals */
const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between py-2.5 border-b last:border-b-0" style={{ borderColor: BORDER }}>
    <span className="text-[12px] font-inter" style={{ color: MUTED }}>{label}</span>
    <span className="text-[13px] font-dm-sans font-medium" style={{ color: INK }}>{value}</span>
  </div>
);

const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[0.1em] font-inter font-semibold mb-2 mt-4 first:mt-0" style={{ color: MUTED }}>{children}</p>
);

const DoneValue = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1" style={{ color: GREEN }}>
    <Check className="w-3 h-3" strokeWidth={3} /> {children}
  </span>
);

const StagePanel = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-white p-6 md:p-8" style={{ border: `1px solid ${BORDER}`, boxShadow: '0 8px 30px -18px rgba(93,82,214,0.25)', minHeight: 460 }}>
    {children}
  </div>
);

/* Field-level stagger used inside every stage visual — each block fades/slides in one
   after another instead of the whole panel appearing at once. Collapses to a plain
   instant fade when the visitor prefers reduced motion. */
const stageContainer = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const stageItem = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } };
const stageContainerReduced = { hidden: {}, show: { transition: { staggerChildren: 0 } } };
const stageItemReduced = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.15 } } };

const StageMotion = ({ children, reduced, className }: { children: React.ReactNode; reduced?: boolean; className?: string }) => (
  <motion.div variants={reduced ? stageContainerReduced : stageContainer} initial="hidden" animate="show" className={className}>
    {children}
  </motion.div>
);

const StageItem = ({ children, reduced, className, style }: { children: React.ReactNode; reduced?: boolean; className?: string; style?: React.CSSProperties }) => (
  <motion.div variants={reduced ? stageItemReduced : stageItem} className={className} style={style}>
    {children}
  </motion.div>
);

/* ─── For brands: stage visuals ─── */
const BrandStage1Visual = ({ reduced }: { reduced?: boolean }) => (
  <StageMotion reduced={reduced}>
    <StageItem reduced={reduced} className="rounded-xl p-4 flex items-center gap-4 mb-5" style={{ background: '#F7F6FB' }}>
      <img src="/techpackSketch.png" alt="" className="w-16 h-16 object-contain flex-shrink-0" />
      <div>
        <p className="font-dm-sans font-bold text-[16px]" style={{ color: INK }}>Oversized Hoodie</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: '#1A1A1A' }} />
          <span className="text-[11px] font-inter" style={{ color: MUTED2 }}>Washed black</span>
        </div>
      </div>
    </StageItem>
    <StageItem reduced={reduced}>
      <Row label="Tech pack" value={<DoneValue>Uploaded</DoneValue>} />
      <Row label="Quantity" value="600 pcs" />
      <Row label="Target delivery" value="28 Sep" />
      <Row label="Fabric" value="420 GSM cotton" />
    </StageItem>
  </StageMotion>
);

const brandMatchCandidates = [
  { name: 'Supreme Stitch', location: 'Bangladesh', capabilities: ['Heavyweight knits', 'Hoodies', 'Sweatshirts'], capacity: 'Available', selected: true },
  { name: 'Ace Garments', location: 'Vietnam', capabilities: ['Wovens', 'Outerwear'], capacity: 'Limited', selected: false },
  { name: 'Moda Works', location: 'Portugal', capabilities: ['Knitwear', 'Fleece'], capacity: 'Available', selected: false },
];

const BrandStage2Visual = ({ reduced }: { reduced?: boolean }) => (
  <StageMotion reduced={reduced} className="grid sm:grid-cols-3 gap-3">
    {brandMatchCandidates.map((m) => (
      <StageItem key={m.name} reduced={reduced} className="rounded-xl p-4" style={m.selected ? { border: `1.5px solid ${PURPLE}`, background: PURPLE_BG } : { border: `1px solid ${BORDER}`, background: '#fff' }}>
        <p className="font-dm-sans font-bold text-[13px] mb-0.5" style={{ color: INK }}>{m.name}</p>
        <p className="text-[11px] font-inter mb-3" style={{ color: MUTED }}>{m.location}</p>
        <p className="text-[9px] uppercase tracking-[0.08em] font-inter mb-1.5" style={{ color: MUTED }}>Capabilities</p>
        <div className="flex flex-col gap-0.5 mb-3">
          {m.capabilities.map((c) => (
            <span key={c} className="text-[11px] font-inter" style={{ color: MUTED2 }}>{c}</span>
          ))}
        </div>
        <span
          className="text-[10px] font-inter font-medium px-2 py-1 rounded-full inline-block"
          style={{ background: m.capacity === 'Available' ? GREEN_BG : PURPLE_BG, color: m.capacity === 'Available' ? GREEN : PURPLE }}
        >
          {m.capacity}
        </span>
        {m.selected && (
          <div className="mt-3 pt-3 flex items-center gap-1.5 text-[11px] font-inter font-medium" style={{ borderTop: '1px solid rgba(93,82,214,0.25)', color: PURPLE }}>
            <Check className="w-3.5 h-3.5" strokeWidth={3} /> Connected to order
          </div>
        )}
      </StageItem>
    ))}
  </StageMotion>
);

const BrandStage3Visual = ({ reduced }: { reduced?: boolean }) => (
  <StageMotion reduced={reduced}>
    <StageItem reduced={reduced} className="grid sm:grid-cols-2 gap-3 mb-5">
      <div className="rounded-xl p-4" style={{ border: `1px solid ${BORDER}` }}>
        <p className="text-[9px] uppercase tracking-[0.08em] font-inter mb-1" style={{ color: MUTED }}>Sample #01</p>
        <p className="font-dm-sans font-semibold text-[13px] mb-2" style={{ color: INK }}>Fit sample</p>
        <span className="text-[11px] font-inter font-medium" style={{ color: RED }}>Needs revision</span>
      </div>
      <div className="rounded-xl p-4" style={{ border: `1.5px solid ${PURPLE}`, background: PURPLE_BG }}>
        <p className="text-[9px] uppercase tracking-[0.08em] font-inter mb-1" style={{ color: MUTED }}>Sample #02</p>
        <p className="font-dm-sans font-semibold text-[13px] mb-2" style={{ color: INK }}>Fit sample</p>
        <span className="inline-flex items-center gap-1 text-[11px] font-inter font-medium" style={{ color: GREEN }}>
          <Check className="w-3 h-3" strokeWidth={3} /> Approved
        </span>
      </div>
    </StageItem>
    <StageItem reduced={reduced}>
      <Row label="Price" value={<DoneValue>Agreed</DoneValue>} />
      <Row label="Fabric" value={<DoneValue>Approved</DoneValue>} />
    </StageItem>
    <StageItem reduced={reduced} className="flex flex-col gap-2 mt-4">
      {['Factory submitted sample', 'Brand requested revision', 'New sample uploaded', 'Sample approved'].map((t) => (
        <div key={t} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PURPLE }} />
          <span className="text-[11px] font-inter" style={{ color: MUTED2 }}>{t}</span>
        </div>
      ))}
    </StageItem>
  </StageMotion>
);

const BrandStage4Visual = ({ reduced }: { reduced?: boolean }) => (
  <StageMotion reduced={reduced}>
    <StageItem reduced={reduced} className="flex items-center justify-between mb-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.08em] font-inter mb-1" style={{ color: MUTED }}>Order #FM-2841</p>
        <p className="font-dm-sans font-bold text-[16px]" style={{ color: INK }}>Oversized Hoodie</p>
      </div>
      <span className="text-[10px] font-inter font-medium px-2.5 py-1 rounded-full" style={{ background: PURPLE_BG, color: PURPLE }}>In production</span>
    </StageItem>
    <StageItem reduced={reduced}>
      <Row label="Quantity" value="600 pcs" />
      <Row label="Factory" value="Supreme Stitch" />
      <Row label="Status" value="In production" />
      <Row label="Expected completion" value="08 Sep" />
    </StageItem>
  </StageMotion>
);

const brandStageTimeline = ['Fabric', 'Cutting', 'Sewing', 'Finishing', 'QC', 'Packing', 'Shipment'];

const BrandStage5Visual = ({ reduced }: { reduced?: boolean }) => (
  <StageMotion reduced={reduced}>
    <StageItem reduced={reduced}>
      <GroupLabel>Materials</GroupLabel>
      <ChecklistRow label="Fabric sourced" state="done" note="Complete" />
      <ChecklistRow label="Fabric received at factory" state="done" note="Complete" />
    </StageItem>
    <StageItem reduced={reduced}>
      <GroupLabel>Production</GroupLabel>
      <ChecklistRow label="Cutting" state="done" note="Complete" />
      <ChecklistRow label="Sewing" state="active" progress={72} note="72%" />
      <ChecklistRow label="Finishing" note="Upcoming" />
      <div className="mt-1">
        <Row label="Quality" value="Upcoming" />
        <Row label="Packing" value="Upcoming" />
        <Row label="Shipment" value="Upcoming" />
      </div>
    </StageItem>

    <StageItem reduced={reduced} className="grid sm:grid-cols-2 gap-x-6 mt-5 pt-5" style={{ borderTop: `1px solid ${BORDER}` }}>
      <Row label="Factory" value="Supreme Stitch" />
      <Row label="Current stage" value="Sewing — Line 04" />
      <Row label="Last update" value="2 hours ago" />
      <Row label="Expected completion" value="08 Sep" />
    </StageItem>

    <StageItem reduced={reduced} className="flex items-center gap-1.5 mt-6 overflow-x-auto pb-1">
      {brandStageTimeline.map((s, i) => {
        const isCurrent = s === 'Sewing';
        return (
          <React.Fragment key={s}>
            <span
              className="text-[10px] font-inter font-medium whitespace-nowrap px-2.5 py-1.5 rounded-full flex-shrink-0"
              style={isCurrent ? { background: PURPLE, color: '#fff' } : { color: MUTED }}
            >
              {s}
            </span>
            {i < brandStageTimeline.length - 1 && <span className="w-3 h-px flex-shrink-0" style={{ background: BORDER }} />}
          </React.Fragment>
        );
      })}
    </StageItem>
  </StageMotion>
);

const brandStages = [
  { n: '01', label: 'Start your order', heading: 'Tell us what you’re making.', Visual: BrandStage1Visual },
  { n: '02', label: 'Factory match', heading: 'Get connected with the right manufacturer.', Visual: BrandStage2Visual },
  { n: '03', label: 'Develop & agree', heading: 'Work through samples, pricing and approvals.', Visual: BrandStage3Visual },
  { n: '04', label: 'Place production order', heading: 'Move the approved product into production.', Visual: BrandStage4Visual },
  { n: '05', label: 'Live production visibility', heading: 'Know where your order is without chasing updates.', Visual: BrandStage5Visual },
];

/* ─── For manufacturers: stage visuals ─── */
const mfgOrders = [
  { id: 'FM-2841', style: 'Oversized Hoodie', qty: '600 pcs', stage: 'Sewing', progress: 72, due: '08 Sep' },
  { id: 'FM-2839', style: 'T-Shirt', qty: '1,200 pcs', stage: 'Cutting', progress: 35, due: '12 Sep' },
];

const ManufacturerStage1Visual = ({ reduced }: { reduced?: boolean }) => (
  <StageMotion reduced={reduced}>
    <StageItem reduced={reduced} className="hidden sm:grid grid-cols-[1fr_1fr_0.7fr_0.9fr_0.9fr_0.7fr] gap-2 pb-2 mb-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
      {['Order', 'Style', 'Qty', 'Stage', 'Progress', 'Due'].map((h) => (
        <span key={h} className="text-[9px] uppercase tracking-[0.08em] font-inter" style={{ color: MUTED }}>{h}</span>
      ))}
    </StageItem>
    {mfgOrders.map((o, i) => (
      <StageItem
        key={o.id}
        reduced={reduced}
        className={`grid grid-cols-2 sm:grid-cols-[1fr_1fr_0.7fr_0.9fr_0.9fr_0.7fr] gap-2 py-3 items-center ${i < mfgOrders.length - 1 ? 'border-b' : ''}`}
        style={{ borderColor: BORDER }}
      >
        <span className="font-dm-sans font-semibold text-[12px]" style={{ color: INK }}>{o.id}</span>
        <span className="text-[12px] font-inter" style={{ color: MUTED2 }}>{o.style}</span>
        <span className="text-[11px] font-inter hidden sm:block" style={{ color: MUTED2 }}>{o.qty}</span>
        <span className="text-[11px] font-inter hidden sm:block" style={{ color: INK }}>{o.stage}</span>
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="w-12 h-[3px] rounded-full overflow-hidden flex-shrink-0" style={{ background: BORDER }}>
            <div className="h-full rounded-full" style={{ width: `${o.progress}%`, background: PURPLE }} />
          </div>
          <span className="text-[10px] font-inter" style={{ color: MUTED2 }}>{o.progress}%</span>
        </div>
        <span className="text-[11px] font-inter hidden sm:block" style={{ color: MUTED2 }}>{o.due}</span>
      </StageItem>
    ))}
  </StageMotion>
);

const ManufacturerStage2Visual = ({ reduced }: { reduced?: boolean }) => (
  <StageMotion reduced={reduced}>
    <StageItem reduced={reduced} className="grid sm:grid-cols-2 gap-3 mb-5">
      <div className="rounded-xl p-4" style={{ border: `1px solid ${BORDER}` }}>
        <p className="text-[9px] uppercase tracking-[0.08em] font-inter mb-1" style={{ color: MUTED }}>Line 01</p>
        <p className="font-dm-sans font-semibold text-[13px] mb-2" style={{ color: INK }}>Hoodie · 600 pcs</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: BORDER }}>
            <div className="h-full rounded-full" style={{ width: '72%', background: PURPLE }} />
          </div>
          <span className="text-[11px] font-inter" style={{ color: MUTED2 }}>72%</span>
        </div>
      </div>
      <div className="rounded-xl p-4" style={{ border: `1px solid ${BORDER}` }}>
        <p className="text-[9px] uppercase tracking-[0.08em] font-inter mb-1" style={{ color: MUTED }}>Line 02</p>
        <p className="font-dm-sans font-semibold text-[13px] mb-2" style={{ color: INK }}>T-Shirt · 1,200 pcs</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: BORDER }}>
            <div className="h-full rounded-full" style={{ width: '45%', background: PURPLE }} />
          </div>
          <span className="text-[11px] font-inter" style={{ color: MUTED2 }}>45%</span>
        </div>
      </div>
    </StageItem>
    <StageItem reduced={reduced}>
      <Row label="Capacity" value="83%" />
      <Row label="Upcoming deadline" value="08 Sep" />
    </StageItem>
  </StageMotion>
);

const ManufacturerStage3Visual = ({ reduced }: { reduced?: boolean }) => (
  <StageMotion reduced={reduced}>
    <StageItem reduced={reduced}>
      <ChecklistRow label="Cutting" state="done" note="Complete" />
      <ChecklistRow label="Sewing" state="active" progress={70} note="420 / 600 pcs" />
      <ChecklistRow label="Finishing" note="Upcoming" />
      <ChecklistRow label="QC" note="Upcoming" />
      <ChecklistRow label="Packing" note="Upcoming" />
    </StageItem>
  </StageMotion>
);

const ManufacturerStage4Visual = ({ reduced }: { reduced?: boolean }) => (
  <StageMotion reduced={reduced}>
    <StageItem reduced={reduced}>
      <GroupLabel>Inline QC</GroupLabel>
      <Row label="Passed" value={<span style={{ color: GREEN, fontWeight: 600 }}>587 pcs</span>} />
      <Row label="Rework" value={<span style={{ color: RED, fontWeight: 600 }}>13 pcs</span>} />
    </StageItem>
    <StageItem reduced={reduced} className="mt-4">
      <Row label="Packing" value="Ready" />
      <Row label="Shipment" value="Preparing" />
    </StageItem>
  </StageMotion>
);

const ManufacturerStage5Visual = ({ reduced }: { reduced?: boolean }) => (
  <StageMotion reduced={reduced}>
    <div className="flex flex-col items-center gap-2 py-2">
      <StageItem reduced={reduced} className="rounded-xl px-4 py-2.5 text-center w-full sm:w-auto" style={{ border: `1px solid ${BORDER}`, background: '#F7F6FB' }}>
        <p className="text-[10px] uppercase tracking-[0.08em] font-inter" style={{ color: MUTED }}>Factory ERP</p>
        <p className="text-[12px] font-dm-sans font-medium mt-0.5" style={{ color: INK }}>Production updated: Sewing 72%</p>
      </StageItem>
      <StageItem reduced={reduced}><ArrowDown className="w-4 h-4" style={{ color: MUTED, opacity: 0.6 }} /></StageItem>
      <StageItem reduced={reduced} className="rounded-xl px-6 py-2.5" style={{ background: PURPLE }}>
        <p className="text-[14px] font-cormorant font-medium text-white">Formme</p>
      </StageItem>
      <StageItem reduced={reduced}><ArrowDown className="w-4 h-4" style={{ color: MUTED, opacity: 0.6 }} /></StageItem>
      <StageItem reduced={reduced} className="rounded-xl px-4 py-2.5 text-center w-full sm:w-auto" style={{ border: `1.5px solid ${PURPLE}`, background: PURPLE_BG }}>
        <p className="text-[10px] uppercase tracking-[0.08em] font-inter" style={{ color: PURPLE }}>Brand portal</p>
        <p className="text-[12px] font-dm-sans font-medium mt-0.5" style={{ color: INK }}>Current stage: Sewing</p>
      </StageItem>
    </div>
    <StageItem reduced={reduced} className="mt-4">
      <Row label="Latest update" value="2 hours ago" />
    </StageItem>
    <StageItem reduced={reduced} className="mt-4 pt-4 text-center" style={{ borderTop: `1px solid ${BORDER}` }}>
      <p className="text-[12px] font-inter" style={{ color: MUTED2 }}>Access new brand opportunities through the Formme network.</p>
    </StageItem>
  </StageMotion>
);

const manufacturerStages = [
  { n: '01', label: 'Orders', heading: 'Manage every order in one place.', Visual: ManufacturerStage1Visual },
  { n: '02', label: 'Plan production', heading: 'Plan capacity, lines and deadlines.', Visual: ManufacturerStage2Visual },
  { n: '03', label: 'Run production', heading: 'Keep each production stage connected.', Visual: ManufacturerStage3Visual },
  { n: '04', label: 'Quality & shipment', heading: 'Track quality before the order leaves the factory.', Visual: ManufacturerStage4Visual },
  { n: '05', label: 'Connected visibility', heading: 'Update once. Keep your customer informed.', Visual: ManufacturerStage5Visual },
];

type WorkflowTab = 'brands' | 'manufacturers';
type WorkflowStage = { n: string; label: string; heading: string; Visual: (props: { reduced?: boolean }) => React.ReactElement };

/* Accessible tablist — roving tabindex, arrow-key navigation, one panel id shared by both tabs */
const WorkflowTabs = ({ active, onChange }: { active: WorkflowTab; onChange: (t: WorkflowTab) => void }) => {
  const tabs: { id: WorkflowTab; label: string }[] = [
    { id: 'brands', label: 'For Brands' },
    { id: 'manufacturers', label: 'For Manufacturers' },
  ];
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    const nextId = tabs[next].id;
    onChange(nextId);
    btnRefs.current[nextId]?.focus();
  };

  return (
    <div role="tablist" aria-label="Formme workflow by audience" className="inline-flex items-center gap-1 rounded-full p-1" style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
      {tabs.map((t, i) => {
        const selected = active === t.id;
        return (
          <button
            key={t.id}
            ref={(el) => { btnRefs.current[t.id] = el; }}
            role="tab"
            id={`workflow-tab-${t.id}`}
            aria-selected={selected}
            aria-controls="workflow-tabpanel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="relative rounded-full px-5 py-2.5 text-[13px] font-inter font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D52D6] focus-visible:ring-offset-2"
            style={{ color: selected ? PURPLE : MUTED2, background: selected ? PURPLE_BG : 'transparent' }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};

const WorkflowStepNav = ({ stages, active, onSelect }: { stages: WorkflowStage[]; active: number; onSelect: (i: number) => void }) => (
  <div className="hidden lg:flex flex-col gap-1">
    {stages.map((s, i) => {
      const isActive = i === active;
      return (
        <button
          key={s.n}
          onClick={() => onSelect(i)}
          aria-current={isActive || undefined}
          aria-controls="workflow-tabpanel"
          className="text-left rounded-xl px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D52D6]"
          style={isActive ? { background: '#fff', border: `1px solid ${PURPLE}` } : { border: '1px solid transparent' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-inter font-semibold" style={{ color: isActive ? PURPLE : MUTED }}>{s.n}</span>
            <span className="text-[10px] uppercase tracking-[0.08em] font-inter font-semibold" style={{ color: isActive ? PURPLE : MUTED }}>{s.label}</span>
          </div>
          <p className="text-[13px] font-inter leading-snug" style={{ color: isActive ? INK : MUTED2 }}>{s.heading}</p>
        </button>
      );
    })}
  </div>
);

const panelVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};
const panelVariantsReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

/* Mobile: every stage stacked vertically, no interactivity needed — reveals on scroll like the rest of the page */
const WorkflowMobileList = ({ stages, reduced }: { stages: WorkflowStage[]; reduced?: boolean }) => (
  <div className="flex lg:hidden flex-col gap-6 min-w-0">
    {stages.map((s) => (
      <div key={s.n} className="reveal">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-inter font-semibold flex-shrink-0" style={{ border: `1.5px solid ${PURPLE}`, color: PURPLE }}>{s.n}</span>
          <span className="text-[11px] uppercase tracking-[0.08em] font-inter font-semibold" style={{ color: PURPLE }}>{s.label}</span>
        </div>
        <p className="font-dm-sans font-semibold text-[15px] mb-3" style={{ color: INK }}>{s.heading}</p>
        <div className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${BORDER}` }}>
          <s.Visual reduced={reduced} />
        </div>
      </div>
    ))}
  </div>
);

const WorkflowSharedEnding = () => (
  <div className="reveal mt-14 pt-12 text-center" style={{ borderTop: `1px solid ${BORDER}` }}>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
      <span className="text-[11px] uppercase tracking-[0.1em] font-inter font-semibold px-4 py-2 rounded-full" style={{ background: DARK_PANEL, color: '#fff' }}>Factory operations</span>
      <span className="w-8 h-px hidden sm:block flex-shrink-0" style={{ background: PURPLE }} />
      <span className="text-[14px] font-cormorant font-medium px-5 py-2 rounded-full flex-shrink-0" style={{ background: PURPLE, color: '#fff' }}>Formme</span>
      <span className="w-8 h-px hidden sm:block flex-shrink-0" style={{ background: PURPLE }} />
      <span className="text-[11px] uppercase tracking-[0.1em] font-inter font-semibold px-4 py-2 rounded-full" style={{ background: PURPLE_BG, color: PURPLE }}>Brand visibility</span>
    </div>
    <p className="font-dm-sans font-semibold" style={{ color: INK, fontSize: 'clamp(18px, 2vw, 24px)' }}>
      One order. One source of information.
    </p>
    <p className="font-inter text-[13px] mt-1.5" style={{ color: MUTED2 }}>Shared from factory floor to brand.</p>
  </div>
);

const WorkflowSection = ({ prefersReduced }: { prefersReduced: boolean }) => {
  const [tab, setTab] = useState<WorkflowTab>('brands');
  const [brandStep, setBrandStep] = useState(0);
  const [mfgStep, setMfgStep] = useState(0);

  const activeIndex = tab === 'brands' ? brandStep : mfgStep;
  const setActiveIndex = tab === 'brands' ? setBrandStep : setMfgStep;
  const stages = tab === 'brands' ? brandStages : manufacturerStages;
  const ActiveVisual = stages[activeIndex].Visual;

  return (
    <section id="product" className="py-20 md:py-24 px-6" style={{ background: LAVENDER }}>
      <div className="mx-auto max-w-[1300px]">
        <div className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <Eyebrow>How Formme works</Eyebrow>
            <h2 className="font-dm-sans font-semibold leading-[1.15]" style={{ color: INK, fontSize: 'clamp(26px, 3vw, 38px)' }}>
              One production network.<br />Two connected sides.
            </h2>
          </div>
          <p className="font-inter text-[13px] max-w-xs" style={{ color: MUTED2 }}>
            Brands get clearer production visibility. Manufacturers get the tools to run production.
          </p>
        </div>

        <div className="reveal mb-10">
          <WorkflowTabs active={tab} onChange={setTab} />
        </div>

        <div className="reveal grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8 min-w-0">
          <WorkflowStepNav stages={stages} active={activeIndex} onSelect={setActiveIndex} />

          <div className="hidden lg:block" id="workflow-tabpanel" role="tabpanel" aria-labelledby={`workflow-tab-${tab}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${tab}-${activeIndex}`}
                variants={prefersReduced ? panelVariantsReduced : panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <StagePanel>
                  <p className="font-dm-sans font-semibold mb-6" style={{ color: INK, fontSize: 'clamp(18px, 1.8vw, 22px)' }}>
                    {stages[activeIndex].heading}
                  </p>
                  <ActiveVisual reduced={prefersReduced} />
                </StagePanel>
              </motion.div>
            </AnimatePresence>
          </div>

          <WorkflowMobileList stages={stages} reduced={prefersReduced} />
        </div>

        <WorkflowSharedEnding />
      </div>
    </section>
  );
};

/* ════════════════════════════════════════════════
   CONNECTOR — factory operations ↔ brand visibility
════════════════════════════════════════════════ */
const connectorIcons = [LayoutGrid, ClipboardList, Factory, ShieldCheck, Package, BarChart3, Settings];
const factoryOpsRows = [
  { id: 'FM-HOOD-004', brand: 'Brand A', stage: 'Sewing', progress: 72, due: '08 Sep', onTime: true },
  { id: 'FM-TS-101', brand: 'Brand B', stage: 'Finishing', progress: 40, due: '10 Sep', onTime: true },
  { id: 'FM-JOG-201', brand: 'Brand C', stage: 'QA', progress: 60, due: '12 Sep', onTime: false },
  { id: 'FM-SWT-301', brand: 'Brand D', stage: 'Cutting', progress: 100, due: '15 Sep', onTime: true },
  { id: 'FM-SHT-401', brand: 'Brand E', stage: 'Packing', progress: 20, due: '18 Sep', onTime: true },
];

const ConnectorSection = () => (
  <section className="py-20 md:py-24 px-6" style={{ background: BG }}>
    <div className="mx-auto max-w-[1300px] grid lg:grid-cols-[0.8fr_2fr] gap-12 items-start">
      <div className="reveal">
        <Eyebrow>Connector by formme</Eyebrow>
        <h2 className="font-dm-sans font-semibold leading-[1.15] mb-4" style={{ color: INK, fontSize: 'clamp(24px, 2.8vw, 34px)' }}>
          One source of truth for factories and brands.
        </h2>
        <p className="font-inter leading-relaxed mb-7" style={{ color: MUTED2, fontSize: '14px' }}>
          Formme connects people, processes, and data with total visibility — so everyone works from the same real-time data.
        </p>
        <OutlineButton href="#factories">See it in action</OutlineButton>
      </div>

      <div className="reveal grid md:grid-cols-[1.5fr_auto_1fr] gap-4 items-center">
        {/* Dark factory operations panel */}
        <div className="rounded-2xl overflow-hidden flex" style={{ background: DARK_PANEL }}>
          <div className="hidden sm:flex flex-col items-center gap-2 py-4 px-2.5 flex-shrink-0" style={{ borderRight: `1px solid ${BORDER_DARK}` }}>
            {connectorIcons.map((Icon, i) => (
              <span key={i} className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: i === 0 ? PURPLE_BG : 'transparent' }}>
                <Icon className="w-3 h-3" style={{ color: i === 0 ? PURPLE : 'rgba(255,255,255,0.4)' }} />
              </span>
            ))}
          </div>
          <div className="flex-1 min-w-0 p-4">
            <p className="text-[10px] font-dm-sans font-medium mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>Factory Operations</p>
            <div className="hidden sm:grid grid-cols-[1fr_0.7fr_0.7fr_0.6fr_0.5fr] gap-1 mb-2">
              {['Order', 'Brand', 'Stage', 'Progress', 'Due'].map((h) => (
                <span key={h} className="text-[8px] uppercase font-inter" style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</span>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              {factoryOpsRows.map((r) => (
                <div key={r.id} className="grid grid-cols-2 sm:grid-cols-[1fr_0.7fr_0.7fr_0.6fr_0.5fr] gap-1 items-center">
                  <span className="text-[10px] font-inter truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{r.id}</span>
                  <span className="hidden sm:block text-[10px] font-inter truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.brand}</span>
                  <span className="hidden sm:block text-[10px] font-inter truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.stage}</span>
                  <div className="hidden sm:block w-full h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full rounded-full" style={{ width: `${r.progress}%`, background: PURPLE }} />
                  </div>
                  <span className="text-[10px] font-inter text-right sm:text-left" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.due}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Connector badge */}
        <div className="hidden md:flex flex-col items-center gap-2">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: PURPLE }}>
            <img src="/logo-mark.png" alt="" className="w-6 h-6 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          </span>
          <span className="text-[9px] uppercase tracking-[0.1em] font-inter" style={{ color: MUTED }}>Synced</span>
        </div>

        {/* Light brand visibility panel */}
        <div className="rounded-2xl p-4 shadow-md" style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-dm-sans font-medium" style={{ color: INK }}>My Orders</p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[8px] font-inter" style={{ color: GREEN }}><CircleDot className="w-2 h-2" /> On track</span>
              <span className="inline-flex items-center gap-1 text-[8px] font-inter" style={{ color: RED }}><CircleDot className="w-2 h-2" /> At risk</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 mb-4">
            {factoryOpsRows.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <CircleDot className="w-2 h-2 flex-shrink-0" style={{ color: r.onTime ? GREEN : RED }} />
                <span className="text-[10px] font-inter flex-1 truncate" style={{ color: MUTED2 }}>{r.id}</span>
                <div className="w-12 h-[3px] rounded-full overflow-hidden flex-shrink-0" style={{ background: BORDER }}>
                  <div className="h-full rounded-full" style={{ width: `${r.progress}%`, background: PURPLE }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <button className="text-[10px] font-inter font-medium text-center py-2 rounded-lg" style={{ background: PURPLE_BG, color: PURPLE }}>View order details</button>
            <button className="text-[10px] font-inter text-center py-2 rounded-lg" style={{ border: `1px solid ${BORDER}`, color: MUTED2 }}>Faster decisions</button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   BUILT WITH MANUFACTURERS — Supreme Stitch credential
════════════════════════════════════════════════ */
const FactoryFloorSection = () => (
  <section className="py-20 md:py-24 px-6" style={{ background: LAVENDER }} aria-label="Built with Supreme Stitch">
    <div className="mx-auto max-w-[1300px] grid md:grid-cols-2 gap-14 items-center">
      <div className="reveal">
        <Eyebrow>Built with manufacturers</Eyebrow>
        <h2 className="font-dm-sans font-semibold leading-[1.15] mb-4" style={{ color: INK, fontSize: 'clamp(26px, 3.2vw, 40px)' }}>
          Software designed on the factory floor.
        </h2>
        <p className="font-inter leading-relaxed mb-6 max-w-md" style={{ color: MUTED2, fontSize: '15px' }}>
          Formme is built by experienced production leaders who understand the realities of apparel manufacturing.
        </p>
        <p className="text-[11px] uppercase tracking-[0.12em] font-inter font-medium" style={{ color: INK }}>
          Supreme Stitch &nbsp;·&nbsp; Founder
        </p>
      </div>

      <div className="reveal relative rounded-2xl overflow-hidden" style={{ aspectRatio: '4 / 3.1' }}>
        <img src="/factory.jpg" alt="Supreme Stitch factory floor" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(21,19,28,0) 55%, rgba(21,19,28,0.55) 100%)' }} />

        <div className="absolute left-4 right-4 bottom-4 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[12px] font-dm-sans font-semibold" style={{ color: INK }}>Supreme Stitch</p>
              <p className="text-[10px] font-inter" style={{ color: MUTED }}>Bangladesh</p>
            </div>
            <span className="text-[9px] font-inter font-medium px-2.5 py-1 rounded-full" style={{ background: PURPLE_BG, color: PURPLE }}>Production</span>
          </div>
          <p className="text-[9px] uppercase tracking-[0.1em] font-inter mb-1.5" style={{ color: MUTED }}>Production Progress</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ background: BORDER }}>
              <div className="h-full rounded-full" style={{ width: '72%', background: PURPLE }} />
            </div>
            <span className="text-[11px] font-dm-sans font-semibold" style={{ color: INK }}>72%</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[['Capacity Util.', '63%'], ['On-time', '96%'], ['Machines', '220'], ['Operators', '380+']].map(([l, v]) => (
              <div key={l}>
                <p className="text-[11px] font-dm-sans font-semibold" style={{ color: INK }}>{v}</p>
                <p className="text-[8px] font-inter leading-tight" style={{ color: MUTED }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <p className="reveal text-center mt-6 text-[12px] font-inter" style={{ color: MUTED }}>
      <a href="https://www.supremegroupbd.com" target="_blank" rel="noopener noreferrer" className="font-medium" style={{ color: INK, textDecoration: 'underline', textUnderlineOffset: 3 }}>
        supremegroupbd.com
      </a> — Dhaka, Bangladesh
    </p>
  </section>
);

/* ════════════════════════════════════════════════
   MERCH BANNER — quick link into the cost predictor
════════════════════════════════════════════════ */
const MerchBanner = () => (
  <section className="pt-28 md:pt-32 pb-14 px-6" style={{ background: DARK_PANEL }}>
    <div className="mx-auto max-w-[1300px] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <h2 className="reveal font-dm-sans font-semibold leading-[1.15] mb-2" style={{ color: '#fff', fontSize: 'clamp(22px, 2.6vw, 30px)' }}>
          Looking to produce merch?
        </h2>
        <p className="reveal font-inter" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          Get an instant cost estimate for custom T-shirts and hoodies — printing or embroidery, any quantity.
        </p>
      </div>
      <div className="reveal flex-shrink-0">
        <SolidButton href="/cost-predictor">Estimate your cost <ArrowRight className="w-3.5 h-3.5" /></SolidButton>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   FINAL CTA
════════════════════════════════════════════════ */
const FinalCTA = () => (
  <section className="py-20 md:py-24 px-6" style={{ background: BG }}>
    <div className="mx-auto max-w-[1300px] flex flex-col md:flex-row md:items-center md:justify-between gap-8">
      <h2 className="reveal font-dm-sans font-semibold leading-[1.15]" style={{ color: INK, fontSize: 'clamp(28px, 4vw, 46px)' }}>
        Orders. Production. Quality. Shipping.
        <br />
        <span className="font-cormorant italic font-medium" style={{ color: PURPLE }}>Connected.</span>
      </h2>
      <div className="reveal flex flex-col items-start gap-5">
        <p className="font-inter max-w-xs" style={{ color: MUTED2, fontSize: '14px' }}>
          Bring clarity to your production. Delight your customers.
        </p>
        <SolidButton href={CONTACT_HREF}>Get in touch</SolidButton>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   PERSONALIZED EXPERIENCE — placeholder brand/manufacturer variants
   Both currently render the same shared homepage content. Split out now so each
   side's landing experience can be redesigned independently afterward without
   touching the audience gate that routes visitors here.
════════════════════════════════════════════════ */
const HomeContent = ({ prefersReduced }: { prefersReduced: boolean }) => (
  <>
    <MerchBanner />
    <Hero prefersReduced={prefersReduced} />
    <FactoriesSection />
    <WorkflowSection prefersReduced={prefersReduced} />
    <ConnectorSection />
    <FactoryFloorSection />
    <FinalCTA />
  </>
);

const BrandLandingExperience = (props: { prefersReduced: boolean }) => <HomeContent {...props} />;
const ManufacturerLandingExperience = (props: { prefersReduced: boolean }) => <HomeContent {...props} />;

const AUDIENCE_STORAGE_KEY = 'formmeAudience';

const readStoredAudience = (): Audience | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(AUDIENCE_STORAGE_KEY);
    return stored === 'brand' || stored === 'manufacturer' ? stored : null;
  } catch {
    return null;
  }
};

/* ─── Page ─── */
const Index = () => {
  const [audience, setAudienceState] = useState<Audience | null>(readStoredAudience);
  const prefersReduced = useLandingReveal(audience);

  const setAudience = (a: Audience) => {
    try {
      window.localStorage.setItem(AUDIENCE_STORAGE_KEY, a);
    } catch {
      /* ignore storage errors, e.g. private browsing */
    }
    setAudienceState(a);
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: INK }}>
      <SEO
        canonical="/"
        description="Formme is the operating system for fashion production — connecting factories and brands from tech pack to shipment, with live production tracking, quality control and shipment visibility."
      />

      <LandingHeader audience={audience} onSwitchAudience={setAudience} />

      <AnimatePresence mode="wait">
        {!audience ? (
          <motion.div
            key="gate"
            initial={false}
            exit={prefersReduced ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } }}
          >
            <AudienceGate onSelect={setAudience} prefersReduced={prefersReduced} />
          </motion.div>
        ) : (
          <motion.div
            key={audience}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={prefersReduced ? { opacity: 1, transition: { duration: 0.15 } } : { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
            exit={{ opacity: 0, transition: { duration: prefersReduced ? 0.1 : 0.2 } }}
          >
            {audience === 'brand' ? (
              <BrandLandingExperience prefersReduced={prefersReduced} />
            ) : (
              <ManufacturerLandingExperience prefersReduced={prefersReduced} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <LandingFooter />
    </div>
  );
};

export default Index;
