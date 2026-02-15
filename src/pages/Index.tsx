import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/Navbar';
import FabricBackdrop from '@/components/homePage/FabricBackdrop';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  BadgeCheck,
  Factory,
  FileText,
  Handshake,
  Leaf,
  PenTool,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen font-inter bg-[#F6EFE4] text-[#101010]">
      <FabricBackdrop />
      <NavBar />

      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[8%] top-6 h-[420px] w-[420px] rounded-full bg-[#2F3E35]/12 blur-[130px]" />
          <div className="absolute right-[6%] top-16 h-[460px] w-[460px] rounded-full bg-[#9B5A38]/12 blur-[140px]" />
        </div>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
            <div>
              <p className="uppercase tracking-[0.35em] text-xs text-[#2E3F36] mb-4">
                Formme for designers + production
              </p>
              <h1 className="text-[44px] sm:text-[64px] md:text-[86px] font-instrument font-semibold leading-[0.95]">
                A production platform with studio-grade precision.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-[#3D3D3D] max-w-xl">
                Create, spec, and manufacture with the clarity of an atelier and the reliability of a vetted supply network.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button className="bg-[#2F3E35] hover:bg-[#243229] text-white rounded-full py-6 px-8">
                  Request access
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Link to="/designer">
                  <Button
                    variant="outline"
                    className="rounded-full py-6 px-8 border-[#2F3E35] text-[#2F3E35] hover:bg-[#2F3E35] hover:text-white"
                  >
                    Launch Designer
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-3 text-xs text-[#6B6B6B]">
                <span className="px-3 py-1 rounded-full border border-[#E7E1D7] bg-white/70">Sampling-first</span>
                <span className="px-3 py-1 rounded-full border border-[#E7E1D7] bg-white/70">MOQ-friendly</span>
                <span className="px-3 py-1 rounded-full border border-[#E7E1D7] bg-white/70">Material transparency</span>
                <span className="px-3 py-1 rounded-full border border-[#E7E1D7] bg-white/70">Live QC</span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[28px] border border-[#E7E1D7] bg-white/85 backdrop-blur-md p-6 sm:p-8 shadow-[0_28px_90px_rgba(0,0,0,0.16)]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#2E3F36]">Active order</p>
                    <h3 className="text-2xl font-semibold">FM-1098</h3>
                  </div>
                  <span className="rounded-full bg-[#2F3E35]/10 px-3 py-1 text-xs font-semibold text-[#2F3E35]">
                    In sampling
                  </span>
                </div>
                <div className="rounded-2xl border border-[#EFE6DA] bg-[#FDF9F3] p-5">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Tech Pack', value: 'Locked' },
                      { label: 'Sample ETA', value: 'Apr 18' },
                      { label: 'Lead Time', value: '5–7 weeks' },
                      { label: 'Unit Cost', value: '$12.40' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-white border border-[#EFE6DA] p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">{item.label}</p>
                        <p className="text-sm font-semibold text-[#121212]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-xl border border-[#EFE6DA] bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B] mb-2">Update</p>
                    <p className="text-sm text-[#3D3D3D]">
                      Factory uploaded fit photos. Awaiting designer approval.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Fit notes', 'Materials', 'Costing', 'QC'].map((chip) => (
                    <span key={chip} className="rounded-full bg-[#121212]/5 px-3 py-1 text-xs font-semibold">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-8 -right-6 h-32 w-32 rounded-3xl bg-[#2F3E35] text-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Network</p>
                <p className="text-xl font-semibold mt-1">120+</p>
                <p className="text-xs text-white/70 mt-2">Vetted factories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="relative py-10 sm:py-12 bg-white/60 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs text-[#2E3F36] mb-2">Trusted by</p>
              <h3 className="text-xl sm:text-2xl font-semibold">
                Independent studios, brand founders, and production teams
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm text-[#6B6B6B]">
              {['Studio North', 'Loom Labs', 'Common Thread', 'Atelier Works'].map((name) => (
                <div
                  key={name}
                  className="rounded-full border border-[#E7E1D7] bg-white/80 px-4 py-2 text-center uppercase tracking-[0.2em]"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="relative py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center mb-10 sm:mb-14">
            <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-[#2E3F36] mb-3">
              Built for independent brands
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4">
              A production system that feels as refined as your product
            </h2>
            <p className="text-base sm:text-lg text-[#344C3D] max-w-3xl mx-auto">
              Formme pairs a modern design studio with a vetted manufacturing network so you can move from sketch to shipment without chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: 'Design to spec, not guesswork',
                body: 'Precision tech packs, production parameters, and approvals in one place.',
                icon: FileText,
              },
              {
                title: 'Match with the right factory',
                body: 'Capability-based matching that respects MOQ, lead time, and materials.',
                icon: Factory,
              },
              {
                title: 'Ship with confidence',
                body: 'Live updates, proofs, and QC checkpoints to protect quality.',
                icon: BadgeCheck,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#E7E1D7] bg-white/85 backdrop-blur-md p-6 sm:p-7 shadow-[0_16px_46px_rgba(0,0,0,0.10)]"
              >
                <div className="h-12 w-12 rounded-xl bg-[#344C3D]/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-[#344C3D]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#121212] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-[#5A5A5A] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Preview */}
      <section className="relative py-16 sm:py-24 bg-[#F1E8DA]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
            <div className="rounded-[28px] border border-[#E7E1D7] bg-white/85 backdrop-blur-md p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.14)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#2E3F36]">Live studio</p>
                  <h3 className="text-2xl font-semibold text-[#121212]">Design workspace</h3>
                </div>
                <span className="rounded-full bg-[#344C3D]/10 px-3 py-1 text-xs font-semibold text-[#344C3D]">
                  Prototype
                </span>
              </div>
              <div className="rounded-2xl border border-[#EFE6DA] bg-[#FDF9F3] p-5">
                <div className="flex items-center justify-between text-xs text-[#7B7B7B] mb-4">
                  <span>Layers</span>
                  <span>Materials</span>
                  <span>Measurements</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['Front panel', 'Back panel', 'Sleeve'].map((layer) => (
                    <div key={layer} className="rounded-xl bg-white border border-[#EFE6DA] p-3 text-sm text-[#121212]">
                      {layer}
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white border border-[#EFE6DA] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">Fabric</p>
                    <p className="text-sm font-semibold text-[#121212]">Organic cotton, 220gsm</p>
                  </div>
                  <div className="rounded-xl bg-white border border-[#EFE6DA] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">Color</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="h-4 w-4 rounded-full bg-[#344C3D]" />
                      <span className="text-sm font-semibold text-[#121212]">Evergreen</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {['Auto tech pack', 'Revision history', 'Fit notes', 'File exports'].map((chip) => (
                  <span key={chip} className="rounded-full bg-[#121212]/5 px-3 py-1 text-xs font-semibold text-[#121212]">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-[#2E3F36] mb-3">
                Creative control
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] mb-4">
                Make production feel as creative as design
              </h2>
              <p className="text-base sm:text-lg text-[#344C3D] mb-6">
                Formme keeps your process cohesive — from sketches and spec sheets to approvals and production tracking.
              </p>
              <div className="space-y-3">
                {[
                  'Unified asset library for images, patterns, and tech packs',
                  'Automated measurement tables and construction notes',
                  'Factory messaging tied directly to order stages',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#344C3D]" />
                    <p className="text-sm sm:text-base text-[#5A5A5A]">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="relative py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-[#2E3F36] mb-3">
                Workflow
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] mb-4">
                From concept to delivery, mapped into a clean pipeline
              </h2>
              <p className="text-base sm:text-lg text-[#344C3D] mb-6">
                Formme is a production OS. Every decision has a place, every handoff is tracked, and every update is visible.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full bg-[#344C3D]/10 text-[#344C3D] text-xs font-semibold">Design Studio</span>
                <span className="px-3 py-1 rounded-full bg-[#974320]/10 text-[#974320] text-xs font-semibold">Tech Packs</span>
                <span className="px-3 py-1 rounded-full bg-[#1F2933]/10 text-[#1F2933] text-xs font-semibold">Production Tracking</span>
                <span className="px-3 py-1 rounded-full bg-[#2E3F36]/10 text-[#2E3F36] text-xs font-semibold">Quality Gate</span>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E7E1D7] bg-white/85 backdrop-blur-md p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.12)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Design', icon: PenTool, note: 'Upload sketches + references' },
                  { label: 'Spec', icon: FileText, note: 'Measurements, fabrics, trims' },
                  { label: 'Match', icon: Users, note: 'Factories tailored to your needs' },
                  { label: 'Align', icon: Handshake, note: 'Approve samples and pricing' },
                  { label: 'Produce', icon: Factory, note: 'Live updates and milestones' },
                  { label: 'Deliver', icon: Truck, note: 'QC, shipping, and receipts' },
                ].map((step) => (
                  <div key={step.label} className="rounded-2xl bg-white/80 border border-[#EFE6DA] p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-lg bg-[#121212]/5 flex items-center justify-center">
                        <step.icon className="h-5 w-5 text-[#121212]" />
                      </div>
                      <span className="text-sm font-semibold text-[#121212]">{step.label}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#5A5A5A]">{step.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="relative py-16 sm:py-24 bg-white/65 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-14">
            <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-[#2E3F36] mb-3">Services</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4">
              Production support that scales with you
            </h2>
            <p className="text-base sm:text-lg text-[#344C3D]">
              Whether you’re developing your first run or managing multiple collections, the workflow flexes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { title: 'Sampling', body: 'Fit rounds, grading, and sample tracking in one view.' },
              { title: 'Costing', body: 'Unit economics, shipping, and margin views.' },
              { title: 'Quality', body: 'QC checklists and approvals for every stage.' },
              { title: 'Logistics', body: 'Shipping timelines, invoices, and delivery updates.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#E7E1D7] bg-white/90 p-5 shadow-[0_14px_38px_rgba(0,0,0,0.1)]">
                <h3 className="text-lg font-semibold text-[#121212] mb-2">{item.title}</h3>
                <p className="text-sm text-[#5A5A5A] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Network */}
      <section className="relative py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 rounded-3xl border border-[#E7E1D7] bg-gradient-to-br from-white/85 via-white/70 to-white/50 backdrop-blur-md p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-[#2E3F36] mb-3">
                Manufacturing network
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] mb-4">
                A curated global network, built for quality
              </h2>
              <p className="text-base sm:text-lg text-[#344C3D] mb-6 max-w-2xl">
                We work with manufacturers who understand independent brands — flexible MOQs, transparent lead times, and real craftsmanship.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { value: '120+', label: 'Vetted partners' },
                  { value: '18', label: 'Countries' },
                  { value: '3-6', label: 'Week lead times' },
                  { value: '98%', label: 'On-time rate' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white/90 border border-[#EFE6DA] p-4 text-center">
                    <div className="text-xl sm:text-2xl font-semibold text-[#121212]">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-[#5A5A5A]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#E7E1D7] bg-[#2E3F36] text-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-[#FFF7DE]" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/60">Sustainability</p>
                  <p className="text-lg font-semibold">Material transparency</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-white/80 mb-6">
                Track fabric sourcing, dye methods, and certifications for every production run. Sustainability isn’t a feature — it’s the default.
              </p>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {['GOTS', 'OEKO-TEX', 'GRS', 'Bluesign'].map((c) => (
                    <span key={c} className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/80">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Production OS */}
      <section className="relative py-16 sm:py-24 bg-[#F1E8DA]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="rounded-3xl border border-[#E7E1D7] bg-white/85 backdrop-blur-md p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#2E3F36]">Live production view</p>
                  <h3 className="text-2xl font-semibold text-[#121212]">Order: FM-1042</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#2E3F36]/10 text-[#2E3F36] text-xs font-semibold">
                  On Track
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Tech pack confirmed', status: 'Complete' },
                  { label: 'Production parameters approved', status: 'Complete' },
                  { label: 'Sampling in progress', status: 'In Review' },
                  { label: 'Quality check scheduled', status: 'Upcoming' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-xl border border-[#EFE6DA] bg-white/90 p-3">
                    <span className="text-sm text-[#121212]">{row.label}</span>
                    <span className="text-xs font-semibold text-[#344C3D]">{row.status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#974320]/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#974320]">ETA</p>
                  <p className="text-lg font-semibold text-[#121212]">Apr 22</p>
                </div>
                <div className="rounded-xl bg-[#344C3D]/10 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#344C3D]">Unit cost</p>
                  <p className="text-lg font-semibold text-[#121212]">$12.40</p>
                </div>
              </div>
            </div>

            <div>
              <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-[#2E3F36] mb-3">
                The studio
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] mb-4">
                A clean workspace for serious production decisions
              </h2>
              <p className="text-base sm:text-lg text-[#344C3D] mb-6">
                No more scattered files and endless threads. Every approval, note, and file lives in a focused workspace.
              </p>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[#121212]/5 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-[#121212]" />
                </div>
                <p className="text-sm text-[#5A5A5A]">
                  Built for independent designers who care about quality, pace, and control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-[#2E3F36] mb-3">FAQ</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4">
                Common questions from designers
              </h2>
              <p className="text-base sm:text-lg text-[#344C3D]">
                Clear answers so you can move forward with confidence.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: 'Do I need a full tech pack before joining?',
                  a: 'No. Formme helps you build tech packs progressively as you design and refine.',
                },
                {
                  q: 'Can I work with my existing manufacturer?',
                  a: 'Yes. You can invite your own factory or use the Formme network.',
                },
                {
                  q: 'How are lead times handled?',
                  a: 'Every order includes agreed timelines and live progress updates from your manufacturer.',
                },
                {
                  q: 'Is Formme suitable for small runs?',
                  a: 'Yes. We support flexible MOQs and sampling-first workflows.',
                },
              ].map((item) => (
                <div key={item.q} className="rounded-2xl border border-[#E7E1D7] bg-white/85 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
                  <h3 className="text-base sm:text-lg font-semibold text-[#121212] mb-2">{item.q}</h3>
                  <p className="text-sm sm:text-base text-[#5A5A5A]">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 sm:py-24 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-3xl border border-[#E7E1D7] bg-white/90 backdrop-blur-md p-8 sm:p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] mb-4">
              Build with Formme
            </h2>
            <p className="text-base sm:text-lg text-[#344C3D] mb-8 max-w-3xl mx-auto">
              Start your next collection with a production partner and a platform that feels as elevated as your brand.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
              <Input
                type="email"
                placeholder="Work email"
                className="w-full sm:flex-1 bg-white/90 border-[#E7E1D7]"
              />
              <Button className="w-full sm:w-auto bg-[#2F3E35] hover:bg-[#243229] text-white rounded-full py-6 px-8">
                Request access
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-[#5A5A5A]">
              <span>Designers</span>
              <span>Manufacturers</span>
              <span>Production managers</span>
            </div>
            <div className="mt-8">
              <Link to="/designer" className="inline-block w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="group w-full sm:w-auto border-[#2F3E35] text-[#2F3E35] hover:bg-[#2F3E35] hover:text-white rounded-full py-5 px-8"
                >
                  Launch Designer
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
