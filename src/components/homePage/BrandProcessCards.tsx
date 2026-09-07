import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import './brand-process-cards.css';

const factory = {
  name: 'Supreme Stitch Bangladesh',
  location: 'Dhaka, Bangladesh',
  product: 'Knitwear / jersey',
  crop: [70, 321, 103, 68],
} as const;

/* Three fields, not seven. The point of this column is to show that a brief
 * becomes something a factory can act on — not to publish an order sheet.
 * Target cost lives in the cost predictor, where the estimate carries its
 * caveat, rather than as a public price anchor. */
const requestSpecs = [
  ['Product', 'Heavyweight T-shirt'],
  ['Fabric', '240 GSM cotton'],
  ['Quantity', '600 pieces'],
];

// Display the supplied image pixels through a responsive viewport. Keeping the
// source intact avoids regenerating or substituting the requested product photo.
function ReferenceImage({ kind, className = '' }: { kind: 'tee' | 'factory'; className?: string }) {
  const [x, y, width, height] = kind === 'tee' ? [91, 387, 313, 274] : factory.crop;
  const sourceWidth = kind === 'tee' ? 1064 : 848;
  return <div className={`process-reference-image ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
    <img src={`/images/process-reference-${kind === 'tee' ? 'brief' : 'factories'}.png`}
      alt={kind === 'tee' ? 'Off-white oversized crew-neck T-shirt from the supplied product reference' : `Illustrative factory photograph for ${factory.name}`}
      loading="lazy" draggable={false}
      style={{ width: `${sourceWidth / width * 100}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }} />
  </div>;
}

/* A hand-drawn arc rather than a rule: the section is about a sequence, and the
 * sketch language already belongs to the page through the tech-pack drawings. */
/* Two drawings rather than one rotated. The wave reads as a wave only across a
 * wide gap; turned on its side into a single-column stack it became a 130px
 * squiggle that wandered rather than pointed. Narrow screens get a short
 * straight drop instead — same dashed language, a third of the height. */
function StepArrow() {
  return <>
    <svg className="process-arrow process-arrow-wide" viewBox="0 0 130 28" fill="none" aria-hidden="true">
      {/* Dashes on the arc only — a dashed head reads as broken rather than drawn. */}
      {/* Two cubics forming a wave: dips to y23, rises to y6, settles at y10.
          The head is angled to the final tangent (14 degrees), so it points along
          the path where it lands rather than across it. */}
      <path className="process-arrow-arc" d="M4 13C22 26 44 26 62 15C82 5 100 4 124 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.5 6" />
      <path d="M116.8 3 124 10 114.4 12.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <svg className="process-arrow process-arrow-narrow" viewBox="0 0 12 38" fill="none" aria-hidden="true">
      <path className="process-arrow-arc" d="M6 2V28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.5 6" />
      <path d="M1.8 26.4 6 32 10.2 26.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </>;
}

const steps = [
  { id: 'brief', title: 'Bring your design.', line: 'You send your tech pack and quantity. We take it from there.' },
  { id: 'partner', title: 'Find your people.', line: 'We match you from our network. You meet the factory.' },
  { id: 'production', title: 'Make it happen.', line: 'You approve the sample. We run production.' },
] as const;

/**
 * The three steps read as one timeline rather than a picker with a swapping
 * panel — the workspace section below already uses that shape, and running it
 * twice made the page feel repetitive. Showing all three at once also suits a
 * sequence: nobody should have to click three times to learn how this works.
 */
export function BrandProcessCards() {
  const [showFactory, setShowFactory] = useState(false);
  const factoryTrigger = useRef<HTMLButtonElement | null>(null);

  return <>
    <ol className="process-timeline" aria-label="How production runs with Formme">
      {steps.map((step, index) => (
        <li className={`process-stop process-stop-${step.id}`} key={step.id}>
          <div className="process-stop-head">
            <span className="process-stop-number">0{index + 1}</span>
            <h3>{step.title}</h3>
          </div>

          <p className="process-stop-line">{step.line}</p>

          <div className="process-evidence">
            {index < steps.length - 1 && <StepArrow />}
            {step.id === 'brief' && <>
              <figure className="process-product-reference">
                <ReferenceImage kind="tee" />
                <figcaption><strong>PRODUCT REFERENCE</strong><span>Oversized fit, crew neck</span></figcaption>
              </figure>
              <dl className="process-request-specs">
                {requestSpecs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
            </>}

            {step.id === 'partner' && <>
              <div className="process-partner-identity">
                <ReferenceImage kind="factory" />
                <div><h4>{factory.name}</h4><p>{factory.location}</p></div>
              </div>
              <dl className="process-request-specs">
                <div><dt>Speciality</dt><dd>{factory.product}</dd></div>
                <div><dt>Matched on</dt><dd>Product, quantity, timeline</dd></div>
                <div><dt>Next step</dt><dd>Your first sample</dd></div>
              </dl>
              <button type="button" className="process-partner-link" onClick={event => { factoryTrigger.current = event.currentTarget; setShowFactory(true); }}>
                Meet your partner <ArrowRight size={15} />
              </button>
            </>}

            {step.id === 'production' && <>
              <div className="process-progress-ring" role="progressbar" aria-label="Example collection production" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}>
                <svg viewBox="0 0 160 160" aria-hidden="true"><circle className="process-ring-track" cx="80" cy="80" r="66" /><circle className="process-ring-value" cx="80" cy="80" r="66" pathLength="100" strokeDasharray="72 100" /></svg>
                <div><strong>72<span>%</span></strong><span>complete</span></div>
              </div>
              <dl className="process-request-specs">
                <div><dt>Sample</dt><dd>Approved by you</dd></div>
                <div><dt>Now</dt><dd>Sewing in progress</dd></div>
                <div><dt>Next</dt><dd>Quality &amp; shipment</dd></div>
              </dl>
            </>}
          </div>
        </li>
      ))}
    </ol>
    <p className="process-example-note">Example order · Factory match and dates are illustrative.</p>

    <Dialog open={showFactory} onOpenChange={open => { if (!open) setShowFactory(false); }}>
      <DialogContent className="process-preview-dialog" onCloseAutoFocus={event => { event.preventDefault(); factoryTrigger.current?.focus(); }}>
        <DialogHeader><DialogTitle>{factory.name}</DialogTitle><DialogDescription>An illustrative manufacturer match for Everyday Tee — Drop 02.</DialogDescription></DialogHeader>
        <ReferenceImage kind="factory" />
        <p className="process-dialog-location">{factory.location}</p>
        <dl className="process-request-specs">
          <div><dt>Speciality</dt><dd>{factory.product}</dd></div>
          <div><dt>Next step</dt><dd>Your first sample</dd></div>
        </dl>
        <p className="process-dialog-capabilities">Your Formme team coordinates sampling with the factory. You review and approve before production begins.</p>
      </DialogContent>
    </Dialog>
  </>;
}
