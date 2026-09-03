import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, ArrowRight, ArrowUp, ChevronDown, FileText, Ruler, Factory, ShieldCheck, Package,
  LayoutGrid, ClipboardList, BarChart3, Settings, Linkedin, CircleDot,
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

const TagRow = ({ label, value, swatch }: { label: string; value: string; swatch?: string }) => (
  <div className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: BORDER }}>
    <span className="text-[11px] font-inter" style={{ color: MUTED }}>{label}</span>
    <span className="text-[12px] font-dm-sans flex items-center gap-1.5" style={{ color: INK }}>
      {swatch && <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: swatch }} />}
      {value}
    </span>
  </div>
);

const ChecklistRow = ({ label, done, note, progress }: { label: string; done?: boolean; note: string; progress?: number }) => (
  <div className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: BORDER }}>
    <div className="flex items-center gap-2">
      <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: done ? GREEN_BG : '#F1F0F4' }}>
        {done && <Check className="w-2.5 h-2.5" style={{ color: GREEN }} strokeWidth={3.5} />}
      </span>
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
      <span className="text-[10px] font-inter" style={{ color: done ? GREEN : MUTED }}>{note}</span>
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

        <nav className="hidden md:flex items-center gap-8">
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
          <SolidButton onClick={onBookDemo}>Book a demo</SolidButton>
        </div>
      </div>
    </header>
  );
};

/* ════════════════════════════════════════════════
   HERO — input → formme → output diagram
════════════════════════════════════════════════ */
const flowLabels = [
  { label: 'Tech Packs', Icon: FileText },
  { label: 'Sampling', Icon: Ruler },
  { label: 'Production', Icon: Factory },
  { label: 'Quality', Icon: ShieldCheck },
  { label: 'Shipment', Icon: Package },
];

const Hero = ({ onBookDemo, prefersReduced }: { onBookDemo: () => void; prefersReduced: boolean }) => (
  <section className="hero-sec relative" aria-label="Hero" style={{ background: LAVENDER }}>
    <div className="mx-auto max-w-[1300px] px-6 pt-28 md:pt-36 pb-16 md:pb-20">
      <div className="reveal">
        <Eyebrow>Fashion production, connected</Eyebrow>
      </div>
      <h1 className="reveal font-dm-sans font-semibold leading-[1.08] tracking-[-0.02em]" style={{ color: INK, fontSize: 'clamp(34px, 4.6vw, 56px)' }}>
        The operating system for
        <br />
        <span className="font-cormorant italic font-medium" style={{ color: PURPLE }}>fashion production.</span>
      </h1>
      <p className="reveal mt-6 max-w-lg font-inter leading-relaxed" style={{ color: MUTED2, fontSize: 'clamp(14px, 1.3vw, 16px)' }}>
        Formme helps factories run production smarter and gives brands live visibility — from tech pack to shipment.
      </p>
      <div className="reveal mt-8 flex items-center gap-4">
        <SolidButton onClick={onBookDemo}>Book a demo</SolidButton>
        <OutlineButton href="#product">See how it works <ArrowRight className="w-3.5 h-3.5" /></OutlineButton>
      </div>

      {/* Diagram */}
      <div className="hero-panel reveal relative mt-16 md:mt-20 grid md:grid-cols-[1fr_1.1fr_1fr] gap-8 md:gap-4 items-center">
        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <marker id="diagram-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={PURPLE} fillOpacity="0.45" />
            </marker>
            <marker id="diagram-arrow-muted" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={MUTED} />
            </marker>
          </defs>
          <path d="M 350 150 C 400 150, 410 95, 445 85" stroke={PURPLE} strokeOpacity="0.35" strokeWidth="1.5" markerEnd="url(#diagram-arrow)" />
          <path d="M 775 95 C 810 90, 825 100, 850 110" stroke={PURPLE} strokeOpacity="0.35" strokeWidth="1.5" markerEnd="url(#diagram-arrow)" />
          <path d="M 850 255 C 770 295, 690 285, 640 250" stroke={MUTED} strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#diagram-arrow-muted)" />
        </svg>

        {/* Input card */}
        <div className="hero-chip-0">
          <p className="text-[10px] uppercase tracking-[0.14em] font-inter font-medium mb-1" style={{ color: PURPLE }}>1 &nbsp; Input</p>
          <p className="text-[9px] uppercase tracking-[0.1em] font-inter mb-3" style={{ color: MUTED }}>Brand order</p>
          <div className="rounded-2xl bg-white shadow-lg p-5" style={{ border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" style={{ color: PURPLE }} />
              <span className="text-[13px] font-dm-sans font-semibold" style={{ color: INK }}>Tech Pack</span>
            </div>
            <TagRow label="Style" value="FM-HOOD-004" />
            <TagRow label="Order" value="#FM-2841" />
            <TagRow label="Quantity" value="600 PCS" />
            <TagRow label="Fabric" value="420 GSM Cotton" />
            <TagRow label="Color" value="Washed Black" swatch="#1A1A1A" />
          </div>
        </div>

        {/* Center — garment + formme badge */}
        <div className="hero-garment relative flex flex-col items-center py-4">
          <span className="text-[11px] font-inter mb-2 flex items-center gap-1" style={{ color: MUTED2 }}>
            Order created <ArrowRight className="w-3 h-3" />
          </span>
          <div className={`relative w-[180px] rounded-2xl overflow-hidden ${prefersReduced ? '' : 'float-soft'}`} style={{ background: DARK_PANEL, aspectRatio: '3 / 4' }}>
            <img src="/mockupHoodieFront.png" alt="Boxy Hoodie sample" className="w-full h-full object-cover object-top scale-125" loading="eager" />
          </div>
          <div className="relative z-10 -mt-4 rounded-full shadow-lg px-4 py-2 flex items-center gap-1.5" style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
            <span className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-dm-sans font-bold text-white" style={{ background: PURPLE }}>b</span>
            <span className="text-[12px] font-dm-sans font-semibold" style={{ color: INK }}>formme</span>
          </div>
          <span className="text-[11px] font-inter mt-3 flex items-center gap-1" style={{ color: MUTED2 }}>
            <ArrowUp className="w-3 h-3" /> Production updated
          </span>
          <span className="text-[10px] font-inter mt-1" style={{ color: MUTED }}>
            ⟲ Status synced
          </span>
        </div>

        {/* Output cards */}
        <div className="flex flex-col gap-4">
          <div className="hero-chip-1 rounded-2xl bg-white shadow-lg p-5" style={{ border: `1px solid ${BORDER}` }}>
            <p className="text-[10px] uppercase tracking-[0.14em] font-inter font-medium mb-3" style={{ color: PURPLE }}>3A &nbsp; Factory execution</p>
            <ChecklistRow label="Cutting" done note="Complete" />
            <ChecklistRow label="Sewing" done note="72%" progress={72} />
            <ChecklistRow label="Finishing" note="Upcoming" />
            <ChecklistRow label="QC" note="Upcoming" />
            <TagRow label="Expected completion" value="08 Sep" />
          </div>
          <div className="hero-chip-2 rounded-2xl bg-white shadow-lg p-5" style={{ border: `1px solid ${BORDER}` }}>
            <p className="text-[10px] uppercase tracking-[0.14em] font-inter font-medium mb-3" style={{ color: PURPLE }}>3B &nbsp; Brand visibility</p>
            <TagRow label="Order" value="#FM-2841" />
            <TagRow label="Current stage" value="Sewing" swatch={PURPLE} />
            <TagRow label="Factory" value="Supreme Stitch" />
            <TagRow label="Latest update" value="Line 04 · 2 hours ago" />
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="reveal mt-14 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {flowLabels.map(({ label, Icon }) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-[12px] font-inter" style={{ color: MUTED2 }}>
              <Icon className="w-3.5 h-3.5" style={{ color: MUTED }} /> {label}
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-inter bg-white" style={{ border: `1px solid ${BORDER}`, color: MUTED2 }}>
          Tech pack <ArrowRight className="w-3 h-3" /> Production <ArrowRight className="w-3 h-3" /> Live updates
        </span>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   FOR MANUFACTURERS / FOR BRANDS
════════════════════════════════════════════════ */
const manufacturerChecklist = ['Real-time production tracking', 'Smarter planning & capacity', 'Quality & inspection in one place', 'On-time shipments, every time'];
const brandChecklist = ['Live order & production visibility', 'Quality, rework & approvals', 'Shipment tracking & ETAs', 'Fewer follow-ups, more clarity'];

const lineProgress = [
  { line: 'Line 01', dots: [1, 1, 1, 1, 1, 0, 0], color: PURPLE },
  { line: 'Line 02', dots: [1, 1, 1, 0, 0, 0, 0], color: '#D9A441' },
  { line: 'Line 03', dots: [1, 1, 1, 1, 1, 1, 0], color: GREEN },
  { line: 'Line 04', dots: [1, 1, 1, 1, 0, 0, 0], color: PURPLE },
];

const upcomingDeliveries = [
  { code: 'FM-HOOD-004', factory: 'Supreme Stitch', qty: '600 PCS', date: '06 Sep' },
  { code: 'FM-TS-101', factory: 'Ace Garments', qty: '300 PCS', date: '12 Sep' },
  { code: 'FM-JOG-201', factory: 'Moda Works', qty: '600 PCS', date: '15 Sep' },
];

const orderProgressRows = [
  { code: 'FM-HOOD-004', qty: '600 PCS', cols: [100, 100, 72, 0, 0] },
  { code: 'FM-TS-101', qty: '300 PCS', cols: [100, 70, 40, 0, 0] },
  { code: 'FM-JOG-201', qty: '600 PCS', cols: [100, 100, 60, 20, 0] },
];

const recentUpdates = [
  'Line 04 moved to sewing · FM-HOOD-004 · 2 hours ago',
  'Quality check passed · 4 hours ago',
  'Shipment scheduled for 12 Sep · 1 day ago',
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
                <div className="flex gap-1">
                  {l.dots.map((d, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: d ? l.color : 'rgba(255,255,255,0.12)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.1em] font-inter mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Upcoming Deliveries</p>
          <div className="flex flex-col gap-2.5">
            {upcomingDeliveries.map((d) => (
              <div key={d.code} className="flex items-center justify-between text-[11px] font-inter">
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{d.code} <span style={{ color: 'rgba(255,255,255,0.4)' }}>· {d.factory}</span></span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{d.qty} · {d.date}</span>
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
          <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b" style={{ borderColor: BORDER }}>
            {[['Total Orders', '12'], ['In Production', '8'], ['On-time Rate', '92%']].map(([l, v]) => (
              <div key={l}>
                <p className="font-dm-sans font-bold text-[18px]" style={{ color: INK }}>{v}</p>
                <p className="text-[9px] font-inter mt-1" style={{ color: MUTED }}>{l}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.1em] font-inter mb-3" style={{ color: MUTED }}>Order Progress</p>
          <div className="hidden sm:grid grid-cols-[1.4fr_repeat(5,1fr)] gap-1 mb-1.5">
            <span />
            {['Cut', 'Sew', 'Fin', 'QC', 'Ship'].map((h) => (
              <span key={h} className="text-[8px] uppercase text-center font-inter" style={{ color: MUTED }}>{h}</span>
            ))}
          </div>
          <div className="flex flex-col gap-2 mb-6">
            {orderProgressRows.map((r) => (
              <div key={r.code} className="grid grid-cols-[1.4fr_repeat(5,1fr)] gap-1 items-center">
                <span className="text-[10px] font-inter truncate" style={{ color: MUTED2 }}>{r.code}</span>
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
          <div className="flex flex-col gap-2">
            {recentUpdates.map((u) => (
              <p key={u} className="text-[10px] font-inter leading-relaxed" style={{ color: MUTED2 }}>{u}</p>
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

      <div className="reveal grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-3" style={{ color: PURPLE }}>01 &nbsp; Tech Pack</p>
          <WorkflowStepCard>
            <div className="rounded-lg mb-3 flex items-center justify-center" style={{ background: '#F7F6FB', aspectRatio: '4/3' }}>
              <FileText className="w-8 h-8" style={{ color: MUTED }} />
            </div>
            <div className="flex flex-col gap-1.5">
              {['Specs', 'Measurements', 'BOM', 'Construction'].map((t) => (
                <span key={t} className="text-[10px] font-inter flex items-center gap-1.5" style={{ color: MUTED2 }}>
                  <Check className="w-2.5 h-2.5" style={{ color: GREEN }} strokeWidth={3} /> {t}
                </span>
              ))}
            </div>
          </WorkflowStepCard>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-3" style={{ color: PURPLE }}>02 &nbsp; Sampling</p>
          <WorkflowStepCard>
            <div className="rounded-lg mb-3 overflow-hidden" style={{ background: DARK_PANEL, aspectRatio: '4/3' }}>
              <img src="/mockupHoodieFront.png" alt="Sample" className="w-full h-full object-cover object-top scale-125" loading="lazy" />
            </div>
            <p className="text-[9px] uppercase tracking-[0.08em] font-inter mb-1.5" style={{ color: MUTED }}>Fit & approvals</p>
            <span className="text-[10px] font-inter flex items-center gap-1.5" style={{ color: GREEN }}>
              <Check className="w-2.5 h-2.5" strokeWidth={3} /> Sample approved 08 Jul
            </span>
          </WorkflowStepCard>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-3" style={{ color: PURPLE }}>03 &nbsp; Production</p>
          <WorkflowStepCard>
            <ChecklistRow label="Cutting" done note="Complete" />
            <ChecklistRow label="Sewing" done note="In progress" progress={55} />
            <ChecklistRow label="Finishing" note="Upcoming" />
            <ChecklistRow label="Packing" note="Upcoming" />
          </WorkflowStepCard>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-3" style={{ color: PURPLE }}>04 &nbsp; Quality</p>
          <WorkflowStepCard>
            <p className="text-[9px] uppercase tracking-[0.08em] font-inter mb-2" style={{ color: MUTED }}>Inspection · Line 04</p>
            <div className="flex flex-col gap-2 mt-2">
              <div>
                <p className="font-dm-sans font-bold text-[16px]" style={{ color: GREEN }}>352 PCS</p>
                <p className="text-[9px] font-inter" style={{ color: MUTED }}>Passed</p>
              </div>
              <div>
                <p className="font-dm-sans font-bold text-[16px]" style={{ color: RED }}>12 PCS</p>
                <p className="text-[9px] font-inter" style={{ color: MUTED }}>Failed</p>
              </div>
            </div>
          </WorkflowStepCard>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-3" style={{ color: PURPLE }}>05 &nbsp; Shipment</p>
          <WorkflowStepCard>
            <p className="text-[9px] uppercase tracking-[0.08em] font-inter mb-1.5" style={{ color: MUTED }}>Ready to ship</p>
            <p className="font-dm-sans font-bold text-[16px] mb-3" style={{ color: INK }}>600 PCS</p>
            <TagRow label="ETD" value="10 Sep" />
            <TagRow label="ETA" value="22 Sep" />
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
      if (!reduced) {
        gsap.from('.hero-garment', { opacity: 0, y: 24, duration: 1.1, ease: 'power3.out', delay: 0.15 });
        gsap.from('.hero-chip-0, .hero-chip-1, .hero-chip-2', {
          opacity: 0, y: 16, stagger: 0.12, duration: 0.9, ease: 'power2.out', delay: 0.4,
        });
      }

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
