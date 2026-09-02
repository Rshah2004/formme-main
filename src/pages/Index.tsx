import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, ArrowRight, ChevronDown, FileText, Shirt, Factory, ShieldCheck, Package,
  LayoutGrid, ClipboardList, Layers, MessageSquare, BarChart3, Settings, Filter, Plus,
  Instagram, Linkedin,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import BookDemoModal from '@/components/homePage/BookDemoModal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* ─── Palette ─── */
const BG = '#FFFFFF';
const LAVENDER = '#F1EEFA';
const INK = '#131316';
const MUTED = '#9B99A6';
const MUTED2 = '#6B6876';
const BORDER = '#E8E5F1';
const PURPLE = '#6C63A6';
const PURPLE_BG = 'rgba(108,99,166,0.10)';
const GREEN = '#3FA66E';
const GREEN_BG = 'rgba(63,166,110,0.12)';
const GREY_BADGE_BG = '#F1F0F4';

const CheckMark = () => (
  <span
    className="inline-flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 align-middle -translate-y-1"
    style={{ background: PURPLE }}
  >
    <Check className="w-[18px] h-[18px]" style={{ color: '#fff' }} strokeWidth={3.5} />
  </span>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] font-inter font-medium mb-5"
    style={{ background: PURPLE_BG, color: PURPLE }}
  >
    {children}
  </span>
);

const PrimaryButton = ({
  children, onClick, href, dark = true,
}: { children: React.ReactNode; onClick?: () => void; href?: string; dark?: boolean }) => {
  const cls =
    'inline-flex items-center gap-1.5 rounded-[10px] px-5 py-3 text-[13px] font-inter font-medium transition-transform duration-300 hover:-translate-y-0.5';
  const style = dark ? { background: INK, color: '#fff' } : { background: 'transparent', color: INK, border: `1px solid ${BORDER}` };
  if (href) {
    return (
      <Link to={href} className={cls} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  );
};

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
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${scrolled ? 'shadow-sm' : ''}`}
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${scrolled ? BORDER : 'transparent'}` }}
    >
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 md:px-10 h-16 md:h-[72px]">
        <Link to="/" className="text-[17px] font-dm-sans font-bold tracking-[-0.01em]" style={{ color: INK }}>
          FORMME
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) =>
            item.route ? (
              <Link key={item.label} to={item.href} className="inline-flex items-center gap-1 text-[13px] font-inter" style={{ color: MUTED2 }}>
                {item.label}
                {item.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="inline-flex items-center gap-1 text-[13px] font-inter" style={{ color: MUTED2 }}>
                {item.label}
                {item.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </a>
            )
          )}
          <button onClick={onBookDemo} className="text-[13px] font-inter" style={{ color: MUTED2 }}>
            Pricing
          </button>
        </nav>

        <div className="flex items-center gap-5">
          <Link to="/auth?mode=signin" className="hidden sm:inline text-[13px] font-inter font-medium" style={{ color: INK }}>
            Sign in
          </Link>
          <PrimaryButton onClick={onBookDemo}>
            Book a Demo <ArrowRight className="w-3.5 h-3.5" />
          </PrimaryButton>
        </div>
      </div>
    </header>
  );
};

/* ════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════ */
type Badge = { label: string; tone: 'good' | 'progress' | 'muted' | 'dash' };

const orderRows: { style: string; code: string; factory: string; sample: Badge; production: number; qc: Badge; shipment: Badge }[] = [
  { style: 'Boxy Hoodie', code: 'FM-SS25-001', factory: 'Skyline Apparel', sample: { label: 'Approved', tone: 'good' }, production: 72, qc: { label: 'In Progress', tone: 'progress' }, shipment: { label: 'On Track', tone: 'good' } },
  { style: 'Oversized Tee', code: 'FM-SS25-002', factory: 'Delta Garments', sample: { label: 'In Review', tone: 'muted' }, production: 45, qc: { label: 'Pending', tone: 'muted' }, shipment: { label: '—', tone: 'dash' } },
  { style: 'Cargo Pant', code: 'FM-SS25-003', factory: 'Stitch Line Ltd.', sample: { label: 'Approved', tone: 'good' }, production: 30, qc: { label: 'Pending', tone: 'muted' }, shipment: { label: '—', tone: 'dash' } },
  { style: 'Zip Jacket', code: 'FM-SS25-004', factory: 'Summit Fashions', sample: { label: 'Approved', tone: 'good' }, production: 85, qc: { label: 'In Progress', tone: 'progress' }, shipment: { label: 'On Track', tone: 'good' } },
  { style: 'Shorts', code: 'FM-SS25-005', factory: 'Needlecraft Intl.', sample: { label: 'In Review', tone: 'muted' }, production: 15, qc: { label: 'Pending', tone: 'muted' }, shipment: { label: '—', tone: 'dash' } },
];

const badgeStyle: Record<Badge['tone'], { bg: string; fg: string }> = {
  good: { bg: GREEN_BG, fg: GREEN },
  progress: { bg: PURPLE_BG, fg: PURPLE },
  muted: { bg: GREY_BADGE_BG, fg: MUTED2 },
  dash: { bg: 'transparent', fg: MUTED },
};

const BadgeChip = ({ b }: { b: Badge }) => (
  <span
    className="inline-flex text-[10px] font-inter font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
    style={{ background: badgeStyle[b.tone].bg, color: badgeStyle[b.tone].fg }}
  >
    {b.label}
  </span>
);

const sidebarIcons = [
  { label: 'Overview', Icon: LayoutGrid, active: true },
  { label: 'Styles', Icon: Shirt },
  { label: 'Orders', Icon: ClipboardList },
  { label: 'Samples', Icon: Layers },
  { label: 'Production', Icon: Factory },
  { label: 'QC', Icon: ShieldCheck },
  { label: 'Shipments', Icon: Package },
  { label: 'Messages', Icon: MessageSquare },
  { label: 'Reports', Icon: BarChart3 },
  { label: 'Settings', Icon: Settings },
];

const notifCards = [
  { initials: 'E', name: 'Emily', action: 'Viewed tech pack', time: '5 min ago', pos: '-right-5 -top-6', bg: PURPLE },
  { initials: 'M', name: 'Mike', action: 'Updated fabric', time: '22 min ago', pos: '-left-8 top-[64%]', bg: GREEN },
  { initials: 'S', name: 'Sarah', action: 'Approved proto sample', time: '1 hour ago', pos: 'right-[8%] -bottom-8', bg: '#C97B5A' },
];

const trustLogos = ['Walmart', 'Old Navy', 'Costco', 'Fanatics', 'Champions', 'US Polo Assn'];

const Hero = ({ onBookDemo, prefersReduced }: { onBookDemo: () => void; prefersReduced: boolean }) => {
  const [email, setEmail] = useState('');

  return (
    <section className="hero-sec relative" aria-label="Hero" style={{ background: LAVENDER }}>
      <div className="mx-auto max-w-[1400px] px-6 pt-28 md:pt-32 pb-16 md:pb-20">
        <div className="grid md:grid-cols-[0.82fr_1.18fr] gap-14 md:gap-16 items-center">
          {/* Left — copy */}
          <div className="text-center md:text-left">
            <div className="reveal">
              <Eyebrow>Fashion production platform</Eyebrow>
            </div>

            <h1
              className="reveal font-dm-sans font-bold leading-[1.14] tracking-[-0.02em]"
              style={{ color: INK, fontSize: 'clamp(28px, 3.2vw, 44px)' }}
            >
              Faster production updates. <CheckMark />
              <br />
              Less confusion. <CheckMark />
              <br />
              Better deliveries. <CheckMark />
            </h1>

            <p
              className="reveal mt-6 max-w-md mx-auto md:mx-0 font-inter leading-relaxed"
              style={{ color: MUTED2, fontSize: 'clamp(14px, 1.3vw, 16px)' }}
            >
              Replace scattered spreadsheets, WhatsApp threads and manual follow-ups. Formme gives factories and brands one shared system for orders, sampling, production, quality and shipment visibility.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); onBookDemo(); }}
              className="reveal mt-8 flex items-center gap-3 max-w-md mx-auto md:mx-0"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="What's your work email?"
                className="flex-1 min-w-0 bg-white rounded-[10px] px-4 py-3 text-[14px] font-inter outline-none"
                style={{ color: INK, border: `1px solid ${BORDER}` }}
              />
              <button
                type="submit"
                className="rounded-[10px] px-5 py-3 text-[13px] font-inter font-medium flex-shrink-0 transition-transform duration-300 hover:-translate-y-0.5"
                style={{ background: INK, color: '#fff' }}
              >
                Get a Demo
              </button>
            </form>

            <p className="reveal mt-8 text-[12px] font-inter" style={{ color: MUTED }}>
              Trusted by growing apparel teams
            </p>
          </div>

          {/* Right — live order dashboard + activity notifications */}
          <div className="hero-panel reveal relative mx-auto md:mx-0 w-full mt-6 md:mt-0">
            <div className="hero-garment relative rounded-2xl overflow-hidden bg-white shadow-2xl flex" style={{ border: `1px solid ${BORDER}` }}>
              {/* Icon rail */}
              <div className="hidden sm:flex flex-col items-center gap-1 py-4 px-2 border-r flex-shrink-0" style={{ borderColor: BORDER }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2 text-[11px] font-inter font-bold flex-shrink-0" style={{ background: INK, color: '#fff' }}>
                  F
                </div>
                {sidebarIcons.map(({ label, Icon, active }) => (
                  <div
                    key={label}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: active ? PURPLE_BG : 'transparent' }}
                    title={label}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: active ? PURPLE : MUTED }} />
                  </div>
                ))}
              </div>

              {/* Main panel */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: BORDER }}>
                  <span className="text-[13px] font-dm-sans font-semibold" style={{ color: INK }}>Orders</span>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-inter px-2.5 py-1.5 rounded-[8px]" style={{ border: `1px solid ${BORDER}`, color: MUTED2 }}>
                      <Filter className="w-3 h-3" /> Filters
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-inter font-medium px-2.5 py-1.5 rounded-[8px]" style={{ background: INK, color: '#fff' }}>
                      <Plus className="w-3 h-3" /> New Order
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-5 px-5 py-2.5 border-b" style={{ borderColor: BORDER }}>
                  {['All Orders', 'In Production', 'At Risk', 'Completed'].map((tab) => (
                    <span
                      key={tab}
                      className="text-[11px] font-inter pb-1 whitespace-nowrap"
                      style={tab === 'All Orders' ? { color: INK, borderBottom: `2px solid ${PURPLE}` } : { color: MUTED }}
                    >
                      {tab}
                    </span>
                  ))}
                </div>

                <div className="hidden sm:grid grid-cols-[1.3fr_1fr_0.8fr_1fr_0.8fr_0.8fr] gap-2 px-5 py-2 border-b" style={{ borderColor: BORDER }}>
                  {['Style', 'Factory', 'Sample', 'Production', 'QC', 'Shipment'].map((h) => (
                    <span key={h} className="text-[9px] uppercase tracking-[0.14em] font-inter" style={{ color: MUTED }}>{h}</span>
                  ))}
                </div>

                <div>
                  {orderRows.map((row, i) => (
                    <div
                      key={row.code}
                      className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.3fr_1fr_0.8fr_1fr_0.8fr_0.8fr] items-center gap-2 px-5 py-3 border-b last:border-b-0"
                      style={{ borderColor: BORDER, background: i === 3 ? PURPLE_BG : 'transparent' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: GREY_BADGE_BG }}>
                          <Shirt className="w-3.5 h-3.5" style={{ color: MUTED2 }} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[12px] font-dm-sans truncate" style={{ color: INK }}>{row.code}</p>
                          <p className="text-[10px] font-inter truncate" style={{ color: MUTED }}>{row.style}</p>
                        </div>
                      </div>
                      <div className="hidden sm:block text-[11px] font-inter truncate" style={{ color: MUTED2 }}>{row.factory}</div>
                      <div className="hidden sm:block"><BadgeChip b={row.sample} /></div>
                      <div className="hidden sm:flex items-center gap-2">
                        <span className="text-[11px] font-inter font-medium w-8" style={{ color: INK }}>{row.production}%</span>
                        <div className="w-14 h-[3px] rounded-full overflow-hidden" style={{ background: BORDER }}>
                          <div className="h-full rounded-full" style={{ width: `${row.production}%`, background: PURPLE }} />
                        </div>
                      </div>
                      <div className="hidden sm:block"><BadgeChip b={row.qc} /></div>
                      <div className="hidden sm:block"><BadgeChip b={row.shipment} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating activity cards */}
            {notifCards.map((n, i) => (
              <div
                key={n.initials}
                className={`hero-chip-${i} hidden md:flex absolute items-center gap-3 rounded-xl px-4 py-3 bg-white shadow-lg z-10 ${
                  prefersReduced ? '' : i % 2 === 0 ? 'float-soft' : 'float-soft-delay'
                } ${n.pos}`}
                style={{ border: `1px solid ${BORDER}`, maxWidth: 210 }}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-inter font-medium" style={{ background: n.bg, color: '#fff' }}>
                  {n.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-dm-sans font-medium truncate" style={{ color: INK }}>{n.name}</p>
                  <p className="text-[11px] font-inter truncate" style={{ color: MUTED2 }}>{n.action} · {n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div className="reveal mt-16 md:mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {trustLogos.map((name) => (
            <span key={name} className="font-dm-sans font-medium uppercase" style={{ color: MUTED, fontSize: 15, letterSpacing: '0.06em' }}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ════════════════════════════════════════════════
   ONE SYSTEM — tech pack to shipment
════════════════════════════════════════════════ */
const flowIconSteps = [
  { label: 'Tech Pack', desc: 'Create and share tech packs, BOMs, measurements and files.', Icon: FileText },
  { label: 'Sample', desc: 'Manage samples, feedback loops and approvals.', Icon: Shirt },
  { label: 'Production', desc: 'Track orders, WIP, capacity and real-time progress.', Icon: Factory },
  { label: 'Quality', desc: 'Log inspections, issues and QC approvals.', Icon: ShieldCheck },
  { label: 'Shipment', desc: 'Organize shipments, docs and delivery timelines.', Icon: Package },
];

const OneSystemSection = () => (
  <section id="product" className="py-24 md:py-28 px-6" style={{ background: BG }}>
    <h2
      className="reveal text-center mx-auto max-w-2xl font-dm-sans font-semibold leading-[1.15]"
      style={{ color: INK, fontSize: 'clamp(24px, 3vw, 36px)' }}
    >
      One system from tech pack to shipment
    </h2>

    <div className="reveal mx-auto mt-16 max-w-[1200px] grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-14">
      {flowIconSteps.map(({ label, desc, Icon }, i) => (
        <div key={label} className="relative flex flex-col items-center text-center px-2">
          {i < flowIconSteps.length - 1 && (
            <span className="hidden sm:flex absolute top-7 left-[calc(50%+34px)] w-[calc(100%-34px)] items-center">
              <span className="w-full border-t border-dashed" style={{ borderColor: BORDER }} />
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 -ml-1" style={{ color: MUTED }} />
            </span>
          )}
          <span className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: PURPLE_BG }}>
            <Icon className="w-6 h-6" style={{ color: PURPLE }} />
          </span>
          <p className="font-dm-sans font-semibold text-[15px]" style={{ color: INK }}>{label}</p>
          <p className="mt-2 font-inter text-[12px] leading-relaxed max-w-[150px]" style={{ color: MUTED2 }}>{desc}</p>
        </div>
      ))}
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   FOR MANUFACTURERS
════════════════════════════════════════════════ */
const manufacturerStats = [
  { label: 'Active Orders', value: '28' },
  { label: 'In Production', value: '16' },
  { label: 'On Time Delivery', value: '93%' },
  { label: 'Open Issues', value: '7' },
];

const activeOrders = [
  { style: 'Boxy Hoodie', code: 'FM-SS25-001', brand: 'Aurélie', qty: '2,000 pcs', progress: 72, stage: 'Cutting', eta: 'May 28', priority: 'High' },
  { style: 'Zip Jacket', code: 'FM-SS25-004', brand: 'Véra', qty: '1,500 pcs', progress: 85, stage: 'Sewing', eta: 'May 22', priority: 'High' },
  { style: 'Oversized Tee', code: 'FM-SS25-002', brand: 'SNDYS', qty: '3,000 pcs', progress: 45, stage: 'Printing', eta: 'May 30', priority: 'Medium' },
];

const sampleApprovals = [
  { style: 'FM-SS25-001', name: 'Boxy Hoodie', tone: 'good' as const },
  { style: 'FM-SS25-002', name: 'Oversized Tee', tone: 'progress' as const },
];

const FactoriesSection = () => (
  <section id="factories" className="py-24 md:py-28 px-6" style={{ background: LAVENDER }}>
    <div className="mx-auto max-w-[1300px] grid md:grid-cols-2 gap-14 md:gap-16 items-center">
      <div className="reveal">
        <Eyebrow>For Manufacturers</Eyebrow>
        <h2 className="font-dm-sans font-bold leading-[1.1] tracking-[-0.015em] mb-5" style={{ color: INK, fontSize: 'clamp(28px, 3.2vw, 42px)' }}>
          Run production from one system
        </h2>
        <p className="font-inter leading-relaxed max-w-md mb-8" style={{ color: MUTED2, fontSize: '15px' }}>
          Plan capacity, manage orders, track progress and keep every department aligned in real time.
        </p>
        <PrimaryButton href="#factories">
          Explore for Manufacturers <ArrowRight className="w-3.5 h-3.5" />
        </PrimaryButton>
      </div>

      <div className="reveal rounded-2xl bg-white shadow-xl p-6 md:p-7" style={{ border: `1px solid ${BORDER}` }}>
        <p className="text-[12px] font-dm-sans font-semibold mb-4" style={{ color: INK }}>Factory Dashboard</p>

        <div className="grid grid-cols-4 gap-3 mb-6 pb-6 border-b" style={{ borderColor: BORDER }}>
          {manufacturerStats.map((s) => (
            <div key={s.label}>
              <p className="font-dm-sans font-bold" style={{ color: INK, fontSize: 'clamp(16px, 2vw, 22px)' }}>{s.value}</p>
              <p className="text-[9px] font-inter mt-1 leading-tight" style={{ color: MUTED }}>{s.label}</p>
            </div>
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-[0.14em] font-inter mb-3" style={{ color: MUTED }}>Active Orders</p>
        <div className="flex flex-col gap-3 mb-6">
          {activeOrders.map((o) => (
            <div key={o.code} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: GREY_BADGE_BG }}>
                <Shirt className="w-3.5 h-3.5" style={{ color: MUTED2 }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-dm-sans truncate" style={{ color: INK }}>{o.style} <span style={{ color: MUTED }}>· {o.brand}</span></p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-[3px] rounded-full overflow-hidden max-w-[110px]" style={{ background: BORDER }}>
                    <div className="h-full rounded-full" style={{ width: `${o.progress}%`, background: PURPLE }} />
                  </div>
                  <span className="text-[10px] font-inter" style={{ color: MUTED2 }}>{o.stage} · ETA {o.eta}</span>
                </div>
              </div>
              <span
                className="text-[9px] font-inter font-medium px-2 py-1 rounded-full flex-shrink-0"
                style={{ background: o.priority === 'High' ? 'rgba(217,86,86,0.1)' : GREY_BADGE_BG, color: o.priority === 'High' ? '#C25656' : MUTED2 }}
              >
                {o.priority}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 pt-5 border-t" style={{ borderColor: BORDER }}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] font-inter mb-3" style={{ color: MUTED }}>Sample Approvals</p>
            <div className="flex flex-col gap-2">
              {sampleApprovals.map((s) => (
                <div key={s.style} className="flex items-center justify-between">
                  <span className="text-[11px] font-inter truncate" style={{ color: MUTED2 }}>{s.name}</span>
                  <BadgeChip b={{ label: s.tone === 'good' ? 'Approved' : 'In Review', tone: s.tone }} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] font-inter mb-3" style={{ color: MUTED }}>QC Snapshot</p>
            <div className="flex items-center gap-5">
              <div><p className="font-dm-sans font-bold text-[16px]" style={{ color: GREEN }}>124</p><p className="text-[9px] font-inter" style={{ color: MUTED }}>Passed</p></div>
              <div><p className="font-dm-sans font-bold text-[16px]" style={{ color: '#C25656' }}>6</p><p className="text-[9px] font-inter" style={{ color: MUTED }}>Failed</p></div>
              <div><p className="font-dm-sans font-bold text-[16px]" style={{ color: MUTED2 }}>18</p><p className="text-[9px] font-inter" style={{ color: MUTED }}>Pending</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   FOR BRANDS
════════════════════════════════════════════════ */
const BrandsSection = () => (
  <section id="brands" className="py-24 md:py-28 px-6" style={{ background: BG }}>
    <div className="mx-auto max-w-[1300px]">
      <div className="reveal max-w-2xl mx-auto text-center mb-14">
        <div className="flex justify-center"><Eyebrow>For Brands</Eyebrow></div>
        <h2 className="font-dm-sans font-bold leading-[1.1] tracking-[-0.015em] mb-5" style={{ color: INK, fontSize: 'clamp(28px, 3.2vw, 42px)' }}>
          See what's happening without asking
        </h2>
        <p className="font-inter leading-relaxed mx-auto mb-8" style={{ color: MUTED2, fontSize: '15px', maxWidth: 440 }}>
          Real-time visibility across orders and factories so you always know where things stand.
        </p>
        <PrimaryButton href="#brands">
          Explore for Brands <ArrowRight className="w-3.5 h-3.5" />
        </PrimaryButton>
      </div>

      <div className="reveal max-w-[900px] mx-auto rounded-2xl bg-white shadow-xl p-6 md:p-7 flex flex-col sm:flex-row gap-6" style={{ border: `1px solid ${BORDER}` }}>
        <div className="w-full sm:w-[160px] flex-shrink-0 rounded-xl overflow-hidden" style={{ background: LAVENDER, aspectRatio: '4 / 5' }}>
          <img src="/mockupHoodieFront.png" alt="Boxy Hoodie — order FM-SS25-001" className="w-full h-full object-contain scale-[0.85] mix-blend-luminosity opacity-90" loading="lazy" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] font-inter mb-1" style={{ color: MUTED }}>FM-SS25-001</p>
              <p className="font-dm-sans font-semibold text-[16px]" style={{ color: INK }}>Boxy Hoodie</p>
            </div>
            <BadgeChip b={{ label: 'In Production', tone: 'progress' }} />
          </div>

          <p className="text-[11px] font-inter mb-1.5" style={{ color: MUTED2 }}>Production Progress</p>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: BORDER }}>
              <div className="h-full rounded-full" style={{ width: '72%', background: PURPLE }} />
            </div>
            <span className="text-[13px] font-dm-sans font-semibold" style={{ color: INK }}>72%</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b" style={{ borderColor: BORDER }}>
            <div>
              <p className="text-[9px] uppercase tracking-[0.12em] font-inter mb-1" style={{ color: MUTED }}>Current Stage</p>
              <p className="text-[12px] font-dm-sans" style={{ color: INK }}>Sewing</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.12em] font-inter mb-1" style={{ color: MUTED }}>Factory</p>
              <p className="text-[12px] font-dm-sans" style={{ color: INK }}>Supreme Stitch</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.12em] font-inter mb-1" style={{ color: MUTED }}>Expected Completion</p>
              <p className="text-[12px] font-dm-sans" style={{ color: INK }}>May 28, 2025</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.12em] font-inter mb-1" style={{ color: MUTED }}>Latest Update</p>
              <p className="text-[11px] font-inter leading-relaxed" style={{ color: MUTED2 }}>May 16 · Sewing in progress, 850/1,200 pcs completed.</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.12em] font-inter mb-1" style={{ color: MUTED }}>Next Milestone</p>
              <p className="text-[11px] font-inter leading-relaxed" style={{ color: MUTED2 }}>QC Inspection · May 20, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   FACTORY FLOOR — full-width photo + live stats
════════════════════════════════════════════════ */
const RingStat = ({ pct }: { pct: number }) => {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="flex-shrink-0">
      <circle cx="26" cy="26" r={r} fill="none" stroke={BORDER} strokeWidth="5" />
      <circle
        cx="26" cy="26" r={r} fill="none" stroke={PURPLE} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 26 26)"
      />
      <text x="26" y="30" textAnchor="middle" fontSize="12" fontFamily="DM Sans" fontWeight="600" fill={INK}>{pct}%</text>
    </svg>
  );
};

const FactoryFloorSection = ({ prefersReduced }: { prefersReduced: boolean }) => (
  <section className="relative px-6 py-16 md:py-20" style={{ background: BG }} aria-label="Inside a Formme factory">
    <div className="reveal mx-auto max-w-[1300px] relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16 / 8.2' }}>
      <img src="/factory.jpg" alt="Supreme Stitch factory floor running production on Formme" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(19,19,22,0) 45%, rgba(19,19,22,0.6) 100%)' }} />

      <div className="absolute left-5 right-5 md:left-8 md:right-8 bottom-5 md:bottom-8 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg flex-1">
          <RingStat pct={68} />
          <div>
            <p className="text-[11px] font-dm-sans font-semibold" style={{ color: INK }}>Line Progress</p>
            <p className="text-[10px] font-inter" style={{ color: MUTED2 }}>Line A — Sewing</p>
            <p className="text-[10px] font-inter" style={{ color: MUTED }}>820 / 1,200 pcs</p>
          </div>
        </div>
        <div className="rounded-xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg flex-1">
          <p className="text-[11px] font-dm-sans font-semibold" style={{ color: INK }}>QC Today</p>
          <p className="font-dm-sans font-bold text-[18px]" style={{ color: INK }}>132 <span className="text-[10px] font-inter font-normal" style={{ color: MUTED }}>inspections</span></p>
          <p className="text-[10px] font-inter" style={{ color: MUTED2 }}>Passed 124 · Failed 6</p>
        </div>
        <div className="rounded-xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg flex-1">
          <p className="text-[11px] font-dm-sans font-semibold" style={{ color: INK }}>Daily Output</p>
          <p className="font-dm-sans font-bold text-[18px]" style={{ color: INK }}>1,845 <span className="text-[10px] font-inter font-normal" style={{ color: MUTED }}>pcs</span></p>
          <p className="text-[10px] font-inter" style={{ color: GREEN }}>↑ 12% vs yesterday</p>
        </div>
      </div>
    </div>

    <p className="reveal text-center mt-5 text-[12px] font-inter" style={{ color: MUTED2 }}>
      Built with{' '}
      <a href="https://www.supremegroupbd.com" target="_blank" rel="noopener noreferrer" className="font-medium" style={{ color: INK, textDecoration: 'underline', textUnderlineOffset: 3 }}>
        Supreme Stitch
      </a>{' '}— Dhaka, Bangladesh
    </p>
  </section>
);

/* ════════════════════════════════════════════════
   FINAL CTA
════════════════════════════════════════════════ */
const FinalCTA = ({ onBookDemo }: { onBookDemo: () => void }) => (
  <section className="py-24 md:py-32 px-6 flex flex-col items-center text-center" style={{ background: LAVENDER }}>
    <h2
      className="reveal font-dm-sans font-bold leading-[1.15] mb-6 max-w-3xl"
      style={{ color: INK, fontSize: 'clamp(28px, 4.4vw, 52px)' }}
    >
      Orders. Production. Quality. Shipping. Connected.
    </h2>
    <p className="reveal max-w-md mb-10 font-inter" style={{ color: MUTED2, fontSize: '15px' }}>
      Formme brings everyone and everything together so fashion gets made — better.
    </p>
    <div className="reveal">
      <PrimaryButton onClick={onBookDemo}>
        Book a Demo <ArrowRight className="w-3.5 h-3.5" />
      </PrimaryButton>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   FOOTER — landing-page specific, matches the new palette
════════════════════════════════════════════════ */
const footerColumns: { title: string; links: { label: string; to: string }[] }[] = [
  { title: 'Product', links: [{ label: 'Overview', to: '#product' }, { label: 'Features', to: '#product' }, { label: 'Integrations', to: '#' }, { label: 'Security', to: '#' }] },
  { title: 'For Manufacturers', links: [{ label: 'Factory ERP', to: '#factories' }, { label: 'Capacity Planning', to: '#factories' }, { label: 'Quality Control', to: '#factories' }, { label: 'Reports', to: '#factories' }] },
  { title: 'For Brands', links: [{ label: 'Order Tracking', to: '#brands' }, { label: 'Sample Management', to: '#brands' }, { label: 'Shipment Tracking', to: '#brands' }, { label: 'Collaboration', to: '#brands' }] },
  { title: 'Company', links: [{ label: 'About Us', to: '/about' }, { label: 'Careers', to: 'mailto:formme.design@gmail.com' }, { label: 'Contact', to: '/support' }, { label: 'Partners', to: 'mailto:formme.design@gmail.com' }] },
  { title: 'Resources', links: [{ label: 'Help Center', to: '/support' }, { label: 'Blog', to: '#' }, { label: 'Guides', to: '#' }, { label: 'Templates', to: '#' }] },
];

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const cls = 'text-[13px] font-inter transition-colors hover:opacity-70';
  const style = { color: MUTED2 };
  if (to.startsWith('/')) return <Link to={to} className={cls} style={style}>{children}</Link>;
  if (to.startsWith('#') && to.length > 1) return <a href={to} className={cls} style={style}>{children}</a>;
  if (to.startsWith('mailto:')) return <a href={to} className={cls} style={style}>{children}</a>;
  return <span className={cls} style={style}>{children}</span>;
};

const LandingFooter = ({ onBookDemo }: { onBookDemo: () => void }) => (
  <footer style={{ background: BG, borderTop: `1px solid ${BORDER}` }}>
    <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-20">
      <div className="grid md:grid-cols-[1.4fr_repeat(5,1fr)] gap-10 mb-14">
        <div>
          <p className="font-dm-sans font-bold text-[17px] mb-3" style={{ color: INK }}>FORMME</p>
          <p className="text-[13px] font-inter leading-relaxed max-w-[220px] mb-5" style={{ color: MUTED2 }}>
            The fashion production platform for modern manufacturers and brands.
          </p>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/formme.design/" target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://www.linkedin.com/company/formmedesign" target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] uppercase tracking-[0.1em] font-inter font-medium mb-4" style={{ color: INK }}>{col.title}</p>
            <div className="flex flex-col gap-3">
              {col.links.map((l) => <FooterLink key={l.label} to={l.to}>{l.label}</FooterLink>)}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between" style={{ borderTop: `1px solid ${BORDER}` }}>
        <p className="text-[13px] font-inter" style={{ color: MUTED }}>© {new Date().getFullYear()} Formme. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <button onClick={onBookDemo} className="text-[13px] font-inter" style={{ color: MUTED2 }}>Book a Demo</button>
          <span className="text-[13px] font-inter" style={{ color: MUTED }}>Privacy Policy</span>
          <span className="text-[13px] font-inter" style={{ color: MUTED }}>Terms of Service</span>
        </div>
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
          opacity: 0, y: 16, stagger: 0.12, duration: 0.9, ease: 'power2.out', delay: 0.5,
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
        description="Formme is the fashion production platform for modern manufacturers and brands — one shared system for orders, sampling, production, quality and shipment visibility."
      />

      <LandingHeader onBookDemo={() => setShowBookDemo(true)} />

      <Hero onBookDemo={() => setShowBookDemo(true)} prefersReduced={prefersReduced} />
      <OneSystemSection />
      <FactoriesSection />
      <BrandsSection />
      <FactoryFloorSection prefersReduced={prefersReduced} />
      <FinalCTA onBookDemo={() => setShowBookDemo(true)} />

      <LandingFooter onBookDemo={() => setShowBookDemo(true)} />

      <BookDemoModal open={showBookDemo} onOpenChange={setShowBookDemo} />
    </div>
  );
};

export default Index;
