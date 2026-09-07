import { Check, Factory, FileText, MapPin, Truck } from 'lucide-react';
import './brand-order-journey.css';

export function BrandOrderJourney() {
  return (
    <div className="brand-order-journey" aria-label="Example order from design to delivery">
      <div className="order-board-header">
        <span><FileText size={17} /> From your design to delivery</span>
        <span>Example order</span>
      </div>
      <div className="order-board-body">
        <figure className="order-board-product">
          <figcaption><span>YOUR PRODUCT</span><h2>Oversized hoodie</h2><p>Washed black · Heavyweight cotton</p></figcaption>
          <div className="order-board-garment"><img src="/mockupHoodieFront.png" alt="Black oversized hoodie illustrating your finished product" fetchPriority="high" /></div>
          <div className="order-board-product-details">
            <div className="order-board-techpack"><img src="/techpackSketch.png" alt="Hoodie technical drawing" /><span>Design brief<strong>Shared with Formme</strong></span></div>
            <dl><div><dt>Quantity</dt><dd>600 pieces</dd></div><div><dt>Sizes</dt><dd>XS–XXL</dd></div></dl>
          </div>
        </figure>
        <div className="order-board-coordination">
          <ol className="order-board-timeline">
            <li>
              <span className="order-board-step"><Check size={14} /></span>
              <div><span className="order-board-step-label">01 · YOUR BRIEF</span><h3>You share what you want to make.</h3><p>Your design, quantities, and product details give us a starting point.</p></div>
            </li>
            <li>
              <span className="order-board-step"><Check size={14} /></span>
              <div><span className="order-board-step-label">02 · YOUR MANUFACTURER</span><h3>We find the right production partner.</h3>
                <div className="order-board-factory"><Factory size={25} /><div><strong>Supreme Stitch Bangladesh</strong><span><MapPin size={12} /> Bangladesh</span></div><span className="order-board-matched"><Check size={12} /> Matched</span></div>
              </div>
            </li>
            <li className="order-board-current">
              <span className="order-board-step"><span /></span>
              <div><span className="order-board-step-label">03 · YOUR PRODUCTION</span><h3>We manage the work. You stay updated.</h3>
                <div className="order-board-progress-label"><span>Sewing in progress</span><strong>72<span>%</span></strong></div>
                <div className="order-board-progress" role="progressbar" aria-label="Example production progress" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}><span /></div>
                <div className="order-board-checkpoints"><span><Check size={13} /> Sample approved by you</span><span>Next: quality check</span></div>
              </div>
            </li>
          </ol>
          <div className="order-board-delivery"><Truck size={18} /><span>Estimated shipment</span><strong>18 September</strong></div>
        </div>
      </div>
    </div>
  );
}
