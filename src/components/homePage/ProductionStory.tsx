import { ArrowUpRight, Check, FileText, MapPin } from 'lucide-react';
import { Progress } from './ProductionUI';

/** A single example order, presented from product brief to managed production. */
export function ProductionStory() {
  return <div className="brand-journey production-example" aria-label="Example order with Supreme Stitch Bangladesh">
    <div className="production-example-product">
      <div className="production-example-label"><span>THE PRODUCT</span><span>01 / EXAMPLE ORDER</span></div>
      <div className="production-example-stage"><img className="production-example-garment" src="/techpackSketch.png" alt="Technical sketch of the oversized hoodie for an example production order" fetchPriority="high" /></div>
      <div className="production-example-caption"><div><h2>Oversized hoodie</h2><p>Heavyweight cotton. Made for your brand.</p></div><span className="production-example-swatch" aria-label="Washed black" /></div>
      <div className="production-example-brief"><FileText size={17} /><span>Your design brief</span><strong>Shared with Formme <Check size={14} /></strong></div>
    </div>
    <div className="production-example-order">
      <div className="production-example-label"><span>THE PRODUCTION</span><span className="production-example-live"><i /> Managed by Formme</span></div>
      <span className="production-example-kicker">YOUR MANUFACTURING PARTNER</span>
      <h3>Supreme Stitch<br />Bangladesh</h3>
      <p className="production-example-location"><MapPin size={14} /> Bangladesh <span>Manufacturer matched <Check size={13} /></span></p>
      <div className="production-example-progress"><span>Production in progress</span><strong>72<span>%</span></strong></div>
      <Progress value={72} label="Example order production progress" />
      <ol className="production-example-stages">
        <li><span><Check size={14} /></span><div><strong>Sample approved</strong><p>You signed off on the details.</p></div><small>Complete</small></li>
        <li className="is-current"><span>02</span><div><strong>Production underway</strong><p>We coordinate with your factory.</p></div><small>In progress</small></li>
        <li><span>03</span><div><strong>Quality & shipment</strong><p>See what’s next for your order.</p></div><small>Up next</small></li>
      </ol>
      <div className="production-example-bottom"><span>You build the brand.<br /><strong>We help get it made.</strong></span><ArrowUpRight size={24} aria-hidden="true" /></div>
    </div>
  </div>;
}
