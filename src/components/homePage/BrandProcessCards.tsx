import { useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
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

const steps = [
  { id: 'brief', eyebrow: 'THE BRIEF', title: 'Bring your idea.', description: 'Share your design, references and quantity. We turn the details into a brief a factory can act on.', you: 'You share the idea.', us: 'We shape the brief.' },
  { id: 'partner', eyebrow: 'THE MATCH', title: 'Find your people.', description: 'We match you with a manufacturer from the network we’ve built, then coordinate the next steps.', you: 'You meet your factory.', us: 'We make the introduction.' },
  { id: 'production', eyebrow: 'THE MAKING', title: 'Make it happen.', description: 'Approve the sample, then follow quality checks and shipment updates in your workspace.', you: 'You approve the product.', us: 'We coordinate production.' },
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
            <span className="process-eyebrow">{step.eyebrow}</span>
          </div>
          <h3>{step.title}</h3>
          <p className="process-stop-copy">{step.description}</p>

          <div className="process-evidence">
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
              <div className="process-partner-fit">
                <span className="process-eyebrow">A MATCH FOR YOUR</span>
                <ul>{['Product', 'Quantity', 'Timeline'].map(item => <li key={item}><Check size={14} />{item}</li>)}</ul>
              </div>
              <button type="button" className="process-partner-link" onClick={event => { factoryTrigger.current = event.currentTarget; setShowFactory(true); }}>
                Meet your partner <ArrowRight size={15} />
              </button>
            </>}

            {step.id === 'production' && <>
              <div className="process-progress-ring" role="progressbar" aria-label="Example collection production" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}>
                <svg viewBox="0 0 160 160" aria-hidden="true"><circle className="process-ring-track" cx="80" cy="80" r="66" /><circle className="process-ring-value" cx="80" cy="80" r="66" pathLength="100" strokeDasharray="72 100" /></svg>
                <div><strong>72<span>%</span></strong><span>complete</span></div>
              </div>
              <div className="process-stage-list">
                <span className="is-done"><Check size={13} />Sample approved</span>
                <span className="is-current">Sewing in progress</span>
                <span>Quality check &amp; shipment</span>
              </div>
            </>}
          </div>

          <dl className="process-split">
            <div><dt>You</dt><dd>{step.you}</dd></div>
            <div><dt>Formme</dt><dd>{step.us}</dd></div>
          </dl>
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
