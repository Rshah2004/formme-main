import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/Navbar';
import Footer from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* ─── Chat ─── */
const chatMessages = [
  { from: 'brand',  text: 'Tech pack approved — when does sampling start?' },
  { from: 'formme', text: 'Factory confirmed. Proto sample ships in 12 days.' },
  { from: 'brand',  text: 'Fit looks off on the shoulder. Can we revise?' },
  { from: 'formme', text: 'Revision sent to factory. Fit sample ETA updated.' },
];

const ChatUI = () => (
  <div className="chat-ui-wrap w-full max-w-[600px] mx-auto">
    <div className="border-t border-[#E8E3DA]" />
    <div className="py-14 md:py-16 space-y-10">
      {chatMessages.map((msg, i) => (
        <div
          key={i}
          className={`chat-msg msg-from-${msg.from} flex flex-col gap-1.5 ${
            msg.from === 'brand' ? 'items-end' : 'items-start'
          }`}
        >
          <span className="text-[11px] uppercase tracking-[0.38em] text-[#AEAEAA] font-inter">
            {msg.from === 'brand' ? 'Brand' : 'formme'}
          </span>
          <p className={`text-[17px] font-dm-sans font-light leading-relaxed text-[#0D0D0D] max-w-[380px] ${
            msg.from === 'brand' ? 'text-right' : 'text-left'
          }`}>
            {msg.text}
          </p>
        </div>
      ))}
    </div>
    <div className="border-b border-[#E8E3DA]" />
  </div>
);

/* ─── Process steps ─── */
const processSteps = [
  { num: '01', label: 'You design.' },
  { num: '02', label: 'We build your tech pack.' },
  { num: '03', label: 'We source your factory.' },
  { num: '04', label: 'Sampling & sign-off.' },
  { num: '05', label: 'We run production.' },
  { num: '06', label: 'QC & delivery.' },
];

/* ─── Needle SVG ─── */
const NeedleSVG = () => (
  <svg width="18" height="100" viewBox="0 0 18 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Needle body — tapers to point at bottom */}
    <path
      d="M9 100 C8 86 6.5 70 6.5 50 L6.5 24 C6.5 10 7.5 0 9 0 C10.5 0 11.5 10 11.5 24 L11.5 50 C11.5 70 10 86 9 100 Z"
      fill="#F5F0E8"
    />
    {/* Eye — hollow oval */}
    <ellipse cx="9" cy="17" rx="2.4" ry="4.2" fill="transparent" stroke="#F5F0E8" strokeWidth="1.1" />
    {/* Inner eye — dark fill to look like a hole */}
    <ellipse cx="9" cy="17" rx="1.3" ry="3" fill="#1A1814" />
    {/* Subtle highlight */}
    <path d="M8 28 L7.5 72" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" strokeLinecap="round" />
  </svg>
);

/* ─── Factory door section ─── */
const factorySteps = [
  {
    label: 'Pattern cutting',
    desc: 'Cut to your exact tech pack specs',
    style: { top: '18%', left: '7%' } as React.CSSProperties,
  },
  {
    label: 'Industrial stitching',
    desc: 'Sewn on factory-grade machines',
    style: { top: '34%', right: '7%' } as React.CSSProperties,
  },
  {
    label: 'Quality control',
    desc: 'Every piece checked before sign-off',
    style: { bottom: '32%', left: '7%' } as React.CSSProperties,
  },
  {
    label: 'Final pressing & pack',
    desc: 'Finished and ready for delivery',
    style: { bottom: '18%', right: '7%' } as React.CSSProperties,
  },
];

const DoorSection = () => (
  <section
    className="door-pin relative h-screen overflow-hidden bg-[#0D0D0D]"
    aria-label="Inside manufacturing"
  >
    {/* Factory backdrop — drop /public/factory.jpg (pexels.com → "sewing factory") */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'url(/factory.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        filter: 'brightness(0.52) sepia(0.15)',
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at center, transparent 22%, rgba(8,7,6,0.78) 100%)' }}
    />

    {/* 3D door wrapper */}
    <div className="absolute inset-0" style={{ perspective: '1200px' }}>
      {/* Left panel */}
      <div
        className="door-left absolute inset-y-0 left-0 w-1/2 bg-[#1A1814]"
        style={{ transformOrigin: 'left center', willChange: 'transform' }}
      >
        <div className="absolute inset-[9%_7%] border border-[#252320] pointer-events-none" />
        <div className="absolute inset-[20%_11%] border border-[#252320] pointer-events-none" />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-[#2E2B28] rounded-full" />
      </div>

      {/* Right panel */}
      <div
        className="door-right absolute inset-y-0 right-0 w-1/2 bg-[#1A1814]"
        style={{ transformOrigin: 'right center', willChange: 'transform' }}
      >
        <div className="absolute inset-[9%_7%] border border-[#252320] pointer-events-none" />
        <div className="absolute inset-[20%_11%] border border-[#252320] pointer-events-none" />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-[#2E2B28] rounded-full" />
      </div>
    </div>

    {/* Centre seam */}
    <div
      className="door-seam absolute inset-y-0 left-1/2 -translate-x-1/2 w-px z-10 pointer-events-none"
      style={{ background: 'rgba(0,0,0,0.75)' }}
    />

    {/* Header — fades in after doors open */}
    <div
      className="door-header absolute top-12 inset-x-0 flex flex-col items-center z-20 pointer-events-none"
      style={{ opacity: 0 }}
    >
      <p className="text-[11px] uppercase tracking-[0.45em] text-[#F5F0E8]/40 font-inter mb-4">
        What we handle
      </p>
      <p
        className="font-cormorant font-light text-[#F5F0E8] text-center leading-tight"
        style={{ fontSize: 'clamp(28px, 3.8vw, 52px)' }}
      >
        Inside your production.
      </p>
    </div>

    {/* Step annotations — stagger in */}
    {factorySteps.map((step, i) => (
      <div
        key={i}
        className={`door-step-${i} absolute z-20 pointer-events-none`}
        style={{ ...step.style, opacity: 0, transform: 'translateY(10px)' }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#C97B5A] flex-shrink-0" />
          <span className="text-[13px] uppercase tracking-[0.3em] text-[#F5F0E8] font-inter font-medium">
            {step.label}
          </span>
        </div>
        <p className="text-[14px] font-dm-sans font-light text-[#F5F0E8]/60 leading-snug pl-[22px]">
          {step.desc}
        </p>
      </div>
    ))}

    {/* Bottom note */}
    <div
      className="door-bottom-note absolute bottom-10 inset-x-0 flex justify-center z-20 pointer-events-none"
      style={{ opacity: 0 }}
    >
      <p className="text-[12px] uppercase tracking-[0.35em] text-[#F5F0E8]/35 font-inter">
        Formme manages every step between your design and the final garment
      </p>
    </div>
  </section>
);

/* ─── Process section ─── */
const ProcessSection = () => (
  <section
    className="process-pin relative h-screen overflow-hidden flex items-center justify-center"
    aria-label="How it works"
  >
    {/* Background — GSAP transitions this from #F5F0E8 to #1A1814 */}
    <div className="process-bg absolute inset-0" style={{ backgroundColor: '#F5F0E8' }} />

    {/* Content column */}
    <div className="relative z-10 flex flex-col items-center text-center select-none">

      {/* Needle */}
      <div className="process-needle" style={{ opacity: 0, transform: 'translateY(-10px)' }}>
        <NeedleSVG />
      </div>

      {/* Thread from needle eye to first step */}
      <div
        className="process-thread"
        style={{
          width: 0,
          borderLeft: '1px dashed rgba(245,240,232,0.22)',
          height: '28px',
          transform: 'scaleY(0)',
          transformOrigin: 'top center',
          marginTop: '2px',
        }}
      />

      {/* Steps + connecting stitches */}
      {processSteps.map((step, i) => (
        <React.Fragment key={i}>
          <div
            className={`process-step-${i} flex flex-col items-center gap-0.5`}
            style={{ opacity: 0, transform: 'translateY(12px)' }}
          >
            <span
              className="font-inter uppercase tracking-[0.45em] text-[#F5F0E8]"
              style={{ fontSize: '10px', opacity: 0.35 }}
            >
              {step.num}
            </span>
            <span
              className="font-cormorant font-light text-[#F5F0E8] leading-tight"
              style={{ fontSize: 'clamp(20px, 2.4vw, 34px)' }}
            >
              {step.label}
            </span>
          </div>

          {i < processSteps.length - 1 && (
            <div
              className={`stitch-${i}`}
              style={{
                width: 0,
                borderLeft: '1px dashed rgba(245,240,232,0.18)',
                height: '22px',
                transform: 'scaleY(0)',
                transformOrigin: 'top center',
              }}
            />
          )}
        </React.Fragment>
      ))}

      {/* Tagline */}
      <p
        className="process-tagline font-inter uppercase tracking-[0.5em] text-[#F5F0E8] mt-10"
        style={{ fontSize: '10px', opacity: 0 }}
      >
        Production starts in days, not months
      </p>
    </div>
  </section>
);

/* ─── Page ─── */
const Index = () => {
  const [email, setEmail] = useState('');
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq?.matches ?? false);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq?.addEventListener('change', handler);
    return () => mq?.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Lenis smooth scroll only on desktop — mobile uses native scroll
    // which is far smoother with touch momentum and avoids scroll lag on iOS/Android
    const isMobile = window.innerWidth < 768;
    let lenis: InstanceType<typeof Lenis> | null = null;
    let rafFn: ((time: number) => void) | null = null;
    if (!isMobile) {
      lenis = new Lenis({
        duration: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenis.on('scroll', ScrollTrigger.update);
      rafFn = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(rafFn);
      gsap.ticker.lagSmoothing(0);
    } else {
      // On mobile, still hook native scroll into ScrollTrigger
      ScrollTrigger.addEventListener('refresh', () => ScrollTrigger.update());
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ── Desktop hero pin ── */
      mm.add('(min-width: 768px)', () => {
        gsap.set('.hero-line2', { opacity: 0, y: '10vh' });

        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.hero-pin',
            start: 'top top',
            end: '+=280vh',
            pin: true,
            scrub: 1.5,
            anticipatePin: 1,
            onLeave: () => {
              if (lenis) lenis.scrollTo('.process-pin', { duration: 0.8 });
            },
          },
        });

        heroTl
          .to('.hero-you',    { x: '-44vw', scale: 1.12, ease: 'none', duration: 1 }, 0)
          .to('.hero-design', { x:  '44vw', scale: 1.12, ease: 'none', duration: 1 }, 0)
          .to('.hero-line2',  { opacity: 1, y: 0, ease: 'none', duration: 0.85 }, 0.45)
          .to('.hero-you',    { opacity: 0, x: '-52vw', ease: 'none', duration: 0.9 }, 1.5)
          .to('.hero-design', { opacity: 0, x:  '52vw', ease: 'none', duration: 0.9 }, 1.5)
          .to('.hero-line2',  { opacity: 0, y: '10vh',  ease: 'none', duration: 0.9 }, 1.5)
          ;
      });

      /* ── Desktop process pin ── */
      mm.add('(min-width: 768px)', () => {
        const processTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.process-pin',
            start: 'top top',
            end: '+=500vh',
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            onLeave: () => {
              setTimeout(() => {
                const target = document.querySelector('.door-pin') as HTMLElement | null;
                if (!target) return;
                if (lenis) {
                  lenis.scrollTo(target, { duration: 1.0 });
                } else {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 80);
            },
          },
        });

        processTl
          // Darken background
          .to('.process-bg', { backgroundColor: '#1A1814', ease: 'none', duration: 0.18 }, 0)
          // Needle drops in
          .to('.process-needle', { opacity: 1, y: 0, ease: 'none', duration: 0.14 }, 0.12)
          // Thread from needle draws
          .to('.process-thread', { scaleY: 1, ease: 'none', duration: 0.1 }, 0.22)
          // Step 01
          .to('.process-step-0', { opacity: 1, y: 0, ease: 'none', duration: 0.14 }, 0.28)
          // Stitch 0
          .to('.stitch-0', { scaleY: 1, ease: 'none', duration: 0.09 }, 0.40)
          // Step 02
          .to('.process-step-1', { opacity: 1, y: 0, ease: 'none', duration: 0.14 }, 0.46)
          // Stitch 1
          .to('.stitch-1', { scaleY: 1, ease: 'none', duration: 0.09 }, 0.57)
          // Step 03
          .to('.process-step-2', { opacity: 1, y: 0, ease: 'none', duration: 0.14 }, 0.63)
          // Stitch 2
          .to('.stitch-2', { scaleY: 1, ease: 'none', duration: 0.09 }, 0.73)
          // Step 04
          .to('.process-step-3', { opacity: 1, y: 0, ease: 'none', duration: 0.14 }, 0.79)
          // Stitch 3
          .to('.stitch-3', { scaleY: 1, ease: 'none', duration: 0.09 }, 0.88)
          // Step 05
          .to('.process-step-4',   { opacity: 1, y: 0, ease: 'none', duration: 0.14 }, 0.92)
          // Stitch 4
          .to('.stitch-4',         { scaleY: 1, ease: 'none', duration: 0.09 }, 0.94)
          // Step 06 + tagline
          .to('.process-step-5',   { opacity: 1, y: 0, ease: 'none', duration: 0.14 }, 0.96)
          .to('.process-tagline',  { opacity: 0.28, ease: 'none', duration: 0.1 }, 0.99)
          // Start needle bobbing once it's visible (looping tween outside scrub)
          .call(() => {
            gsap.to('.process-needle', {
              y: 6, yoyo: true, repeat: -1, duration: 0.85, ease: 'sine.inOut',
            });
          }, undefined, 0.26);
      });

      /* ── Mobile — NO pins, NO scrub. Hero auto-plays; process+door fire once on enter. ── */
      mm.add('(max-width: 767px)', () => {
        // Hero: GSAP pin with pinType fixed (GPU layer, smooth on iOS)
        gsap.set('.hero-line2', { opacity: 0, y: '5vh' });

        const mHeroTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.hero-pin',
            start: 'top top',
            end: '+=180vh',
            pin: true,
            pinType: 'fixed',
            scrub: true,
            anticipatePin: 1,
          },
        });
        mHeroTl
          .to('.hero-you',    { x: '-110vw', ease: 'none', duration: 0.45 }, 0)
          .to('.hero-design', { x:  '110vw', ease: 'none', duration: 0.45 }, 0)
          .to('.hero-line2',  { opacity: 1, y: 0,     ease: 'none', duration: 0.20 }, 0.42)
          .to('.hero-line2',  { opacity: 0, y: '-8vh', ease: 'none', duration: 0.15 }, 0.85);

        // Process: set hidden, then play once when section enters viewport
        gsap.set(['.process-needle', '.process-thread',
                  '.process-step-0', '.process-step-1', '.process-step-2',
                  '.process-step-3', '.process-step-4', '.process-step-5',
                  '.stitch-0', '.stitch-1', '.stitch-2', '.stitch-3', '.stitch-4',
                  '.process-tagline'], { opacity: 0, y: 14 });

        gsap.to('.process-bg', {
          backgroundColor: '#1A1814', duration: 0.5,
          scrollTrigger: { trigger: '.process-pin', start: 'top 75%', once: true },
        });
        gsap.to(['.process-needle', '.process-thread',
                 '.process-step-0', '.process-step-1', '.process-step-2',
                 '.process-step-3', '.process-step-4', '.process-step-5',
                 '.stitch-0', '.stitch-1', '.stitch-2', '.stitch-3', '.stitch-4',
                 '.process-tagline'], {
          opacity: 1, y: 0, stagger: 0.07, duration: 0.35, ease: 'power2.out',
          scrollTrigger: { trigger: '.process-pin', start: 'top 65%', once: true },
        });

        // Door: pinType fixed — stays in place while doors open + steps reveal on scroll
        gsap.set(['.door-header', '.door-step-0', '.door-step-1',
                  '.door-step-2', '.door-step-3', '.door-bottom-note'], { opacity: 0, y: 14 });

        const mDoorTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.door-pin',
            start: 'top top',
            end: '+=180vh',
            pin: true,
            pinType: 'fixed',
            scrub: true,
            anticipatePin: 1,
          },
        });
        mDoorTl
          .to('.door-left',        { x: '-100%',  ease: 'none', duration: 0.40 }, 0)
          .to('.door-right',       { x:  '100%',  ease: 'none', duration: 0.40 }, 0)
          .to('.door-seam',        { opacity: 0,   ease: 'none', duration: 0.15 }, 0.10)
          .to('.door-header',      { opacity: 1, y: 0, ease: 'none', duration: 0.15 }, 0.38)
          .to('.door-step-0',      { opacity: 1, y: 0, ease: 'none', duration: 0.12 }, 0.50)
          .to('.door-step-1',      { opacity: 1, y: 0, ease: 'none', duration: 0.12 }, 0.62)
          .to('.door-step-2',      { opacity: 1, y: 0, ease: 'none', duration: 0.12 }, 0.74)
          .to('.door-step-3',      { opacity: 1, y: 0, ease: 'none', duration: 0.12 }, 0.84)
          .to('.door-bottom-note', { opacity: 1,   ease: 'none', duration: 0.10 }, 0.94);
      });

      /* ── Door: factory reveal ── */
      mm.add('(min-width: 768px)', () => {
        const doorTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.door-pin',
            start: 'top top',
            end: '+=400vh',
            pin: true,
            scrub: 1.5,
            anticipatePin: 1,
            onLeave: () => {
              setTimeout(() => {
                const target = document.querySelector('.chat-section') as HTMLElement | null;
                if (!target) return;
                if (lenis) {
                  lenis.scrollTo(target, { duration: 1.0 });
                } else {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 80);
            },
          },
        });

        doorTl
          // Doors swing open
          .to('.door-left',         { rotateY: -90, ease: 'none', duration: 0.46 }, 0)
          .to('.door-right',        { rotateY:  90, ease: 'none', duration: 0.46 }, 0)
          .to('.door-seam',         { opacity: 0,   ease: 'none', duration: 0.14 }, 0.16)
          // Header fades in
          .to('.door-header',       { opacity: 1,   ease: 'none', duration: 0.18 }, 0.44)
          // Step annotations stagger in with descriptions
          .to('.door-step-0',       { opacity: 1, y: 0, ease: 'none', duration: 0.16 }, 0.54)
          .to('.door-step-1',       { opacity: 1, y: 0, ease: 'none', duration: 0.16 }, 0.64)
          .to('.door-step-2',       { opacity: 1, y: 0, ease: 'none', duration: 0.16 }, 0.74)
          .to('.door-step-3',       { opacity: 1, y: 0, ease: 'none', duration: 0.16 }, 0.83)
          // Bottom note last
          .to('.door-bottom-note',  { opacity: 1,   ease: 'none', duration: 0.14 }, 0.92);
      });

      /* ── Chat: alternating x-slide ── */
      const chatTl = gsap.timeline({
        scrollTrigger: { trigger: '.chat-ui-wrap', start: 'top 78%', once: true },
      });
      gsap.utils.toArray<HTMLElement>('.chat-msg').forEach((el, i) => {
        const fromBrand = el.classList.contains('msg-from-brand');
        chatTl.from(el, { opacity: 0, x: fromBrand ? 32 : -32, duration: 0.7, ease: 'power2.out' }, i * 0.44);
      });

      /* ── Pain: stacked → separated (scrub) ── */
      gsap.set('.pain-line-0', { y: '1.5em' });
      gsap.set('.pain-line-2', { y: '-1.5em' });
      gsap.timeline({
        scrollTrigger: { trigger: '.pain-section', start: 'top 72%', end: 'center 48%', scrub: 1.2 },
      })
        .to('.pain-line-0', { y: 0, ease: 'none' }, 0)
        .to('.pain-line-2', { y: 0, ease: 'none' }, 0);

      /* ── Stats: count up ── */
      const statDefs = [
        { sel: '.stat-count-0', from: 0,   to: 8,   suffix: '',  dur: 2.0 },
        { sel: '.stat-count-1', from: 0,   to: 4,   suffix: '+', dur: 2.2 },
        { sel: '.stat-count-2', from: 12,  to: 0,   suffix: '',  dur: 2.8 },
        { sel: '.stat-count-3', from: 0,   to: 150, suffix: '+', dur: 2.5 },
      ];
      statDefs.forEach(({ sel, from, to, suffix, dur }) => {
        const obj = { val: from };
        const el = document.querySelector<HTMLElement>(sel);
        if (!el) return;
        el.textContent = from + suffix;
        gsap.to(obj, {
          val: to, duration: dur, ease: 'power2.out',
          scrollTrigger: { trigger: sel, start: 'top 88%', once: true },
          onUpdate() { el.textContent = Math.round(obj.val) + suffix; },
        });
      });

      /* ── Generic reveals ── */
      gsap.utils.toArray<Element>('.reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 32, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      gsap.from('.service-item', {
        opacity: 0, x: -20, stagger: 0.1, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: '.services-list', start: 'top 85%', once: true },
      });

      gsap.from('.closing-cta', {
        opacity: 0, y: 28, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.closing-cta', start: 'top 88%', once: true },
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (lenis) {
        lenis.destroy();
        if (rafFn) gsap.ticker.remove(rafFn);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#0D0D0D] overflow-x-hidden">
      <NavBar />

      {/* ════════════════════════════════════════════════
          HERO — Desktop pinned scroll transform
      ════════════════════════════════════════════════ */}
      <section className="hero-pin relative h-screen overflow-hidden" aria-label="Hero">
        {!prefersReduced ? (
          <>
            <video
              className="absolute inset-0 w-full h-full object-cover blur-[28px] scale-110"
              autoPlay muted loop playsInline preload="metadata"
            >
              <source src="/backgroundVideo.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[#F5F0E8]/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#F5F0E8]" />
        )}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span
            className="hero-you font-cormorant font-light text-[#0D0D0D] whitespace-nowrap"
            style={{ fontSize: 'clamp(56px, 12vw, 180px)', display: 'inline-block' }}
          >
            YOU
          </span>
          <span aria-hidden="true" style={{ display: 'inline-block', width: '0.22em', fontSize: 'clamp(56px, 12vw, 180px)' }} />
          <span
            className="hero-design font-cormorant font-light text-[#0D0D0D] whitespace-nowrap"
            style={{ fontSize: 'clamp(56px, 12vw, 180px)', display: 'inline-block' }}
          >
            DESIGN.
          </span>
        </div>

        <div className="hero-line2 absolute inset-0 flex items-center justify-center pointer-events-none select-none px-6">
          <span
            className="font-cormorant font-light text-[#0D0D0D] text-center leading-tight"
            style={{ fontSize: 'clamp(26px, 7.2vw, 106px)' }}
          >
            WE HANDLE THE REST.
          </span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PROCESS — dark pinned stitch reveal
      ════════════════════════════════════════════════ */}
      <ProcessSection />

      {/* ════════════════════════════════════════════════
          DOOR — factory reveal
      ════════════════════════════════════════════════ */}
      <DoorSection />

      {/* ════════════════════════════════════════════════
          CREDIBILITY BAR
      ════════════════════════════════════════════════ */}
      <section className="border-y border-[#E8E3DA] py-12 px-6 reveal">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col sm:flex-row items-center justify-center gap-y-3 gap-x-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.42em] text-[#AEAEAA] font-inter flex-shrink-0">
            Our manufacturers have produced for
          </p>
          <span className="hidden sm:block text-[#D0C8BC] text-lg">·</span>
          <p className="font-cormorant font-light text-[#0D0D0D]" style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', letterSpacing: '0.08em' }}>
            Fanatics&nbsp;&nbsp;·&nbsp;&nbsp;Champions&nbsp;&nbsp;·&nbsp;&nbsp;US Polo Assn&nbsp;&nbsp;·&nbsp;&nbsp;Old Navy
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PRODUCT CHAT
      ════════════════════════════════════════════════ */}
      <section className="chat-section py-40 md:py-44 px-6 flex flex-col items-center border-b border-[#E8E3DA]">
        <p className="reveal text-[10px] uppercase tracking-[0.45em] text-[#AEAEAA] font-inter mb-6 text-center">
          What formme does
        </p>
        <p className="reveal font-cormorant font-light text-[#0D0D0D] text-center mb-24 leading-[1.2]" style={{ fontSize: 'clamp(28px, 3.5vw, 48px)' }}>
          Every production problem, handled.
        </p>
        <ChatUI />
      </section>

      {/* ════════════════════════════════════════════════
          PAIN — stacked lines separate on scroll
      ════════════════════════════════════════════════ */}
      <section className="pain-section py-40 md:py-48 px-6 text-center overflow-hidden border-b border-[#E8E3DA]">
        <div className="max-w-3xl mx-auto">
          <p className="reveal text-[10px] uppercase tracking-[0.45em] text-[#AEAEAA] font-inter mb-16">
            The reality of production
          </p>
          <p className="pain-line-0 font-cormorant font-light text-[#0D0D0D] leading-[1.25]" style={{ fontSize: 'clamp(24px, 4vw, 54px)' }}>
            Factories go quiet.
          </p>
          <p className="pain-line-1 font-cormorant font-light text-[#0D0D0D] leading-[1.25]" style={{ fontSize: 'clamp(24px, 4vw, 54px)' }}>
            Samples come back wrong.
          </p>
          <p className="pain-line-2 font-cormorant font-light italic text-[#0D0D0D] leading-[1.25]" style={{ fontSize: 'clamp(24px, 4vw, 54px)' }}>
            You're running production instead of your brand.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          WHAT WE HANDLE
      ════════════════════════════════════════════════ */}
      <section className="py-40 md:py-44 px-6 md:px-16 border-b border-[#E8E3DA]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1.05fr_0.95fr] gap-16 md:gap-24 items-start">
          <div>
            <p className="reveal text-[10px] uppercase tracking-[0.45em] text-[#AEAEAA] font-inter mb-6">
              What we handle
            </p>
            <h3 className="reveal font-cormorant font-medium text-[#0D0D0D] leading-[1.06]" style={{ fontSize: 'clamp(34px, 4.8vw, 68px)' }}>
              Everything between your design and the final garment.
            </h3>
          </div>
          <div className="services-list pt-2">
            {[
              'Tech pack generation',
              'Manufacturer matching & costing',
              'Proto, fit & PP sampling rounds',
              'Production, QC & delivery',
            ].map((item, i, arr) => (
              <div
                key={i}
                className={`service-item flex items-baseline gap-6 py-7 ${i < arr.length - 1 ? 'border-b border-[#E8E3DA]' : ''}`}
              >
                <span className="text-[#AEAEAA] font-inter text-sm font-light select-none flex-shrink-0">—</span>
                <span className="text-[17px] font-dm-sans font-light text-[#0D0D0D] tracking-[-0.01em] leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          STATS — count up
      ════════════════════════════════════════════════ */}
      <section className="py-44 md:py-48 px-6 border-b border-[#E8E3DA]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { cls: 'stat-count-0', init: '0',  label: 'vetted\nmanufacturers', sub: 'BGD · IND · CHN · PAK · CAN' },
            { cls: 'stat-count-1', init: '0',  label: 'major\nbrands served',  sub: null },
            { cls: 'stat-count-3', init: '0',  label: 'garments under\nproduction', sub: null },
            { cls: 'stat-count-2', init: '12', label: 'production fires\nyou ever fight', sub: null },
          ].map(({ cls, init, label, sub }) => (
            <div key={cls} className="flex flex-col items-center gap-4">
              <span
                className={`${cls} font-cormorant font-light text-[#0D0D0D] leading-none`}
                style={{ fontSize: 'clamp(60px, 10vw, 140px)' }}
              >
                {init}
              </span>
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-[10px] uppercase tracking-[0.38em] text-[#AEAEAA] font-inter leading-[1.9] whitespace-pre-line text-center">
                  {label}
                </p>
                {sub && (
                  <p className="text-[10px] tracking-[0.12em] text-[#AEAEAA]/60 font-inter font-light text-center">
                    {sub}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SOCIAL PROOF LINE
      ════════════════════════════════════════════════ */}
      <section className="py-32 md:py-36 px-6 reveal border-b border-[#E8E3DA]">
        <p className="text-center text-[10px] uppercase tracking-[0.5em] text-[#AEAEAA] font-inter">
          Now working with independent brands across North America
        </p>
      </section>

      {/* ════════════════════════════════════════════════
          CLOSING CTA — dark
      ════════════════════════════════════════════════ */}
      <section className="closing-cta bg-[#0D0D0D] py-44 md:py-48 px-6 flex flex-col items-center text-center">
        <p className="text-[10px] uppercase tracking-[0.45em] text-[#555550] font-inter mb-8">
          Early access
        </p>
        <h2
          className="font-cormorant font-light text-white leading-[1.08] mb-14 max-w-xl"
          style={{ fontSize: 'clamp(34px, 5.5vw, 76px)' }}
        >
          Ready to only think about design?
        </h2>

        <form
          className="flex items-end border-b border-[#333330] w-full max-w-[320px] mb-10"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/auth?mode=signup&email=${encodeURIComponent(email)}`;
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 pb-3 pt-1 text-[13px] bg-transparent outline-none font-dm-sans font-light text-white placeholder:text-[#555550]"
          />
          <button
            type="submit"
            className="pb-3 pt-1 pl-3 text-base font-light text-white hover:text-[#C97B5A] transition-colors duration-300"
            aria-label="Submit"
          >
            →
          </button>
        </form>

        <p className="text-[12px] text-[#555550] font-inter font-light">
          or write to us at{' '}
          <a href="mailto:formme.design@gmail.com" className="cta-link text-[#AEAEAA] text-[12px]">
            formme.design@gmail.com
          </a>
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
