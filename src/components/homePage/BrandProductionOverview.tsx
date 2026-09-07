import { Check, Factory, FileText, PackageCheck, Truck } from 'lucide-react';
import './brand-production-overview.css';

const steps = [
  { title: 'Start with your design', owner: 'YOUR VISION', description: 'Share your product, quantities, and requirements. We help turn them into a production brief.', icon: FileText },
  { title: 'Find the right manufacturer', owner: 'OUR NETWORK', description: 'Formme matches your product needs with a manufacturing partner and coordinates the next steps.', icon: Factory },
  { title: 'Make it right, before you make more', owner: 'YOUR APPROVAL', description: 'Review your sample and share feedback. You approve the details before production begins.', icon: Check },
  { title: 'Production, managed for you', owner: 'OUR TEAM', description: 'We coordinate with your factory. You follow production, quality, and shipment updates in one place.', icon: Truck },
];

export function BrandProductionOverview({ compact = false }: { compact?: boolean }) {
  return <div className={`brand-flow${compact ? ' brand-flow-compact' : ''}`} id="brands">
    <div className="brand-flow-heading"><span className="production-eyebrow">HOW FORMME HELPS</span><h2>Your product.<br />Our production expertise.</h2><p>A manufacturing partner, hands-on coordination, and a clear view of your order. Here’s where we come in.</p></div>
    {!compact && <><div className="brand-flow-scene" aria-label="Example product journey from design brief to shipment">
      <div className="brand-flow-inputs">
        <div className="brand-flow-mini brand-flow-sketch"><span><FileText size={13} /> Design brief</span><img src="/images/blue-shirt-sketch.svg" alt="Illustrative design sketch for a button-up shirt" /></div>
        <div className="brand-flow-mini brand-flow-material"><span>Color references</span><div aria-label="Sky blue, slate, and cream"><i /><i /><i /></div></div>
      </div>
      <div className="brand-flow-mini brand-flow-partner"><Factory size={29} /><span className="brand-flow-status"><Check size={12} /> Manufacturer matched</span><strong>Supreme Stitch<br />Bangladesh</strong><small>Bangladesh</small></div>
      <div className="brand-flow-garment"><span>YOUR COLLECTION, TAKING SHAPE</span><img src="/images/blue-shirt-editorial.jpg" alt="Light-blue button-up shirt on a clothing rack" loading="lazy" /><div><strong>The everyday shirt</strong><small>Illustrative product</small></div></div>
      <div className="brand-flow-mini brand-flow-approval"><span className="brand-flow-status"><Check size={12} /> Sample approved</span><div className="brand-flow-signoff"><Check size={27} /><span>Fit reviewed</span><span>Details confirmed</span></div><strong>Signed off by you.</strong><small>Ready for production</small></div>
      <div className="brand-flow-mini brand-flow-dispatch"><PackageCheck size={29} /><span>PRODUCTION & DELIVERY</span><strong>Every update.<br />One place.</strong><small>Managed with Formme</small><div><Check size={12} /> Production <span /><Truck size={13} /> Shipment</div></div>
    </div>
    <svg className="brand-flow-branches" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">{[125,375,625,875].map(x => <g key={x}><path d={`M500 0 C500 55 ${x} 35 ${x} 95`} /><circle cx={x} cy="95" r="2.5" /></g>)}</svg></>}
    <div className="brand-flow-cards">{steps.map(({title, owner, description, icon: Icon}, index) => <article key={title}><span className="brand-flow-number">0{index + 1}.</span><Icon size={19} /><span className="brand-flow-owner">{owner}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
  </div>;
}
