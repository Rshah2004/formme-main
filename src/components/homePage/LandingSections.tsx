import { ArrowRight } from 'lucide-react';
import { CONTACT_HREF } from './LandingChrome';
import type { Audience } from './theme';

type AudienceProps = { audience: Audience };

export function ProductionSpecs() {
  return (
    <section className="production-section landing-specs" aria-labelledby="specs-title">
      <div className="production-container">
        <div className="production-section-heading">
          <div>
            <span className="production-eyebrow">WHAT YOU CAN MAKE</span>
            <h2 id="specs-title">Small runs and full collections.</h2>
          </div>
          <p>Our partner factories cover most apparel categories, with minimums low enough to start small.</p>
        </div>

        <div className="landing-spec-grid">
          {specs.map(({ label, value, note }) => (
            <div key={label}>
              <span className="landing-spec-label">{label}</span>
              <strong>{value}</strong>
              <p>{note}</p>
            </div>
          ))}
        </div>

        <div className="landing-types">
          <span className="landing-types-label">CATEGORIES</span>
          <div>{productTypes.map(type => <span key={type}>{type}</span>)}</div>
        </div>
      </div>
    </section>
  );
}

const faqs: Record<Audience, { q: string; a: string }[]> = {
  brand: [
    { q: 'What’s the minimum order quantity?', a: 'It depends on the factory and the garment. Our low-MOQ partners start from around 30 pieces per style, which is enough to test a product before committing to a full run. Larger factories in the network are better suited to bulk orders.' },
    { q: 'How long does production take?', a: 'Bulk production typically runs three to four weeks once your samples are approved. Sampling happens before that and varies with how many rounds of revision a product needs.' },
    { q: 'Do I need a tech pack?', a: 'Yes. The tech pack is what a factory quotes and produces against, so you’ll need one to get started, along with your target quantity and timeline.' },
    { q: 'Where are the factories?', a: 'Our current partners are in Bangladesh and China, all export-ready for the USA, Canada, the UK, Europe, and Australia.' },
    { q: 'Are the factories audited?', a: 'Our partners hold certifications including BSCI, SEDEX, OEKO-TEX, WRAP, and ACCORD, and run structured quality control across both sampling and bulk production.' },
    { q: 'What does it cost?', a: 'Cost depends on the garment, fabric, decoration, and quantity. Our cost predictor gives instant estimates for custom T-shirts and hoodies; for anything else, send us your details and we’ll come back with a quote.' },
  ],
  manufacturer: [
    { q: 'What does Formme replace?', a: 'The scattered email threads, spreadsheets, and status calls around each order. Order requirements, production progress, quality records, and shipment details live on one shared record instead.' },
    { q: 'Do we have to change how we work?', a: 'No. Formme records the stages your floor already runs — cutting, sewing, finishing, QC, packing. Your team updates progress where the work happens.' },
    { q: 'What do our customers see?', a: 'The brand sees the same order record you do: current stage, progress, and expected dates. That removes most of the status requests your team fields today.' },
    { q: 'Does this bring us new orders?', a: 'Formme matches brands with factories suited to their product and quantity. Being on the network puts your capacity in front of brands looking for a production partner.' },
    { q: 'How do we get started?', a: 'Get in touch and we’ll walk through your current order flow, then set up your lines and live orders so your team can try it on real work.' },
  ],
};

export function LandingFaq({ audience }: AudienceProps) {
  return (
    <section className="production-section landing-faq" aria-labelledby="faq-title">
      <div className="production-container">
        <div className="production-section-heading">
          <div>
            <span className="production-eyebrow">QUESTIONS</span>
            <h2 id="faq-title">Before you get in touch.</h2>
          </div>
          <p>Something not covered here? <a className="production-text-link" href={CONTACT_HREF}>Ask us directly <ArrowRight size={14} /></a></p>
        </div>
        <div className="landing-faq-list">
          {faqs[audience].map(({ q, a }) => (
            <details key={q}>
              <summary>{q}<span aria-hidden="true" /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
