import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, ArrowRight, ArrowDown, ChevronDown, FileText, Shirt, Factory, ShieldCheck, Package,
  LayoutGrid, ClipboardList, BarChart3, Settings, Linkedin, CircleDot, Scissors, Truck,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import BookDemoModal from '@/components/homePage/BookDemoModal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* ─── Palette ─── */
const BG = '#FFFFFF';
const LAVENDER = '#F2EFFC';
const INK = '#15131C';
const DARK_PANEL = '#17151F';
const MUTED = '#9B98A8';
const MUTED2 = '#6B6878';
const BORDER = '#E7E3F5';
const BORDER_DARK = 'rgba(255,255,255,0.1)';
const PURPLE = '#5D52D6';
const PURPLE_BG = 'rgba(93,82,214,0.1)';
const GREEN = '#3FA66E';
const GREEN_BG = 'rgba(63,166,110,0.12)';
const RED = '#C25656';

/* ─── Shared bits ─── */
const Logo = ({ dark = false }: { dark?: boolean }) => (
  <Link to="/" className="inline-flex items-center gap-2">
    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-dm-sans font-bold text-white flex-shrink-0" style={{ background: PURPLE }}>
      b
    </span>
    <span className="text-[17px] font-dm-sans font-semibold" style={{ color: dark ? '#fff' : INK }}>formme</span>
  </Link>
);

const Eyebrow = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <span
    className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-4"
    style={dark ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' } : { background: PURPLE_BG, color: PURPLE }}
  >
    {children}
  </span>
);

const SolidButton = ({ children, onClick, href }: { children: React.ReactNode; onClick?: () => void; href?: string }) => {
  const cls = 'inline-flex items-center gap-1.5 rounded-[10px] px-5 py-3 text-[13px] font-inter font-medium transition-transform duration-300 hover:-translate-y-0.5';
  const style = { background: PURPLE, color: '#fff' };
  if (href) return <Link to={href} className={cls} style={style}>{children}</Link>;
  return <button onClick={onClick} className={cls} style={style}>{children}</button>;
};

const OutlineButton = ({ children, href, dark = false }: { children: React.ReactNode; href: string; dark?: boolean }) => (
  <a
    href={href}
    className="inline-flex items-center gap-1.5 rounded-[10px] px-5 py-3 text-[13px] font-inter font-medium transition-transform duration-300 hover:-translate-y-0.5"
    style={dark ? { border: `1px solid ${BORDER_DARK}`, color: '#fff' } : { border: `1px solid ${BORDER}`, color: INK, background: '#fff' }}
  >
    {children}
  </a>
);

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
   HEADER
════════════════════════════════════════════════ */
const LandingHeader = ({ onBookDemo }: { onBookDemo: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks: { label: string; href: string; route?: boolean; chevron?: boolean }[] = [
    { label: 'Product', href: '#product', chevron: true },
    { label: 'Factories', href: '#factories' },
    { label: 'Brands', href: '#brands' },
    { label: 'Resources', href: '/support', route: true, chevron: true },
    { label: 'Company', href: '/about', route: true, chevron: true },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${scrolled ? 'shadow-sm' : ''}`}
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${scrolled ? BORDER : 'transparent'}` }}
    >
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 md:px-10 h-16 md:h-[72px]">
        <Logo />

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((item) =>
            item.route ? (
              <Link key={item.label} to={item.href} className="inline-flex items-center gap-1 text-[13px] font-inter" style={{ color: MUTED2 }}>
                {item.label}{item.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="inline-flex items-center gap-1 text-[13px] font-inter" style={{ color: MUTED2 }}>
                {item.label}{item.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-5">
          <Link to="/auth?mode=signin" className="hidden sm:inline text-[13px] font-inter font-medium" style={{ color: INK }}>
            Sign in
          </Link>
          <SolidButton onClick={onBookDemo}>Book a demo <ArrowRight className="w-3.5 h-3.5" /></SolidButton>
        </div>
      </div>
    </header>
  );
};

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

const Hero = ({ onBookDemo, prefersReduced }: { onBookDemo: () => void; prefersReduced: boolean }) => {
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
      <div className="mx-auto max-w-[1360px] px-6 pt-28 md:pt-36 pb-20 md:pb-24">
        <div className="grid md:grid-cols-[0.4fr_0.6fr] gap-14 md:gap-8 items-start xl:items-center">
          {/* Left — positioning */}
          <div>
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
              <SolidButton onClick={onBookDemo}>Book a demo</SolidButton>
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
            <div className="hidden xl:grid relative grid-cols-[1fr_auto_0.95fr_auto_1fr] gap-3 items-center w-fit ml-auto">
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
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-dm-sans font-bold text-white flex-shrink-0" style={{ background: PURPLE }}>b</span>
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
            <div className="xl:hidden flex flex-col items-center gap-3">
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
                <div className="relative w-[220px]" style={{ aspectRatio: '766 / 912', perspective: '700px' }}>
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
                </div>
                <div className="relative z-10 mt-4 rounded-xl shadow-md px-4 py-3 flex items-center gap-2.5 w-[240px]" style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-dm-sans font-bold text-white flex-shrink-0" style={{ background: PURPLE }}>b</span>
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
const brandChecklist = ['Live order & production visibility', 'Quality, rework & approvals', 'Shipment tracking & ETAs', 'Fewer follow-ups, more clarity'];

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
const WorkflowStepCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-white p-4 shadow-sm h-full" style={{ border: `1px solid ${BORDER}` }}>{children}</div>
);


const workflowStepBadges = [
  { n: '01', label: 'Tech Pack' },
  { n: '02', label: 'Sampling' },
  { n: '03', label: 'Production' },
  { n: '04', label: 'Quality' },
  { n: '05', label: 'Shipment' },
];

const productionRows: { label: string; value?: string; color?: string; progress?: number }[] = [
  { label: 'Cutting', value: 'Complete', color: GREEN },
  { label: 'Sewing', progress: 72 },
  { label: 'Finishing', value: 'In progress', color: MUTED2 },
  { label: 'Packing', value: 'Upcoming', color: MUTED },
  { label: 'Proving', value: 'Upcoming', color: MUTED },
];

const StatPair = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <div>
    <p className="text-[9px] font-inter mb-1" style={{ color: MUTED }}>{label}</p>
    <p className="font-dm-sans font-bold text-[14px]" style={{ color: color ?? INK }}>{value}</p>
  </div>
);

const WorkflowSection = () => (
  <section id="product" className="py-20 md:py-24 px-6" style={{ background: LAVENDER }}>
    <div className="mx-auto max-w-[1300px]">
      <div className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
        <div>
          <Eyebrow>Powered workflow</Eyebrow>
          <h2 className="font-dm-sans font-semibold leading-[1.15]" style={{ color: INK, fontSize: 'clamp(26px, 3vw, 38px)' }}>
            From tech pack to shipment.
          </h2>
        </div>
        <p className="font-inter text-[13px] max-w-xs" style={{ color: MUTED2 }}>
          One connected flow. Shared data. Fewer handoffs.
        </p>
      </div>

      {/* Step badges — circular numbers linked by a dashed line */}
      <div className="reveal relative hidden md:flex items-center mb-6">
        {workflowStepBadges.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className="flex items-center gap-2 flex-shrink-0 relative z-10 pr-3" style={{ background: LAVENDER }}>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-inter font-semibold flex-shrink-0" style={{ border: `1.5px solid ${PURPLE}`, color: PURPLE }}>{s.n}</span>
              <span className="text-[13px] font-inter font-medium whitespace-nowrap" style={{ color: INK }}>{s.label}</span>
            </div>
            {i < workflowStepBadges.length - 1 && <div className="flex-1 h-0" style={{ borderTop: `1px dashed ${BORDER}` }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="reveal grid grid-cols-2 md:flex md:items-stretch gap-4">
        <div className="md:flex-1 md:min-w-0">
          <p className="md:hidden text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-3" style={{ color: PURPLE }}>01 &nbsp; Tech Pack</p>
          <WorkflowStepCard>
            <div className="rounded-lg mb-3 flex items-center justify-center p-4" style={{ background: '#F7F6FB', aspectRatio: '4/3' }}>
              <img
                src="/mockupHoodieFront.png"
                alt="Tech pack sketch"
                className="w-full h-full object-contain"
                style={{ filter: 'invert(1) brightness(1.15) drop-shadow(0 0 0.6px rgba(21,19,28,0.55))' }}
                loading="lazy"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              {['Specs', 'Measurements', 'BOM', 'Construction'].map((t) => (
                <span key={t} className="text-[10px] font-inter flex items-center gap-1.5" style={{ color: MUTED2 }}>
                  <span className="w-2.5 h-2.5 rounded-[3px] flex items-center justify-center flex-shrink-0" style={{ border: `1.5px solid ${MUTED}` }}>
                    <Check className="w-2 h-2" style={{ color: MUTED }} strokeWidth={4} />
                  </span> {t}
                </span>
              ))}
            </div>
          </WorkflowStepCard>
        </div>

        <div className="hidden md:flex items-center justify-center flex-shrink-0">
          <ArrowRight className="w-4 h-4" style={{ color: MUTED, opacity: 0.5 }} />
        </div>

        <div className="md:flex-1 md:min-w-0">
          <p className="md:hidden text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-3" style={{ color: PURPLE }}>02 &nbsp; Sampling</p>
          <WorkflowStepCard>
            <div className="rounded-lg mb-3 overflow-hidden" style={{ background: DARK_PANEL, aspectRatio: '4/3' }}>
              <img src="/mockupHoodieFront.png" alt="Sample" className="w-full h-full object-cover object-top scale-125" loading="lazy" />
            </div>
            <p className="text-[9px] uppercase tracking-[0.08em] font-inter mb-2" style={{ color: MUTED }}>Fit & approvals</p>
            <div className="flex items-start gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-px" style={{ background: GREEN }}>
                <Check className="w-2 h-2" style={{ color: '#fff' }} strokeWidth={4} />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-inter font-medium" style={{ color: INK }}>Sample approved</span>
                <span className="text-[9px] font-inter" style={{ color: MUTED }}>08 Jul</span>
              </div>
            </div>
          </WorkflowStepCard>
        </div>

        <div className="hidden md:flex items-center justify-center flex-shrink-0">
          <ArrowRight className="w-4 h-4" style={{ color: MUTED, opacity: 0.5 }} />
        </div>

        <div className="md:flex-1 md:min-w-0">
          <p className="md:hidden text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-3" style={{ color: PURPLE }}>03 &nbsp; Production</p>
          <WorkflowStepCard>
            <div className="flex flex-col gap-2.5">
              {productionRows.map((r) => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-[11px] font-inter" style={{ color: INK }}>{r.label}</span>
                  {r.progress !== undefined ? (
                    <div className="w-16 h-[3px] rounded-full overflow-hidden flex-shrink-0" style={{ background: BORDER }}>
                      <div className="h-full rounded-full" style={{ width: `${r.progress}%`, background: PURPLE }} />
                    </div>
                  ) : (
                    <span className="text-[10px] font-inter" style={{ color: r.color }}>{r.value}</span>
                  )}
                </div>
              ))}
            </div>
          </WorkflowStepCard>
        </div>

        <div className="hidden md:flex items-center justify-center flex-shrink-0">
          <ArrowRight className="w-4 h-4" style={{ color: MUTED, opacity: 0.5 }} />
        </div>

        <div className="md:flex-1 md:min-w-0">
          <p className="md:hidden text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-3" style={{ color: PURPLE }}>04 &nbsp; Quality</p>
          <WorkflowStepCard>
            <div className="flex flex-col gap-3">
              <StatPair label="Inspection" value="Line 04" />
              <StatPair label="Passed" value="352 PCS" color={GREEN} />
              <StatPair label="Failed" value="12 PCS" color={RED} />
            </div>
          </WorkflowStepCard>
        </div>

        <div className="hidden md:flex items-center justify-center flex-shrink-0">
          <ArrowRight className="w-4 h-4" style={{ color: MUTED, opacity: 0.5 }} />
        </div>

        <div className="md:flex-1 md:min-w-0">
          <p className="md:hidden text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-3" style={{ color: PURPLE }}>05 &nbsp; Shipment</p>
          <WorkflowStepCard>
            <div className="flex flex-col gap-3">
              <StatPair label="Ready to ship" value="600 PCS" />
              <StatPair label="ETD" value="10 Sep" />
              <StatPair label="ETA" value="22 Sep" />
            </div>
          </WorkflowStepCard>
        </div>
      </div>
    </div>
  </section>
);

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
          <span className="w-10 h-10 rounded-xl flex items-center justify-center text-[16px] font-dm-sans font-bold text-white shadow-lg" style={{ background: PURPLE }}>b</span>
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
   FINAL CTA
════════════════════════════════════════════════ */
const FinalCTA = ({ onBookDemo }: { onBookDemo: () => void }) => (
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
        <SolidButton onClick={onBookDemo}>Book a demo</SolidButton>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   FOOTER
════════════════════════════════════════════════ */
const footerLinks = [
  { label: 'Product', to: '#product' },
  { label: 'Factories', to: '#factories' },
  { label: 'Brands', to: '#brands' },
  { label: 'Resources', to: '/support' },
  { label: 'Company', to: '/about' },
];

const LandingFooter = () => (
  <footer style={{ background: BG, borderTop: `1px solid ${BORDER}` }}>
    <div className="mx-auto max-w-[1300px] px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <Logo />
      <nav className="flex flex-wrap items-center gap-x-8 gap-y-2">
        {footerLinks.map((l) =>
          l.to.startsWith('/') ? (
            <Link key={l.label} to={l.to} className="text-[13px] font-inter" style={{ color: MUTED2 }}>{l.label}</Link>
          ) : (
            <a key={l.label} href={l.to} className="text-[13px] font-inter" style={{ color: MUTED2 }}>{l.label}</a>
          )
        )}
      </nav>
      <div className="flex items-center gap-5">
        <a href="https://www.linkedin.com/company/formmedesign" target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>
          <Linkedin className="h-4 w-4" />
        </a>
        <span className="text-[12px] font-inter" style={{ color: MUTED }}>© {new Date().getFullYear()} Formme. All rights reserved.</span>
      </div>
    </div>
  </footer>
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
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: INK }}>
      <SEO
        canonical="/"
        description="Formme is the operating system for fashion production — connecting factories and brands from tech pack to shipment, with live production tracking, quality control and shipment visibility."
      />

      <LandingHeader onBookDemo={() => setShowBookDemo(true)} />

      <Hero onBookDemo={() => setShowBookDemo(true)} prefersReduced={prefersReduced} />
      <FactoriesSection />
      <WorkflowSection />
      <ConnectorSection />
      <FactoryFloorSection />
      <FinalCTA onBookDemo={() => setShowBookDemo(true)} />

      <LandingFooter />

      <BookDemoModal open={showBookDemo} onOpenChange={setShowBookDemo} />
    </div>
  );
};

export default Index;
