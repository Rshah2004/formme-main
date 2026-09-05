import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { INK, LAVENDER, MUTED, MUTED2, PURPLE, PURPLE_BG } from './theme';
import type { Audience } from './theme';

const gateSteps = ['Orders', 'Sampling', 'Production', 'Quality', 'Shipment'];

const cardCopy: Record<Audience, { eyebrow: string; heading: string; description: string; supporting: string; preview: string }> = {
  brand: {
    eyebrow: 'For brands',
    heading: 'I’m a Brand',
    description: 'I want to get apparel produced.',
    supporting: 'Find production partners and follow your order from development to shipment.',
    preview: 'Tech pack · 600 pcs · Washed black',
  },
  manufacturer: {
    eyebrow: 'For manufacturers',
    heading: 'I’m a Manufacturer',
    description: 'I want to manage apparel production.',
    supporting: 'Manage orders, production, quality and customer visibility from one system.',
    preview: 'Line 04 · Sewing · 72%',
  },
};

const cardContainerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } };
const cardItemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const cardContainerVariantsReduced = { hidden: {}, show: { transition: { staggerChildren: 0 } } };
const cardItemVariantsReduced = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } };

const AudienceCard = ({
  audience, active, dimmed, reduced, onSelect,
}: { audience: Audience; active: boolean; dimmed: boolean; reduced?: boolean; onSelect: (a: Audience) => void }) => {
  const copy = cardCopy[audience];
  return (
    // Entrance stagger lives on this wrapper only, so it settles at a fixed opacity/position
    // after mounting and never fights with the plain button's own dimmed/active styling below.
    <motion.div variants={reduced ? cardItemVariantsReduced : cardItemVariants} className="flex-1">
      <button
        type="button"
        onClick={() => onSelect(audience)}
        aria-label={`${copy.heading} — ${copy.description}`}
        className="group relative w-full h-full text-left rounded-2xl bg-white p-7 md:p-8 transition-[border-color,box-shadow,opacity] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D52D6] focus-visible:ring-offset-2"
        style={{
          border: `1.5px solid ${active ? PURPLE : '#E7E3F5'}`,
          boxShadow: active ? '0 12px 32px -16px rgba(93,82,214,0.35)' : '0 8px 24px -18px rgba(21,19,28,0.08)',
          opacity: dimmed ? 0.5 : 1,
        }}
      >
        <span className="inline-block text-[10px] uppercase tracking-[0.1em] font-inter font-semibold mb-4" style={{ color: PURPLE }}>
          {copy.eyebrow}
        </span>
        <h2 className="font-cormorant font-medium mb-2" style={{ color: INK, fontSize: 'clamp(24px, 2.4vw, 30px)' }}>
          {copy.heading}
        </h2>
        <p className="font-inter mb-3" style={{ color: INK, fontSize: '14px' }}>
          {copy.description}
        </p>
        <p className="font-inter leading-relaxed mb-6" style={{ color: MUTED2, fontSize: '13px' }}>
          {copy.supporting}
        </p>

        <div
          className="mb-6 rounded-lg px-3 py-2 opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
          style={{ background: PURPLE_BG }}
        >
          <span className="text-[11px] font-dm-sans font-medium" style={{ color: PURPLE }}>{copy.preview}</span>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[13px] font-inter font-medium" style={{ color: PURPLE }}>
          Continue
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </button>
    </motion.div>
  );
};

/**
 * The very first thing a visitor sees: a minimal neutral positioning statement, then a single
 * choice between the two Formme audiences. Unmounts (via the parent's AnimatePresence) once a
 * choice is made, handing off to the personalized homepage content.
 */
export const AudienceGate = ({ onSelect, prefersReduced }: { onSelect: (a: Audience) => void; prefersReduced: boolean }) => {
  const [pending, setPending] = useState<Audience | null>(null);

  const handleSelect = (a: Audience) => {
    if (pending) return;
    setPending(a);
    window.setTimeout(() => onSelect(a), prefersReduced ? 0 : 420);
  };

  return (
    <section className="relative" aria-label="Choose your Formme experience" style={{ background: LAVENDER }}>
      <div className="mx-auto max-w-[900px] px-6 pt-32 md:pt-40 pb-20 md:pb-24">
        <motion.div
          className="text-center"
          initial={prefersReduced ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: pending ? 0.35 : 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0.15 : 0.5, ease: 'easeOut' }}
        >
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-4"
            style={{ background: PURPLE_BG, color: PURPLE }}
          >
            Fashion production, connected
          </span>
          <h1 className="font-cormorant font-medium leading-[1.1] tracking-[-0.01em] mb-4" style={{ color: INK, fontSize: 'clamp(34px, 4.6vw, 52px)' }}>
            The operating system connecting fashion production.
          </h1>
          <p className="font-inter leading-relaxed max-w-lg mx-auto mb-10" style={{ color: MUTED2, fontSize: '15px' }}>
            Formme connects brands and apparel manufacturers from order to shipment.
          </p>
          <p className="text-[13px] font-inter font-medium mb-6" style={{ color: INK }}>
            What brings you to Formme?
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 gap-4 md:gap-5"
          variants={prefersReduced ? cardContainerVariantsReduced : cardContainerVariants}
          initial="hidden"
          animate="show"
        >
          <AudienceCard audience="brand" active={pending === 'brand'} dimmed={pending === 'manufacturer'} reduced={prefersReduced} onSelect={handleSelect} />
          <AudienceCard audience="manufacturer" active={pending === 'manufacturer'} dimmed={pending === 'brand'} reduced={prefersReduced} onSelect={handleSelect} />
        </motion.div>

        <p className="text-center mt-10 text-[11px] font-inter tracking-wide" style={{ color: MUTED }}>
          {gateSteps.join(' · ')}
        </p>
      </div>
    </section>
  );
};
