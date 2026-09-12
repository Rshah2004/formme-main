import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Check, CheckCheck, Factory, FileText, LayoutGrid, Package, ShieldCheck, Shirt, Truck } from 'lucide-react';
import { CONTACT_HREF } from './LandingChrome';
import { ManufacturerHeroPreview } from './ManufacturerHeroPreview';
import { ProofStrip } from './ProofStrip';
import { LandingFaq, ProductionSpecs } from './LandingSections';
import { WorkflowShowcase } from './WorkflowShowcase';
import { Badge, Progress } from './ProductionUI';
import { previewOrders } from './productionPreviewData';
import type { Audience } from './theme';
import './production-landing.css';

type AudienceProps = { audience: Audience };

function FactoryOverview() {
  const [view, setView] = useState<'lines' | 'shipments'>('lines');
  return (
    <div className="audience-preview factory-overview">
      <div className="audience-preview-heading"><span><Factory size={15} /> Factory operations</span><span className="preview-label">Example workspace</span></div>
      <div className="overview-stats"><div><strong>03</strong><span>Active orders</span></div><div><strong>1,350</strong><span>Pieces planned</span></div><div><strong>03</strong><span>Production lines</span></div></div>
      <div className="overview-switch" role="group" aria-label="Factory overview">
        <button type="button" aria-pressed={view === 'lines'} onClick={() => setView('lines')}>Production lines</button>
        <button type="button" aria-pressed={view === 'shipments'} onClick={() => setView('shipments')}>Upcoming shipments</button>
      </div>
      <div className="overview-rows">
        {previewOrders.map(order => view === 'lines' ? (
          <div className="overview-line" key={order.id}><div><strong>{order.line}</strong><span>{order.product}</span></div><div className="production-progress-label"><Progress value={order.progress} label={`${order.line} production`} /><span>{order.progress}%</span></div><Badge>{order.stage}</Badge></div>
        ) : (
          <div className="overview-shipment" key={order.id}><span className="overview-shipment-icon"><Package size={17} /></span><div><strong>{order.id}</strong><span>{order.quantity} pieces · {order.product}</span></div><span><strong>{order.due}</strong><small>Target dispatch</small></span></div>
        ))}
      </div>
      <div className="overview-footer"><CheckCheck size={13} /> Production updates stay connected to the brand.</div>
    </div>
  );
}

function BrandOverview() {
  const [selected, setSelected] = useState(0);
  const order = previewOrders[selected];
  return (
    <div className="audience-preview brand-overview">
      <div className="audience-preview-heading"><span><LayoutGrid size={15} /> Brand workspace</span><span className="preview-label">Example workspace</span></div>
      <div className="overview-stats"><div><strong>03</strong><span>Active orders</span></div><div><strong>02</strong><span>Sample approvals</span></div><div><strong>01</strong><span>Shared workspace</span></div></div>
      <div className="brand-orders-label"><span>YOUR ORDERS</span><small>Select an order</small></div>
      <div className="brand-overview-orders" role="group" aria-label="Example brand orders">
        {previewOrders.map((item, index) => (
          <button type="button" key={item.id} aria-pressed={selected === index} onClick={() => setSelected(index)}>
            <span className="brand-order-shirt"><Shirt size={17} /></span><span><strong>{item.product}</strong><small>{item.id}</small></span><div className="production-progress-label"><Progress value={item.progress} label={`${item.product} progress`} /><span>{item.progress}%</span></div><ArrowRight size={13} />
          </button>
        ))}
      </div>
      <div className="brand-order-update" aria-live="polite"><span><span className="production-dot" /><strong>{order.product}</strong> · {order.stage}</span><span>Est. {order.due}</span></div>
    </div>
  );
}

function AudiencePanel({ audience }: AudienceProps) {
  return (
    <section className="production-section production-audiences" aria-label={audience === 'brand' ? 'Built for brands' : 'Built for manufacturers'}>
      <div className="production-container">
        <div className="audience-panels audience-panels-single">
          {audience === 'manufacturer' ? (
          <article className="audience-panel audience-panel-dark" id="factories">
            <div className="audience-panel-copy">
              <span className="production-eyebrow">FOR MANUFACTURERS</span>
              <h3>Run production.<br />Keep everyone in the loop.</h3>
              <p>Give your team one place for order requirements, production progress, quality reviews, and shipment details.</p>
              <ul>{['Review tech packs and confirm feasibility', 'Plan production and track line progress', 'Keep inspections, approvals, and shipping together'].map(item => <li key={item}><Check size={15} />{item}</li>)}</ul>
              <a className="production-button production-button-outline" href="#product">Explore your workflow <ArrowRight size={15} /></a>
            </div>
            <FactoryOverview />
          </article>
          ) : (
          <article className="audience-panel audience-panel-dark" id="brands">
            <div className="audience-panel-copy">
              <span className="production-eyebrow">LESS CHASING. MORE CLARITY.</span>
              <h3>See what’s happening.<br />Without having to ask.</h3>
              <p>Formme manages production with your manufacturer. Your workspace keeps the details, approvals, and progress visible while our team handles coordination.</p>
              <ul>{['We coordinate with your manufacturer', 'You review samples and approve the details', 'You see how your order is progressing'].map(item => <li key={item}><Check size={15} />{item}</li>)}</ul>
              <a className="production-button production-button-outline" href="#product">Explore your workflow <ArrowRight size={15} /></a>
            </div>
            <BrandOverview />
          </article>
          )}
        </div>
      </div>
    </section>
  );
}

function ConnectedWorkspaces({ audience }: AudienceProps) {
  return (
    <section className="production-section production-connector" aria-label="Connected factory and brand workspaces">
      <div className="production-container connector-layout">
        <div className="connector-copy"><span className="production-eyebrow">CONNECTED BY FORMME</span><h2>{audience === 'brand' ? 'Closer to your factory.' : 'Update production.'}<br /><em>{audience === 'brand' ? 'Clearer on your progress.' : 'Keep your brands informed.'}</em></h2><p>{audience === 'brand' ? 'Your factory’s updates flow into your order. Follow production, review quality, and see what’s next without piecing together messages.' : 'Record progress where the work happens. Your brands see the same order updates, so your team spends less time responding to status requests.'}</p>{audience === 'brand' ? <Link to="/dashboard?preview=true" className="production-text-link">Explore your dashboard <ArrowRight size={15} /></Link> : <a href={CONTACT_HREF} className="production-text-link">See Formme for your factory <ArrowRight size={15} /></a>}</div>
        <div className="connector-visual">
          <div className="connector-factory"><div className="connector-title"><Factory size={16} /><strong>Factory operations</strong></div><div className="connector-table-head"><span>Order</span><span>Stage</span><span>Progress</span></div>{previewOrders.map(order => <div className="connector-row" key={order.id}><span>{order.id}</span><span>{order.stage}</span><Progress value={order.progress} label={`${order.product} factory view`} /></div>)}<span className="connector-timestamp"><CheckCheck size={12} /> Updates recorded on the order</span></div>
          <div className="connector-symbol"><span><img src="/logo-mark.png" alt="Formme" /></span><small>SYNCED</small></div>
          <div className="connector-brand"><div className="connector-title"><LayoutGrid size={15} /><strong>Brand visibility</strong></div>{previewOrders.map(order => <div className="connector-brand-row" key={order.id}><span className="production-dot" /><span>{order.id}</span><strong>{order.progress}%</strong></div>)}<div className="connector-shared"><CheckCheck size={13} /> Same order. Same progress.</div></div>
        </div>
      </div>
    </section>
  );
}

export function ProductionLandingExperience({ audience }: AudienceProps) {
  const isBrand = audience === 'brand';
  return (
    <main className={`production-landing production-landing-${audience}`}>
      <section className="production-hero" aria-labelledby="production-hero-title">
        <div className={`production-container production-hero-grid${isBrand ? ' production-hero-centered' : ''}`}>
          <div className="production-hero-copy">
            <span className="production-eyebrow"><span className="production-dot" /> {isBrand ? 'FOR BRANDS · FROM IDEA TO DELIVERY' : 'FOR MANUFACTURERS · FROM ORDER TO SHIPMENT'}</span>
            <h1 id="production-hero-title">{isBrand ? 'Your production.' : 'Your factory floor.'}<em>{isBrand ? 'Finally connected.' : 'In full view.'}</em></h1>
            <p>{isBrand ? 'We help apparel brands find the right manufacturer and manage their production. Our team coordinates with the factory, while you approve samples and follow progress in one workspace.' : 'See what’s running, what’s due, and what needs attention. Connect production lines, quality checks, and dispatch in one workspace for your factory.'}</p>
            <div className="production-actions"><a className="production-button" href={CONTACT_HREF}>{isBrand ? 'Talk about your collection' : 'Talk about your factory'} <ArrowRight size={16} /></a><a className="production-text-link" href="#product">{isBrand ? 'See how it works' : 'Explore factory operations'} <ArrowDown size={15} /></a></div>
            <div className="production-hero-note"><Check size={14} /> {isBrand ? 'Manufacturer matching. Managed production. Clear updates.' : 'Your orders. Your production. One clear view.'}</div>
          </div>
          {!isBrand && <ManufacturerHeroPreview />}
        </div>
        <div className="production-container"><ProofStrip /></div>
        {!isBrand && (
          <div className="production-container"><div className="production-capabilities"><span>EVERY DETAIL, CONNECTED.</span><div><span><FileText /> Order review</span><span><Factory /> Line planning</span><span><ShieldCheck /> Quality control</span><span><Truck /> Shipment coordination</span></div></div></div>
        )}
      </section>

      <AudiencePanel audience={audience} />
      <WorkflowShowcase audience={audience} />
      {isBrand && <ProductionSpecs />}
      {!isBrand && <ConnectedWorkspaces audience={audience} />}

      {isBrand && <aside className="production-merch" aria-label="Merch production estimates"><div className="production-container"><div><div><h2>Planning your budget?</h2><p>Explore production cost estimates for custom T-shirts and hoodies.</p></div></div><Link className="production-button production-button-outline" to="/cost-predictor">Request a cost estimate <ArrowRight size={15} /></Link></div></aside>}

      <LandingFaq audience={audience} />

      <section className="production-section production-final" aria-label="Get in touch"><div className="production-container"><h2>{isBrand ? 'What are you' : 'Plan. Produce.'}<br />{isBrand ? 'planning to' : 'Inspect. Ship.'} <em>{isBrand ? 'make?' : 'Connected.'}</em></h2><div><p>{isBrand ? 'Email us what you’re making, your target quantity, and where you are in the process. Let’s discuss how Formme fits your production needs.' : <>Bring clarity to your factory operations.<br />Let’s build what’s next, together.</>}</p><a className="production-button" href={CONTACT_HREF}>{isBrand ? 'Email us about your collection' : 'Let’s talk about your factory'} <ArrowRight size={16} /></a></div></div></section>

      <div className="production-sticky-cta">
        <a className="production-button" href={CONTACT_HREF}>{isBrand ? 'Talk about your collection' : 'Talk about your factory'} <ArrowRight size={16} /></a>
      </div>
    </main>
  );
}
