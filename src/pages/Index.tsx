import React, { useState } from 'react';
import {
  Check, ArrowRight, Eye, ShieldCheck, Truck, ClipboardList, Shirt,
  LayoutGrid, Factory, Package, BarChart3, Settings, CircleDot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { BG, LAVENDER, INK, DARK_PANEL, MUTED, MUTED2, BORDER, BORDER_DARK, PURPLE, PURPLE_BG, GREEN, GREEN_BG, RED } from '@/components/homePage/theme';
import type { Audience } from '@/components/homePage/theme';
import { Eyebrow, SolidButton, OutlineButton, LandingHeader, LandingFooter, CONTACT_HREF } from '@/components/homePage/LandingChrome';
import { AudienceGate } from '@/components/homePage/AudienceGate';
import { useLandingReveal } from '@/components/homePage/useLandingReveal';

/* ════════════════════════════════════════════════
   ICON FEATURE ROW — small icon + label row under each hero's CTAs
════════════════════════════════════════════════ */
const IconFeatureRow = ({ items }: { items: { icon: React.ElementType; label: string }[] }) => (
  <div className="reveal mt-9 flex items-center gap-3 flex-wrap">
    {items.map(({ icon: Icon, label }, i) => (
      <React.Fragment key={label}>
        {i > 0 && <span style={{ color: PURPLE, opacity: 0.5 }}>&middot;</span>}
        <span className="flex items-center gap-1.5 text-[12px] font-inter font-medium" style={{ color: PURPLE }}>
          <Icon className="w-4 h-4" strokeWidth={1.75} />
          {label}
        </span>
      </React.Fragment>
    ))}
  </div>
);

/* ════════════════════════════════════════════════
   HERO — for brands: "Production visibility for brands."
════════════════════════════════════════════════ */
const brandFeatureItems = [
  { icon: Eye, label: 'Live order tracking' },
  { icon: ShieldCheck, label: 'Vetted manufacturers' },
  { icon: Check, label: 'Quality & approvals' },
  { icon: Truck, label: 'Shipment visibility' },
];

const brandHeroOrders = [
  { id: 'FM-HOOD-004', product: 'Hoodies', factory: 'Supreme Stitch', progress: 72, status: 'In production', statusColor: PURPLE, statusBg: PURPLE_BG, eta: '08 Sep' },
  { id: 'FM-TS-101', product: 'T-shirts', factory: 'Ace Garments', progress: 40, status: 'Sampling', statusColor: GREEN, statusBg: GREEN_BG, eta: '15 Sep' },
  { id: 'FM-JOG-201', product: 'Joggers', factory: 'Moda Works', progress: 85, status: 'In production', statusColor: PURPLE, statusBg: PURPLE_BG, eta: '22 Sep' },
  { id: 'FM-SWT-301', product: 'Sweatshirts', factory: 'Prime Textiles', progress: 20, status: 'Material prep', statusColor: '#B8862F', statusBg: 'rgba(184,134,47,0.12)', eta: '01 Oct' },
];

const orderProgressStages = ['Confirmed', 'Sampling', 'Production', 'QC', 'Shipment'];

const BrandHero = () => (
  <section id="brands" className="relative" aria-label="Hero" style={{ background: LAVENDER }}>
    <div className="mx-auto max-w-[1400px] px-6 pt-28 md:pt-36 pb-20 md:pb-24">
      <div className="grid lg:grid-cols-[0.44fr_0.56fr] gap-14 items-start">
        {/* Left — positioning */}
        <div className="min-w-0">
          <div className="reveal">
            <Eyebrow>For brands</Eyebrow>
          </div>
          <h1 className="reveal font-dm-sans font-semibold leading-[1.1]" style={{ color: INK, fontSize: 'clamp(36px, 4.2vw, 54px)' }}>
            Production visibility<br />
            <span className="font-cormorant italic font-medium" style={{ color: PURPLE }}>for brands.</span>
          </h1>
          <p className="reveal mt-6 max-w-sm font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '15px' }}>
            See your orders, production, quality and shipments in one place — from sample to delivery.
          </p>
          <div className="reveal mt-8 flex items-center gap-6">
            <SolidButton href={CONTACT_HREF}>Get in touch</SolidButton>
            <a href="#product" className="cta-link text-[13px] font-inter font-medium" style={{ color: PURPLE }}>
              See how it works <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <IconFeatureRow items={brandFeatureItems} />
        </div>

        {/* Right — brand dashboard mockup */}
        <div className="reveal flex flex-col gap-4 min-w-0">
          <div className="rounded-2xl bg-white p-5 md:p-6 overflow-x-auto" style={{ border: `1px solid ${BORDER}`, boxShadow: '0 12px 40px -18px rgba(93,82,214,0.22)' }}>
            <div className="flex items-center justify-between mb-4 min-w-[560px]">
              <p className="text-[13px] font-dm-sans font-bold" style={{ color: INK }}>Brand Dashboard</p>
              <div className="flex items-center gap-1 rounded-full p-1" style={{ background: LAVENDER }}>
                {['All orders', 'In production', 'In transit', 'Delivered'].map((t, i) => (
                  <span key={t} className="text-[10px] font-inter font-medium px-2.5 py-1 rounded-full" style={i === 0 ? { background: '#fff', color: PURPLE } : { color: MUTED2 }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[1fr_0.9fr_1fr_1.2fr_1fr_0.7fr] gap-2 pb-2 mb-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                {['Order', 'Product', 'Factory', 'Production', 'Shipment', 'ETA'].map((h) => (
                  <span key={h} className="text-[9px] uppercase tracking-[0.08em] font-inter" style={{ color: MUTED }}>{h}</span>
                ))}
              </div>
              {brandHeroOrders.map((o) => (
                <div key={o.id} className="grid grid-cols-[1fr_0.9fr_1fr_1.2fr_1fr_0.7fr] gap-2 py-3 border-b last:border-b-0 items-center" style={{ borderColor: BORDER }}>
                  <span className="font-dm-sans font-semibold text-[12px]" style={{ color: INK }}>{o.id}</span>
                  <span className="text-[12px] font-inter" style={{ color: MUTED2 }}>{o.product}</span>
                  <span className="text-[12px] font-inter" style={{ color: MUTED2 }}>{o.factory}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 h-[3px] rounded-full overflow-hidden flex-shrink-0" style={{ background: BORDER }}>
                      <div className="h-full rounded-full" style={{ width: `${o.progress}%`, background: PURPLE }} />
                    </div>
                    <span className="text-[10px] font-inter" style={{ color: MUTED2 }}>{o.progress}%</span>
                  </div>
                  <span className="text-[10px] font-inter font-medium px-2 py-1 rounded-full inline-block w-fit" style={{ background: o.statusBg, color: o.statusColor }}>{o.status}</span>
                  <span className="text-[12px] font-inter" style={{ color: MUTED2 }}>{o.eta}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-[1.3fr_1fr] gap-4">
            <div className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${BORDER}` }}>
              <p className="text-[9px] uppercase tracking-[0.08em] font-inter mb-1" style={{ color: MUTED }}>Order progress</p>
              <p className="text-[13px] font-dm-sans font-semibold mb-5" style={{ color: INK }}>FM-HOOD-004</p>
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 right-0 h-px" style={{ background: BORDER, top: 5 }} />
                {orderProgressStages.map((s, i) => (
                  <div key={s} className="relative flex flex-col items-center gap-2" style={{ zIndex: 1 }}>
                    <span
                      className="w-2.5 h-2.5 rounded-full flex items-center justify-center"
                      style={i < 2 ? { background: PURPLE } : i === 2 ? { background: '#fff', border: `2px solid ${PURPLE}` } : { background: BORDER }}
                    />
                    <span className="text-[9px] font-inter whitespace-nowrap" style={{ color: i === 2 ? PURPLE : MUTED, fontWeight: i === 2 ? 600 : 400 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-5 flex flex-col" style={{ background: DARK_PANEL }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] uppercase tracking-[0.08em] font-inter" style={{ color: 'rgba(255,255,255,0.5)' }}>Shipment ETA</p>
                <span className="text-[9px] font-inter font-medium px-2 py-0.5 rounded-full" style={{ background: GREEN_BG, color: GREEN }}>On track</span>
              </div>
              <p className="font-dm-sans font-bold text-[18px] mb-1" style={{ color: '#fff' }}>08 Sep 2024</p>
              <p className="text-[11px] font-inter" style={{ color: 'rgba(255,255,255,0.5)' }}>Port of Chittagong, Bangladesh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   HERO — for manufacturers: "Run production from one system."
════════════════════════════════════════════════ */
const manufacturerFeatureItems = [
  { icon: Eye, label: 'Live line tracking' },
  { icon: Check, label: 'Quality control' },
  { icon: ClipboardList, label: 'Smarter planning' },
  { icon: Truck, label: 'On-time shipments' },
];

const mfgStatTiles: [string, string][] = [
  ['5', 'Production Lines'],
  ['12', 'Active Orders'],
  ['4,200', 'Pieces in Production'],
  ['92%', 'On-time Rate'],
];

const mfgHeroOrders = [
  { id: 'FM-HOOD-004', brand: 'Brand A', stage: 'Sewing', progress: 72, due: '08 Sep' },
  { id: 'FM-TS-101', brand: 'Brand B', stage: 'Finishing', progress: 48, due: '10 Sep' },
  { id: 'FM-JOG-201', brand: 'Brand C', stage: 'Cutting', progress: 85, due: '12 Sep' },
  { id: 'FM-SWT-301', brand: 'Brand D', stage: 'Sewing', progress: 60, due: '15 Sep' },
  { id: 'FM-SHT-401', brand: 'Brand E', stage: 'Packing', progress: 30, due: '18 Sep' },
];

const upcomingShipments = [
  { code: 'FM-HOOD-004', brand: 'Brand A', qty: '600 pcs', date: '08 Sep', status: 'On track', statusColor: GREEN, statusBg: GREEN_BG },
  { code: 'FM-TS-101', brand: 'Brand B', qty: '300 pcs', date: '10 Sep', status: 'On track', statusColor: GREEN, statusBg: GREEN_BG },
  { code: 'FM-JOG-201', brand: 'Brand C', qty: '600 pcs', date: '12 Sep', status: 'At risk', statusColor: RED, statusBg: 'rgba(194,86,86,0.12)' },
  { code: 'FM-SWT-301', brand: 'Brand D', qty: '450 pcs', date: '15 Sep', status: 'On track', statusColor: GREEN, statusBg: GREEN_BG },
];

const ManufacturerHero = () => (
  <section id="factories" className="relative" aria-label="Hero" style={{ background: LAVENDER }}>
    <div className="mx-auto max-w-[1400px] px-6 pt-28 md:pt-36 pb-20 md:pb-24">
      <div className="grid lg:grid-cols-[0.44fr_0.56fr] gap-14 items-start">
        {/* Left — positioning */}
        <div className="min-w-0">
          <div className="reveal">
            <Eyebrow>For manufacturers</Eyebrow>
          </div>
          <h1 className="reveal font-dm-sans font-semibold leading-[1.1]" style={{ color: INK, fontSize: 'clamp(36px, 4.2vw, 54px)' }}>
            Run production<br />
            <span className="font-cormorant italic font-medium" style={{ color: PURPLE }}>from one system.</span>
          </h1>
          <p className="reveal mt-6 max-w-sm font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '15px' }}>
            Plan, track, and manage every step of production in real time. Reduce delays, improve quality, and deliver on time.
          </p>
          <div className="reveal mt-8 flex items-center gap-6">
            <SolidButton href={CONTACT_HREF}>Explore for factories</SolidButton>
            <a href="#product" className="cta-link text-[13px] font-inter font-medium" style={{ color: PURPLE }}>
              See how it works <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <IconFeatureRow items={manufacturerFeatureItems} />
        </div>

        {/* Right — factory operations mockup */}
        <div className="reveal flex flex-col lg:flex-row gap-4 min-w-0">
          <div className="flex-1 rounded-2xl p-5 md:p-6 overflow-x-auto" style={{ background: DARK_PANEL }}>
            <div className="flex items-center justify-between mb-4 min-w-[480px]">
              <p className="text-[13px] font-dm-sans font-bold flex items-center gap-2" style={{ color: '#fff' }}>
                Factory Operations
                <span className="inline-flex items-center gap-1 text-[9px] font-inter font-medium px-2 py-0.5 rounded-full" style={{ background: GREEN_BG, color: GREEN }}>
                  <CircleDot className="w-2 h-2" /> Live
                </span>
              </p>
              <span className="text-[10px] font-inter" style={{ color: 'rgba(255,255,255,0.35)' }}>Tue, 10 Sep 2024 10:24 AM</span>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-5 pb-5 min-w-[480px]" style={{ borderBottom: `1px solid ${BORDER_DARK}` }}>
              {mfgStatTiles.map(([v, l]) => (
                <div key={l}>
                  <p className="font-dm-sans font-bold text-[20px]" style={{ color: '#fff' }}>{v}</p>
                  <p className="text-[9px] font-inter mt-1 leading-tight" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</p>
                </div>
              ))}
            </div>
            <div className="min-w-[480px]">
              <div className="grid grid-cols-[1fr_0.9fr_0.9fr_1fr_0.7fr] gap-2 pb-2 mb-1">
                {['Order', 'Brand', 'Stage', 'Progress', 'Due'].map((h) => (
                  <span key={h} className="text-[9px] uppercase tracking-[0.08em] font-inter" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</span>
                ))}
              </div>
              {mfgHeroOrders.map((o) => (
                <div key={o.id} className="grid grid-cols-[1fr_0.9fr_0.9fr_1fr_0.7fr] gap-2 py-2.5 items-center">
                  <span className="text-[11px] font-inter" style={{ color: 'rgba(255,255,255,0.85)' }}>{o.id}</span>
                  <span className="text-[11px] font-inter" style={{ color: 'rgba(255,255,255,0.5)' }}>{o.brand}</span>
                  <span className="text-[11px] font-inter" style={{ color: 'rgba(255,255,255,0.5)' }}>{o.stage}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-[3px] rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
                      <div className="h-full rounded-full" style={{ width: `${o.progress}%`, background: PURPLE }} />
                    </div>
                    <span className="text-[10px] font-inter" style={{ color: 'rgba(255,255,255,0.5)' }}>{o.progress}%</span>
                  </div>
                  <span className="text-[11px] font-inter" style={{ color: 'rgba(255,255,255,0.5)' }}>{o.due}</span>
                </div>
              ))}
            </div>
            <a href="#product" className="mt-3 inline-flex items-center gap-1 text-[11px] font-inter font-medium" style={{ color: '#B9AEFF' }}>
              View all orders <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="lg:w-[240px] flex-shrink-0 rounded-2xl bg-white p-5" style={{ border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-dm-sans font-bold" style={{ color: INK }}>Upcoming shipments</p>
            </div>
            <div className="flex flex-col gap-4">
              {upcomingShipments.map((s) => (
                <div key={s.code} className="flex flex-col gap-1 pb-4 border-b last:border-b-0 last:pb-0" style={{ borderColor: BORDER }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-dm-sans font-semibold" style={{ color: INK }}>{s.code}</span>
                    <span className="text-[9px] font-inter font-medium px-2 py-0.5 rounded-full" style={{ background: s.statusBg, color: s.statusColor }}>{s.status}</span>
                  </div>
                  <span className="text-[10px] font-inter" style={{ color: MUTED }}>{s.brand} · {s.qty}</span>
                  <span className="text-[10px] font-inter" style={{ color: MUTED2 }}>{s.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   CHECKLIST SECTION — for brands: "A clearer, faster way to bring products to life."
════════════════════════════════════════════════ */
const brandChecklistItems = ['Vetted, reliable manufacturers', 'Live order and production tracking', 'Quality, rework & approval flows', 'Shipment tracking and ETAs'];

const BrandChecklistSection = () => (
  <section className="py-20 md:py-24 px-6" style={{ background: BG }}>
    <div className="mx-auto max-w-[1300px] grid lg:grid-cols-2 gap-10 items-center">
      <div className="reveal">
        <Eyebrow>Built for brands</Eyebrow>
        <h2 className="font-dm-sans font-semibold leading-[1.15] mb-5" style={{ color: INK, fontSize: 'clamp(26px, 3vw, 36px)' }}>
          A clearer, faster way<br />to bring products to life.
        </h2>
        <div className="flex flex-col gap-2.5 mb-7">
          {brandChecklistItems.map((c) => (
            <div key={c} className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PURPLE }} strokeWidth={3} />
              <span className="text-[14px] font-inter" style={{ color: MUTED2 }}>{c}</span>
            </div>
          ))}
        </div>
        <OutlineButton href="#factories">Explore our network <ArrowRight className="w-3.5 h-3.5" /></OutlineButton>
      </div>

      <div className="reveal rounded-2xl p-6 md:p-8" style={{ background: DARK_PANEL }}>
        <div className="flex items-center justify-between mb-6">
          <Eyebrow dark>Real-time visibility</Eyebrow>
          <span className="text-[11px] font-inter" style={{ color: 'rgba(255,255,255,0.4)' }}>Live data, fewer follow-ups</span>
        </div>
        <h3 className="font-dm-sans font-semibold mb-6" style={{ color: '#fff', fontSize: 'clamp(18px, 1.8vw, 22px)' }}>
          From factory to your dashboard.
        </h3>
        <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER_DARK}` }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Shirt className="w-9 h-9" strokeWidth={1} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-dm-sans font-bold text-[15px]" style={{ color: '#fff' }}>Oversized Hoodie</p>
                  <p className="text-[10px] font-inter" style={{ color: 'rgba(255,255,255,0.4)' }}>FM-HOOD-004</p>
                </div>
                <span className="text-[10px] font-inter font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: PURPLE_BG, color: '#B9AEFF' }}>In production</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <div className="h-full rounded-full" style={{ width: '72%', background: PURPLE }} />
                </div>
                <span className="text-[11px] font-inter font-semibold" style={{ color: '#fff' }}>72%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              {[['Quantity', '600 pcs'], ['Fabric', '420 GSM cotton'], ['Color', 'Washed black']].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: BORDER_DARK }}>
                  <span className="text-[11px] font-inter" style={{ color: 'rgba(255,255,255,0.45)' }}>{l}</span>
                  <span className="text-[11px] font-inter" style={{ color: 'rgba(255,255,255,0.85)' }}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              {[['Factory', 'Supreme Stitch'], ['Location', 'Dhaka, Bangladesh'], ['Expected completion', '08 Sep 2024']].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: BORDER_DARK }}>
                  <span className="text-[11px] font-inter" style={{ color: 'rgba(255,255,255,0.45)' }}>{l}</span>
                  <span className="text-[11px] font-inter" style={{ color: 'rgba(255,255,255,0.85)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   CHECKLIST SECTION — for manufacturers: "A simpler way to manage production."
════════════════════════════════════════════════ */
const manufacturerChecklistItems = ['Centralized order and line management', 'Capacity planning and load balancing', 'Quality inspection and approvals', 'Team coordination in one place'];

const productionBoardRows = [
  { line: 'Line 01', product: 'Hoodies · FM-HOOD-004', progress: 78, status: 'In production', statusColor: GREEN, statusBg: GREEN_BG },
  { line: 'Line 02', product: 'T-Shirts · FM-TS-101', progress: 45, status: 'In production', statusColor: GREEN, statusBg: GREEN_BG },
  { line: 'Line 03', product: 'Joggers · FM-JOG-201', progress: 85, status: 'Cutting', statusColor: PURPLE, statusBg: PURPLE_BG },
  { line: 'Line 04', product: 'Sweatshirts · FM-SWT-301', progress: 60, status: 'Sewing', statusColor: '#B8862F', statusBg: 'rgba(184,134,47,0.12)' },
  { line: 'Line 05', product: 'Shirts · FM-SHT-401', progress: 30, status: 'Packing', statusColor: '#B9AEFF', statusBg: 'rgba(93,82,214,0.18)' },
];

const ManufacturerChecklistSection = () => (
  <section className="py-20 md:py-24 px-6" style={{ background: BG }}>
    <div className="mx-auto max-w-[1300px] grid lg:grid-cols-2 gap-10 items-center">
      <div className="reveal">
        <Eyebrow>Built for factory operations</Eyebrow>
        <h2 className="font-dm-sans font-semibold leading-[1.15] mb-5" style={{ color: INK, fontSize: 'clamp(26px, 3vw, 36px)' }}>
          A simpler way<br />to manage production.
        </h2>
        <div className="flex flex-col gap-2.5 mb-7">
          {manufacturerChecklistItems.map((c) => (
            <div key={c} className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PURPLE }} strokeWidth={3} />
              <span className="text-[14px] font-inter" style={{ color: MUTED2 }}>{c}</span>
            </div>
          ))}
        </div>
        <OutlineButton href="#product">Explore features <ArrowRight className="w-3.5 h-3.5" /></OutlineButton>
      </div>

      <div className="reveal rounded-2xl p-6 md:p-8 overflow-x-auto" style={{ background: DARK_PANEL }}>
        <div className="flex items-center justify-between mb-6 min-w-[520px]">
          <p className="font-dm-sans font-bold text-[15px]" style={{ color: '#fff' }}>Production Board</p>
          <div className="flex items-center gap-1 rounded-full p-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {['Lines', 'Orders', 'Quality', 'Team'].map((t, i) => (
              <span key={t} className="text-[10px] font-inter font-medium px-2.5 py-1 rounded-full" style={i === 0 ? { background: PURPLE, color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }}>{t}</span>
            ))}
          </div>
        </div>
        <div className="min-w-[520px]">
          <div className="grid grid-cols-[0.7fr_1.4fr_1fr_0.9fr] gap-2 pb-2 mb-1">
            {['Line', 'Product', 'Progress', 'Status'].map((h) => (
              <span key={h} className="text-[9px] uppercase tracking-[0.08em] font-inter" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</span>
            ))}
          </div>
          {productionBoardRows.map((r) => (
            <div key={r.line} className="grid grid-cols-[0.7fr_1.4fr_1fr_0.9fr] gap-2 py-3 border-b last:border-b-0 items-center" style={{ borderColor: BORDER_DARK }}>
              <span className="text-[11px] font-inter font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>{r.line}</span>
              <span className="text-[11px] font-inter" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.product}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-14 h-[3px] rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <div className="h-full rounded-full" style={{ width: `${r.progress}%`, background: PURPLE }} />
                </div>
                <span className="text-[10px] font-inter" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.progress}%</span>
              </div>
              <span className="text-[10px] font-inter font-medium px-2 py-1 rounded-full inline-block w-fit" style={{ background: r.statusBg, color: r.statusColor }}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   HOW IT WORKS — shared 4-step layout, content parametrized per audience
════════════════════════════════════════════════ */
const HowItWorksSection = ({
  audienceLabel, headingLine1, headingAccent, steps,
}: {
  audienceLabel: string;
  headingLine1: string;
  headingAccent: string;
  steps: { n: string; title: string; desc: string }[];
}) => (
  <section id="product" className="py-16 md:py-20 px-6" style={{ background: LAVENDER }}>
    <div className="mx-auto max-w-[1300px] grid lg:grid-cols-[0.9fr_2fr] gap-8 items-start">
      <div className="reveal">
        <Eyebrow>How it works for {audienceLabel}</Eyebrow>
        <h2 className="font-dm-sans font-semibold leading-[1.15]" style={{ color: INK, fontSize: 'clamp(24px, 2.6vw, 32px)' }}>
          {headingLine1}<br />
          <span className="font-cormorant italic font-medium" style={{ color: PURPLE }}>{headingAccent}</span>
        </h2>
      </div>
      <div className="reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => (
          <div key={s.n}>
            <span
              className="inline-flex items-center justify-center rounded-full w-7 h-7 text-[11px] font-inter font-bold mb-3"
              style={{ background: PURPLE_BG, color: PURPLE }}
            >
              {s.n}
            </span>
            <p className="font-dm-sans font-semibold text-[14px] mb-1.5" style={{ color: INK }}>{s.title}</p>
            <p className="text-[12px] font-inter leading-relaxed" style={{ color: MUTED2 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const brandHowItWorksSteps = [
  { n: '01', title: 'Submit order', desc: 'Tell us what you’re making.' },
  { n: '02', title: 'Match with factory', desc: 'Get connected with vetted manufacturers.' },
  { n: '03', title: 'Approve sample', desc: 'Review and approve before production.' },
  { n: '04', title: 'Track production', desc: 'See live progress to delivery.' },
];

const manufacturerHowItWorksSteps = [
  { n: '01', title: 'Receive order', desc: 'Get confirmed orders from brands.' },
  { n: '02', title: 'Plan line', desc: 'Assign styles, plan capacity and materials.' },
  { n: '03', title: 'Run production', desc: 'Track progress, log quality and resolve issues.' },
  { n: '04', title: 'Update brand', desc: 'Keep brands informed in real time.' },
];


/* ════════════════════════════════════════════════
   CONNECTED SUPPLY CHAIN — for brands: "One source of truth for your production."
════════════════════════════════════════════════ */
const connectorIcons = [LayoutGrid, ClipboardList, Factory, ShieldCheck, Package, BarChart3, Settings];

const factoryOpsRows = [
  { id: 'FM-HOOD-004', stage: 'Sewing', progress: 72, updated: '2h ago' },
  { id: 'FM-TS-101', stage: 'Finishing', progress: 40, updated: '4h ago' },
  { id: 'FM-JOG-201', stage: 'Cutting', progress: 85, updated: '6h ago' },
  { id: 'FM-SWT-301', stage: 'Packing', progress: 20, updated: '1d ago' },
];

const yourDashboardRows = [
  { id: 'FM-HOOD-004', stage: 'In production', progress: 72, updated: '2h ago' },
  { id: 'FM-TS-101', stage: 'Sampling', progress: 40, updated: '4h ago' },
  { id: 'FM-JOG-201', stage: 'In production', progress: 85, updated: '6h ago' },
  { id: 'FM-SWT-301', stage: 'Material prep', progress: 20, updated: '1d ago' },
];

const BrandSupplyChainSection = () => (
  <section className="py-20 md:py-24 px-6" style={{ background: BG }}>
    <div className="mx-auto max-w-[1300px]">
      <div className="reveal max-w-lg mb-10">
        <Eyebrow>A connected supply chain</Eyebrow>
        <h2 className="font-dm-sans font-semibold leading-[1.15] mb-3" style={{ color: INK, fontSize: 'clamp(24px, 2.8vw, 34px)' }}>
          One source of truth<br />for your production.
        </h2>
        <p className="font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '14px' }}>
          Factories update production in real time. You get instant visibility.
        </p>
      </div>

      <div className="reveal grid md:grid-cols-[1.5fr_auto_1fr] gap-4 items-center">
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
            <div className="hidden sm:grid grid-cols-[1fr_0.8fr_0.9fr_0.7fr] gap-1 mb-2">
              {['Order', 'Stage', 'Progress', 'Updated'].map((h) => (
                <span key={h} className="text-[8px] uppercase font-inter" style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</span>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              {factoryOpsRows.map((r) => (
                <div key={r.id} className="grid grid-cols-2 sm:grid-cols-[1fr_0.8fr_0.9fr_0.7fr] gap-1 items-center">
                  <span className="text-[10px] font-inter truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{r.id}</span>
                  <span className="hidden sm:block text-[10px] font-inter truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.stage}</span>
                  <div className="hidden sm:block w-full h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full rounded-full" style={{ width: `${r.progress}%`, background: PURPLE }} />
                  </div>
                  <span className="text-[10px] font-inter text-right sm:text-left" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.updated}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center gap-2">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: PURPLE }}>
            <img src="/logo-mark.png" alt="" className="w-6 h-6 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          </span>
          <span className="text-[9px] uppercase tracking-[0.1em] font-inter" style={{ color: MUTED }}>Synced</span>
        </div>

        <div className="rounded-2xl p-4 shadow-md" style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
          <p className="text-[10px] font-dm-sans font-medium mb-3" style={{ color: INK }}>Your Dashboard</p>
          <div className="hidden sm:grid grid-cols-[1fr_0.8fr_0.9fr_0.7fr] gap-1 mb-2">
            {['Order', 'Stage', 'Progress', 'Updated'].map((h) => (
              <span key={h} className="text-[8px] uppercase font-inter" style={{ color: MUTED }}>{h}</span>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            {yourDashboardRows.map((r) => (
              <div key={r.id} className="grid grid-cols-2 sm:grid-cols-[1fr_0.8fr_0.9fr_0.7fr] gap-1 items-center">
                <span className="text-[10px] font-inter truncate" style={{ color: INK }}>{r.id}</span>
                <span className="hidden sm:block text-[10px] font-inter truncate" style={{ color: MUTED2 }}>{r.stage}</span>
                <div className="hidden sm:block w-full h-[3px] rounded-full overflow-hidden" style={{ background: BORDER }}>
                  <div className="h-full rounded-full" style={{ width: `${r.progress}%`, background: PURPLE }} />
                </div>
                <span className="text-[10px] font-inter text-right sm:text-left" style={{ color: MUTED }}>{r.updated}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   CONNECTED SUPPLY CHAIN — for manufacturers: "Real-time production. Total brand visibility."
════════════════════════════════════════════════ */
const factoryUpdatesLog = [
  { time: '10 Sep, 10:24', id: 'FM-HOOD-004', stage: 'Sewing' },
  { time: '10 Sep, 09:11', id: 'FM-TS-101', stage: 'Finishing' },
  { time: '09 Sep, 16:20', id: 'FM-JOG-201', stage: 'Cutting' },
  { time: '09 Sep, 14:05', id: 'FM-SWT-301', stage: 'Quality' },
];

const brandVisibilityRows = [
  { id: 'FM-HOOD-004', status: 'In production', progress: 72, due: '08 Sep' },
  { id: 'FM-TS-101', status: 'In production', progress: 48, due: '10 Sep' },
  { id: 'FM-JOG-201', status: 'In production', progress: 85, due: '12 Sep' },
  { id: 'FM-SWT-301', status: 'In production', progress: 60, due: '15 Sep' },
];

const ManufacturerSupplyChainSection = () => (
  <section className="py-20 md:py-24 px-6" style={{ background: BG }}>
    <div className="mx-auto max-w-[1300px]">
      <div className="reveal max-w-lg mb-10">
        <Eyebrow>A connected supply chain</Eyebrow>
        <h2 className="font-dm-sans font-semibold leading-[1.15] mb-3" style={{ color: INK, fontSize: 'clamp(24px, 2.8vw, 34px)' }}>
          Real-time production.<br />Total brand visibility.
        </h2>
        <p className="font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '14px' }}>
          Your updates automatically sync with brands — so everyone works from the same data.
        </p>
      </div>

      <div className="reveal grid md:grid-cols-[1.5fr_auto_1fr] gap-4 items-center">
        <div className="rounded-2xl overflow-hidden flex" style={{ background: DARK_PANEL }}>
          <div className="hidden sm:flex flex-col items-center gap-2 py-4 px-2.5 flex-shrink-0" style={{ borderRight: `1px solid ${BORDER_DARK}` }}>
            {connectorIcons.map((Icon, i) => (
              <span key={i} className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: i === 0 ? PURPLE_BG : 'transparent' }}>
                <Icon className="w-3 h-3" style={{ color: i === 0 ? PURPLE : 'rgba(255,255,255,0.4)' }} />
              </span>
            ))}
          </div>
          <div className="flex-1 min-w-0 p-4">
            <p className="text-[10px] font-dm-sans font-medium mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>Factory Updates</p>
            <div className="flex flex-col gap-2.5">
              {factoryUpdatesLog.map((r) => (
                <div key={r.id} className="grid grid-cols-2 sm:grid-cols-[1fr_0.9fr_0.8fr_0.6fr] gap-1 items-center">
                  <span className="hidden sm:block text-[9px] font-inter truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{r.time}</span>
                  <span className="text-[10px] font-inter truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{r.id}</span>
                  <span className="text-[10px] font-inter truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.stage}</span>
                  <span className="text-[10px] font-inter text-right sm:text-left" style={{ color: GREEN }}>Updated</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center gap-2">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: PURPLE }}>
            <img src="/logo-mark.png" alt="" className="w-6 h-6 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          </span>
          <span className="text-[9px] uppercase tracking-[0.1em] font-inter" style={{ color: MUTED }}>Synced</span>
        </div>

        <div className="rounded-2xl p-4 shadow-md" style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-dm-sans font-medium" style={{ color: INK }}>Brand Visibility</p>
            <span className="inline-flex items-center gap-1 text-[9px] font-inter font-medium px-2 py-0.5 rounded-full" style={{ background: GREEN_BG, color: GREEN }}>
              <CircleDot className="w-2 h-2" /> Live
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {brandVisibilityRows.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-inter truncate" style={{ color: INK }}>{r.id}</span>
                <span className="text-[9px] font-inter font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: PURPLE_BG, color: PURPLE }}>{r.status}</span>
                <div className="w-10 h-[3px] rounded-full overflow-hidden flex-shrink-0" style={{ background: BORDER }}>
                  <div className="h-full rounded-full" style={{ width: `${r.progress}%`, background: PURPLE }} />
                </div>
                <span className="text-[10px] font-inter flex-shrink-0" style={{ color: MUTED }}>{r.due}</span>
              </div>
            ))}
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
        <p className="font-inter leading-relaxed max-w-md" style={{ color: MUTED2, fontSize: '15px' }}>
          Formme is built with factory partners who understand real production challenges.
        </p>
      </div>

      <div className="reveal relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16 / 7.5' }}>
        <img src="/factory.jpg" alt="Supreme Stitch factory floor" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(225deg, rgba(21,19,28,0.65) 0%, rgba(21,19,28,0.15) 35%, rgba(21,19,28,0) 60%)' }} />

        <div className="absolute right-5 top-5 max-w-[220px] text-right">
          <p className="font-cormorant italic leading-snug" style={{ color: '#fff', fontSize: '17px', textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
            &ldquo;Formme helps us stay organized, responsive, and on schedule.&rdquo;
          </p>
          <p className="text-[11px] font-inter mt-2" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}>
            — Production Director<br />Dhaka, Bangladesh
          </p>
        </div>
      </div>
    </div>
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
const FinalCTA = ({ heading, accent, prompt }: { heading: string; accent: string; prompt: string }) => (
  <section className="py-20 md:py-24 px-6" style={{ background: BG }}>
    <div className="mx-auto max-w-[1300px] flex flex-col md:flex-row md:items-center md:justify-between gap-8">
      <h2 className="reveal font-dm-sans font-semibold leading-[1.15]" style={{ color: INK, fontSize: 'clamp(28px, 4vw, 46px)' }}>
        {heading}{' '}
        <span className="font-cormorant italic font-medium" style={{ color: PURPLE }}>{accent}</span>
      </h2>
      <div className="reveal flex flex-col items-start gap-3">
        <p className="font-inter" style={{ color: MUTED2, fontSize: '14px' }}>{prompt}</p>
        <SolidButton href={CONTACT_HREF}>Get in touch <ArrowRight className="w-3.5 h-3.5" /></SolidButton>
      </div>
    </div>
  </section>
);

/* ════════════════════════════════════════════════
   AUDIENCE-SPECIFIC LANDING EXPERIENCES
════════════════════════════════════════════════ */
const BrandLandingExperience = () => (
  <>
    <MerchBanner />
    <BrandHero />
    <BrandChecklistSection />
    <HowItWorksSection
      audienceLabel="brands"
      headingLine1="From idea to delivery."
      headingAccent="All in one place."
      steps={brandHowItWorksSteps}
    />
    <BrandSupplyChainSection />
    <FinalCTA heading="Orders. Production. Quality. Shipment." accent="Connected." prompt="Ready to get started?" />
  </>
);

const ManufacturerLandingExperience = () => (
  <>
    <ManufacturerHero />
    <ManufacturerChecklistSection />
    <HowItWorksSection
      audienceLabel="manufacturers"
      headingLine1="From order to shipment."
      headingAccent="All in one place."
      steps={manufacturerHowItWorksSteps}
    />
    <ManufacturerSupplyChainSection />
    <FactoryFloorSection />
    <FinalCTA heading="Plan. Produce. Inspect. Ship." accent="Connected." prompt="Ready to modernize your factory operations?" />
  </>
);

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
            {audience === 'brand' ? <BrandLandingExperience /> : <ManufacturerLandingExperience />}
          </motion.div>
        )}
      </AnimatePresence>

      <LandingFooter />
    </div>
  );
};

export default Index;
