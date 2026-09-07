import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Audience } from './theme';

const gateCopy: Record<Audience, {
  eyebrow: string;
  heading: string;
  description: string;
}> = {
  brand: {
    eyebrow: 'FOR BRANDS',
    heading: 'I’m a Brand',
    description: 'I want to get apparel produced.',
  },
  manufacturer: {
    eyebrow: 'FOR MANUFACTURERS',
    heading: 'I’m a Manufacturer',
    description: 'I want to manage apparel production.',
  },
};

const cardContainerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } };
const cardItemVariants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const cardContainerVariantsReduced = { hidden: {}, show: { transition: { staggerChildren: 0 } } };
const cardItemVariantsReduced = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } };

const GateCard = ({
  audience, active, dimmed, reduced, onSelect,
}: { audience: Audience; active: boolean; dimmed: boolean; reduced?: boolean; onSelect: (a: Audience) => void }) => {
  const copy = gateCopy[audience];
  return (
    <motion.div variants={reduced ? cardItemVariantsReduced : cardItemVariants}>
      <button
        type="button"
        onClick={() => onSelect(audience)}
        aria-label={`${copy.heading} — ${copy.description}`}
        className={`gate-card gate-card-${audience}`}
        data-active={active}
        data-dimmed={dimmed}
      >
        <span className="gate-card-top"><span className="production-eyebrow">{copy.eyebrow}</span></span>
        <h2>{copy.heading}</h2>
        <p className="gate-card-desc">{copy.description}</p>
        <span className="gate-card-summary">{audience === 'brand' ? 'We help find your manufacturer and manage production for your brand.' : 'Plan your lines. Track every order. Keep your brands in the loop.'}</span>
        <span className="gate-capabilities">{(audience === 'brand' ? ['Factory matching', 'Sample approvals', 'Order tracking'] : ['Production planning', 'Quality checks', 'Brand updates']).map(label => <span key={label}>{label}</span>)}</span>
        <span className="gate-card-cta">Explore {audience === 'brand' ? 'for brands' : 'for manufacturers'} <ArrowRight size={16} /></span>
      </button>
    </motion.div>
  );
};

/**
 * Every visit to the homepage starts with an explicit audience choice.
 * Selecting a card opens that audience's landing experience.
 */
export const AudienceGate = ({ onSelect, prefersReduced }: { onSelect: (a: Audience) => void; prefersReduced: boolean }) => {
  const [pending, setPending] = useState<Audience | null>(null);

  const handleSelect = (a: Audience) => {
    if (pending) return;
    setPending(a);
    window.setTimeout(() => onSelect(a), prefersReduced ? 0 : 420);
  };

  return (
    <section className="gate-section" aria-label="Choose your Formme experience">
      <motion.div
        className="production-container gate-intro"
        initial={prefersReduced ? undefined : { opacity: 0, y: 16 }}
        animate={{ opacity: pending ? 0.35 : 1, y: 0 }}
        transition={{ duration: prefersReduced ? 0.15 : 0.5, ease: 'easeOut' }}
      >
        <span className="production-eyebrow"><span className="production-dot" /> FASHION PRODUCTION, CONNECTED</span>
        <h1>Are you a brand<br /><em>or a manufacturer?</em></h1>
        <p>
          From first sample to final shipment, Formme keeps your production connected.
          Choose your side to see how it works.
        </p>
      </motion.div>

      <div className="production-container">
        <motion.div
          className="gate-cards"
          variants={prefersReduced ? cardContainerVariantsReduced : cardContainerVariants}
          initial="hidden"
          animate="show"
        >
          <GateCard audience="brand" active={pending === 'brand'} dimmed={pending === 'manufacturer'} reduced={prefersReduced} onSelect={handleSelect} />
          <GateCard audience="manufacturer" active={pending === 'manufacturer'} dimmed={pending === 'brand'} reduced={prefersReduced} onSelect={handleSelect} />
        </motion.div>
        <p className="gate-footnote">Two sides of production. One shared workspace.<span>You can switch experiences anytime.</span></p>
      </div>
    </section>
  );
};
