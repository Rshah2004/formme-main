import { Check, Factory, FileText, MapPin, Paperclip, Truck } from 'lucide-react';
import { Progress } from './ProductionUI';
import { Logo } from './LandingChrome';

export function ProductionStory() {
  return (
    <div className="brand-journey" aria-label="Example order: manufacturer matching and managed production">
      <div className="brand-journey-body">
        <div className="brand-journey-card brand-journey-brief">
          <div className="brand-journey-card-title"><FileText size={18} /><strong>Tech pack</strong></div>
          <div className="brand-journey-sketch"><img src="/techpackSketch.png" alt="Technical drawing of the oversized hoodie" /></div>
          <h3>Oversized hoodie</h3><p>Heavyweight cotton fleece<br />Ribbed cuffs and hem<br />Kangaroo pocket<br />Washed black</p>
          <span className="brand-journey-files"><Paperclip size={13} /> Product details attached</span>
          <div className="brand-journey-swatches" aria-hidden="true"><span /><img src="/techpackSketch.png" alt="" /><img src="/mockupHoodieFront.png" alt="" /></div>
        </div>
        <div className="brand-journey-product">
          <div className="brand-journey-halo" aria-hidden="true" />
          <img className="brand-journey-hoodie" src="/mockupHoodieFront.png" alt="Black oversized hoodie for the example order" fetchPriority="high" />
          <span className="brand-journey-product-label">YOUR PRODUCT</span><div className="brand-journey-wordmark"><Logo /></div><span className="brand-journey-tagline">BRIDGES BRANDS & FACTORIES</span>
        </div>
        <div className="brand-journey-card brand-journey-factory">
          <div className="brand-journey-match"><span className="brand-journey-factory-icon"><Factory size={28} /></span><div><span className="brand-journey-matched"><Check size={12} /> Matched</span><h3>Supreme Stitch Bangladesh</h3><span className="brand-journey-location"><MapPin size={12} /> Bangladesh</span></div></div>
          <div className="brand-journey-progress"><strong>Production progress</strong><span>72%</span></div><Progress value={72} label="Example order production progress" />
          <ol className="brand-journey-timeline">{[['Sample approved', 'Done'], ['Production in progress', 'Now'], ['Quality check', 'Next'], ['Preparing for shipment', 'Next']].map(([label, status], index) => <li key={label} data-complete={index < 2}><span>{index < 2 && <Check size={11} />}</span><strong>{label}</strong><small>{status}</small></li>)}</ol>
          <div className="brand-journey-delivery"><Truck size={16} /><span>Estimated delivery</span><strong>18 Sep</strong></div>
        </div>
      </div>
      <p className="brand-journey-example">Example order · Production managed with Formme</p>
    </div>
  );
}
