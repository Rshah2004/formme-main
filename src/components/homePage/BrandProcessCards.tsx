import { useRef, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import './brand-process-cards.css';

type ProcessStep = 'brief' | 'partner' | 'production';
type Attachment = 'tech-pack.pdf' | 'artwork.ai';
const factory = {
  name: 'Supreme Stitch Bangladesh',
  location: 'Dhaka, Bangladesh',
  product: 'Knitwear / jersey',
  crop: [70, 321, 103, 68],
} as const;

const requestSpecs = [
  ['Product', 'Heavyweight T-shirt'], ['Fabric', '240 GSM cotton'],
  ['Target cost', '$8–11 / unit'], ['Quantity', '600'], ['Delivery', 'Vancouver'],
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

export function BrandProcessCards({ step }: { step: ProcessStep }) {
  const currentIndex = ['brief', 'partner', 'production'].indexOf(step);
  const [attachments, setAttachments] = useState<Attachment[]>(['tech-pack.pdf', 'artwork.ai']);
  const [preview, setPreview] = useState<{ kind: 'factory' } | { kind: 'attachment'; name: Attachment } | null>(null);
  const previewTrigger = useRef<HTMLButtonElement | null>(null);
  const removeButtons = useRef(new Map<Attachment, HTMLButtonElement>());
  const restoreButton = useRef<HTMLButtonElement>(null);
  const openFactory = (button: HTMLButtonElement) => {
    previewTrigger.current = button;
    setPreview({ kind: 'factory' });
  };

  return <>
    <div className={`brand-making-preview process-preview process-preview-${step}`} id="making-preview" role="region" aria-labelledby={`making-step-${step}`}>
      <div className="process-preview-heading"><span>THE FORMME PROCESS</span><span>0{currentIndex + 1} / 03</span></div>
      <div className="process-preview-progress" aria-hidden="true">{[0, 1, 2].map(index => <span key={index} className={index <= currentIndex ? 'is-complete' : ''} />)}</div>
      <article className={`process-card process-card-${step}`} key={step}>
        <div className="process-card-top">
          <div><span className="process-step-number">0{currentIndex + 1}</span><span className="process-eyebrow">{step === 'brief' ? 'NEW PRODUCTION REQUEST' : step === 'partner' ? 'YOUR FACTORY MATCH' : 'PRODUCTION TRACKING'}</span></div>
          <span className="process-status"><Check size={15} />{step === 'brief' ? 'Brief ready' : step === 'partner' ? 'Partner found' : 'On track'}</span>
        </div>

        {step === 'brief' && <>
          <h3>Everyday Tee — Drop 02</h3>
          <p className="process-card-intro">A classic, oversized tee for our Spring collection.</p>
          <div className="process-request-layout">
            <figure className="process-product-reference"><ReferenceImage kind="tee" /><figcaption><strong>PRODUCT REFERENCE</strong><span>Oversized fit, crew neck<br />Short sleeve</span></figcaption></figure>
            <div className="process-request-details">
              <dl className="process-request-specs">{requestSpecs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
              <div className="process-attachments-heading"><span className="process-eyebrow">ATTACHMENTS</span>{attachments.length < 2 && <button type="button" ref={restoreButton} onClick={() => setAttachments(['tech-pack.pdf', 'artwork.ai'])}>Restore examples</button>}</div>
              <div className="process-attachments">{attachments.map(name => <div className="process-attachment" key={name}>
                <button type="button" className="process-attachment-open" aria-label={`Preview ${name}`} onClick={event => { previewTrigger.current = event.currentTarget; setPreview({ kind: 'attachment', name }); }}>
                  <span className={`process-file-icon ${name.endsWith('.ai') ? 'is-artwork' : ''}`}>{name.endsWith('.ai') ? 'Ai' : 'PDF'}</span>
                  <span><strong>{name}</strong><small>{name.endsWith('.ai') ? '5.1 MB' : '2.4 MB'}</small></span>
                </button>
                <button type="button" className="process-attachment-remove" ref={node => { if (node) removeButtons.current.set(name, node); else removeButtons.current.delete(name); }} aria-label={`Remove ${name} from example`} onClick={() => {
                  const remaining = attachments.filter(item => item !== name);
                  setAttachments(remaining);
                  requestAnimationFrame(() => (remaining.length ? removeButtons.current.get(remaining[0]) : restoreButton.current)?.focus());
                }}><X size={14} /></button>
              </div>)}</div>
              {attachments.length === 0 && <p className="process-empty-files" role="status">Example attachments removed.</p>}
            </div>
          </div>
          <div className="process-colourways"><span className="process-eyebrow">COLOURWAY</span><div aria-label="Example colourways: off-white selected, charcoal, grey, and pale blue"><span className="is-selected" title="Off-white" /><span title="Charcoal" /><span title="Grey" /><span title="Pale blue" /></div></div>
        </>}

        {step === 'partner' && <>
          <h3>Meet your manufacturer.</h3>
          <p className="process-card-intro">The right partner for Everyday Tee — Drop 02.</p>
          <div className="process-partner-spotlight">
            <span className="process-eyebrow">SELECTED BY FORMME</span>
            <div className="process-partner-identity">
              <ReferenceImage kind="factory" />
              <div><h4>{factory.name}</h4><p>{factory.location}</p></div>
            </div>
            <div className="process-partner-fit">
              <span className="process-eyebrow">A MATCH FOR YOUR</span>
              <ul>{['Product', 'Quantity', 'Timeline'].map(item => <li key={item}><Check size={14} />{item}</li>)}</ul>
            </div>
            <button type="button" className="process-partner-link" onClick={event => openFactory(event.currentTarget)}>Meet your partner <ArrowRight size={15} /></button>
          </div>
          <div className="process-next-sample"><div><span className="process-eyebrow">UP NEXT</span><strong>Your first sample.</strong><p>We’ll coordinate. You make the call.</p></div><ArrowRight size={22} aria-hidden="true" /></div>
        </>}

        {step === 'production' && <>
          <h3>Your collection, in the making.</h3>
          <p className="process-card-intro">Everyday Tee — Drop 02 · Supreme Stitch Bangladesh</p>
          <div className="process-production-focus">
            <div className="process-progress-ring" role="progressbar" aria-label="Example collection production" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}>
              <svg viewBox="0 0 160 160" aria-hidden="true"><circle className="process-ring-track" cx="80" cy="80" r="66" /><circle className="process-ring-value" cx="80" cy="80" r="66" pathLength="100" strokeDasharray="72 100" /></svg>
              <div><strong>72<span>%</span></strong><span>complete</span></div>
            </div>
            <div className="process-current-stage"><span className="process-eyebrow"><i />HAPPENING NOW</span><h4>Sewing in <br />progress.</h4><p>Managed by Formme.<br />Every update, in one place.</p></div>
          </div>
          <ol className="process-stage-path" aria-label="Order stages">
            <li className="is-done"><span><Check size={13} /></span><strong>Sample approved</strong></li>
            <li className="is-current" aria-current="step"><span /><strong>In production</strong></li>
            <li><span /><strong>Ready to ship</strong></li>
          </ol>
          <div className="process-shipment-summary"><div><span className="process-eyebrow">ESTIMATED SHIPMENT</span><strong>25 April</strong></div><span>We’ll keep you posted.</span></div>
        </>}
      </article>
      <p className="process-example-note">{step === 'brief' ? 'Interactive example · Factory details, match scores, pricing, and dates are illustrative.' : 'Example order · Factory match and dates are illustrative.'}</p>
    </div>

    <Dialog open={preview !== null} onOpenChange={open => { if (!open) setPreview(null); }}>
      <DialogContent className="process-preview-dialog" onCloseAutoFocus={event => { event.preventDefault(); previewTrigger.current?.focus(); }}>
        <DialogHeader><DialogTitle>{preview?.kind === 'factory' ? factory.name : preview?.name}</DialogTitle><DialogDescription>{preview?.kind === 'factory' ? 'An illustrative manufacturer match for Everyday Tee — Drop 02.' : 'Illustrative attachment preview for Everyday Tee — Drop 02.'}</DialogDescription></DialogHeader>
        {preview?.kind === 'factory' && <><ReferenceImage kind="factory" /><p className="process-dialog-location">{factory.location}</p><dl className="process-request-specs"><div><dt>Speciality</dt><dd>{factory.product}</dd></div><div><dt>Next step</dt><dd>Your first sample</dd></div></dl><p className="process-dialog-capabilities">Your Formme team coordinates sampling with the factory. You review and approve before production begins.</p></>}
        {preview?.kind === 'attachment' && <><div className="process-attachment-preview"><ReferenceImage kind="tee" /></div><dl className="process-request-specs">{(preview.name === 'tech-pack.pdf' ? requestSpecs : [['Artwork', 'Front placement'], ['Product', 'Everyday Tee — Drop 02'], ['Colourway', 'Off-white']]).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></>}
      </DialogContent>
    </Dialog>
  </>;
}
