import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Check, CheckCheck, Factory } from 'lucide-react';
import { CONTACT_HREF } from './LandingChrome';
import { BrandProductionOverview } from './BrandProductionOverview';
import { BrandWorkspacePreview } from './BrandWorkspacePreview';
import { BrandOrderJourney } from './BrandOrderJourney';
import { ManufacturerHeroPreview } from './ManufacturerHeroPreview';
import { WorkflowShowcase } from './WorkflowShowcase';
import { Badge, Progress } from './ProductionUI';
import { previewOrders } from './productionPreviewData';
import type { Audience } from './theme';
import './production-landing.css';
import './brand-editorial.css';

type AudienceProps = { audience: Audience };

function FactoryOverview() {
  const [view, setView] = useState<'lines' | 'shipments'>('lines');
  return (
    <div className="audience-preview factory-overview">
      <div className="audience-preview-heading"><span>Factory operations</span><span className="preview-label">Example workspace</span></div>
      <div className="overview-stats"><div><strong>03</strong><span>Active orders</span></div><div><strong>1,350</strong><span>Pieces planned</span></div><div><strong>03</strong><span>Production lines</span></div></div>
      <div className="overview-switch" role="group" aria-label="Factory overview">
        <button type="button" aria-pressed={view === 'lines'} onClick={() => setView('lines')}>Production lines</button>
        <button type="button" aria-pressed={view === 'shipments'} onClick={() => setView('shipments')}>Upcoming shipments</button>
      </div>
      <div className="overview-rows">
        {previewOrders.map(order => view === 'lines' ? (
          <div className="overview-line" key={order.id}><div><strong>{order.line}</strong><span>{order.product}</span></div><div className="production-progress-label"><Progress value={order.progress} label={`${order.line} production`} /><span>{order.progress}%</span></div><Badge>{order.stage}</Badge></div>
        ) : (
          <div className="overview-shipment" key={order.id}><div><strong>{order.id}</strong><span>{order.quantity} pieces · {order.product}</span></div><span><strong>{order.due}</strong><small>Target dispatch</small></span></div>
        ))}
      </div>
      <div className="overview-footer"><CheckCheck size={13} /> Production updates stay connected to the brand.</div>
    </div>
  );
}

function AudiencePanel({ audience }: AudienceProps) {
  return (
    <section className="production-section production-audiences" aria-label={audience === 'brand' ? 'Built for brands' : 'Built for manufacturers'}>
      <div className="production-container reveal">
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
          <BrandProductionOverview compact />
          )}
        </div>
      </div>
    </section>
  );
}

function ConnectedWorkspaces({ audience }: AudienceProps) {
  return (
    <section className="production-section production-connector" aria-label="Connected factory and brand workspaces">
      <div className="production-container connector-layout reveal">
        <div className="connector-copy"><span className="production-eyebrow">CONNECTED BY FORMME</span><h2>{audience === 'brand' ? 'Closer to your factory.' : 'Update production.'}<br /><em>{audience === 'brand' ? 'Clearer on your progress.' : 'Keep your brands informed.'}</em></h2><p>{audience === 'brand' ? 'Your factory’s updates flow into your order. Follow production, review quality, and see what’s next without piecing together messages.' : 'Record progress where the work happens. Your brands see the same order updates, so your team spends less time responding to status requests.'}</p>{audience === 'brand' ? <Link to="/dashboard?preview=true" className="production-text-link">Explore your dashboard <ArrowRight size={15} /></Link> : <a href={CONTACT_HREF} className="production-text-link">See Formme for your factory <ArrowRight size={15} /></a>}</div>
        <div className="connector-visual">
          <div className="connector-factory"><div className="connector-title"><strong>Factory operations</strong></div><div className="connector-table-head"><span>Order</span><span>Stage</span><span>Progress</span></div>{previewOrders.map(order => <div className="connector-row" key={order.id}><span>{order.id}</span><span>{order.stage}</span><Progress value={order.progress} label={`${order.product} factory view`} /></div>)}<span className="connector-timestamp"><CheckCheck size={12} /> Updates recorded on the order</span></div>
          <div className="connector-symbol"><span><img src="/logo-mark.png" alt="Formme" /></span><small>SYNCED</small></div>
          <div className="connector-brand"><div className="connector-title"><strong>Brand visibility</strong></div>{previewOrders.map(order => <div className="connector-brand-row" key={order.id}><span className="production-dot" /><span>{order.id}</span><strong>{order.progress}%</strong></div>)}<div className="connector-shared"><CheckCheck size={13} /> Same order. Same progress.</div></div>
        </div>
      </div>
    </section>
  );
}

export function ProductionLandingExperience({ audience }: AudienceProps) {
  const isBrand = audience === 'brand';
  return (
    <main className={`production-landing production-landing-${audience}${isBrand ? ' brand-editorial' : ''}`}>
      <section className="production-hero" aria-labelledby="production-hero-title">
        <div className={`production-container production-hero-grid${isBrand ? ' production-hero-reference' : ''}`}>
          <div className="production-hero-copy">
            <span className="production-eyebrow">{isBrand ? 'APPAREL MANUFACTURING FOR BRANDS' : 'BUILT FOR APPAREL MANUFACTURERS'}</span>
            <h1 id="production-hero-title">{isBrand ? 'We find your factory.' : 'Your factory floor.'}<em>{isBrand ? 'We manage production.' : 'In full view.'}</em></h1>
            <p>{isBrand ? 'Tell us what you want to make. Formme finds a manufacturer for your clothing and manages the process from samples to shipment. You approve the samples and track your order in one workspace.' : 'Bring your orders, production lines, and delivery dates together. Give your team a clear view of the work—and keep your brands informed.'}</p>
            <div className="production-actions"><a className="production-button" href={CONTACT_HREF}>{isBrand ? 'Discuss your collection' : 'Talk about your factory'} <ArrowRight size={16} /></a><a className="production-text-link" href="#product">{isBrand ? 'Explore the workspace' : 'Explore factory operations'} <ArrowDown size={15} /></a></div>
            {isBrand ? <div className="production-hero-note">Start by telling our team about your product and quantity.</div> : <div className="production-hero-note"><Check size={14} /> Your orders. Your production. One clear view.</div>}
          </div>
          {isBrand ? <BrandOrderJourney /> : <ManufacturerHeroPreview />}
        </div>
        {!isBrand && <div className="production-container"><div className="production-capabilities"><span>EVERY DETAIL, CONNECTED.</span><div><span>Order review</span><span>Line planning</span><span>Quality control</span><span>Shipment coordination</span></div></div></div>}
      </section>

      {isBrand && <section className="brand-experience-strip" aria-label="The experience behind Formme"><div className="production-container"><div><span className="production-eyebrow">BUILT FROM EXPERIENCE</span><p>Fashion people.<br /><strong>Production people.</strong></p></div><div><strong>40+ years</strong><p>Combined manufacturing experience</p></div><div><strong>Both sides of the process</strong><p>A team that has built an apparel brand</p></div><Link to="/about" className="production-text-link">Meet Formme <ArrowRight size={16} /></Link></div></section>}

      {!isBrand && <AudiencePanel audience={audience} />}

      {/* Shows the shape of the ERP — the stages it covers and the problem it
          replaces — without laying out how any of it works. */}
      {!isBrand && <section className="production-section factory-erp" id="factory-erp" aria-labelledby="factory-erp-title">
        <div className="production-container reveal">
          <span className="production-eyebrow">NOW IN BUILD</span>
          <h2 id="factory-erp-title">The whole floor.<br /><em>One system.</em></h2>
          <p className="factory-erp-lead">Every stage of an order recorded where the work happens — what went to cutting and when, which fabric arrived from where, what is on the line right now. One record for the floor, instead of spreadsheets, chat threads and paper that never quite agree.</p>
          <ol className="factory-erp-stages" aria-label="Production stages covered">
            {['Fabric in', 'Cutting', 'Knitting', 'Sewing', 'Finishing', 'Dispatch'].map(stage => <li key={stage}>{stage}</li>)}
          </ol>
          <p className="factory-erp-note">We are building this now, alongside manufacturers in Bangladesh.</p>
        </div>
      </section>}
      {isBrand ? <BrandWorkspacePreview /> : <WorkflowShowcase audience={audience} />}
      {!isBrand && <ConnectedWorkspaces audience={audience} />}

      {isBrand && <aside className="production-merch" aria-label="Merch production estimates"><div className="production-container"><div><div><h2>Planning your budget?</h2><p>Explore production cost estimates for custom T-shirts and hoodies.</p></div></div><Link className="production-button production-button-outline" to="/cost-predictor">Estimate your cost <ArrowRight size={15} /></Link></div></aside>}

      <section className="production-section production-factory-story" aria-label="Built with manufacturers">
        <div className="production-container factory-story-layout reveal">
          <div><span className="production-eyebrow">PEOPLE BEHIND THE PRODUCTION</span><h2>{isBrand ? <>Your collection deserves<br />a team behind it.</> : <>Software designed<br />with the factory floor.</>}</h2><p>{isBrand ? 'Finding a factory is the start. We help turn your requirements into a production brief, coordinate with your manufacturing partner, and keep the next steps moving.' : 'Great software starts with understanding how the work gets done. We’re building Formme alongside manufacturers and designers, grounded in the realities of making clothes.'}</p><Link to="/about" className="production-text-link">The story behind Formme <ArrowRight size={15} /></Link><span className="factory-story-location">FOUNDED IN VANCOUVER · CONNECTING FASHION PRODUCTION</span></div>
          <div className="factory-story-photo"><img src="/factory.jpg" alt="Garment workshop with sewing machines, fabric, and production equipment" loading="lazy" /><div className="factory-story-caption"><div><strong>Built with manufacturers.</strong><span>Made for the realities of apparel production.</span></div><CheckCheck size={19} /></div></div>
        </div>
      </section>

      <section className="production-section production-final" aria-label="Get in touch"><div className="production-container reveal"><h2>{isBrand ? 'Let’s make your' : 'Plan. Produce.'}<br />{isBrand ? 'next collection' : 'Inspect. Ship.'} <em>{isBrand ? 'happen.' : 'Connected.'}</em></h2><div><p>{isBrand ? 'Tell us what you’re making, your target quantity, and where you are in the process. We’ll discuss the right next step for your brand.' : <>Bring clarity to your factory operations.<br />Let’s build what’s next, together.</>}</p><a className="production-button" href={CONTACT_HREF}>{isBrand ? 'Discuss your collection' : 'Let’s talk about your factory'} <ArrowRight size={16} /></a></div></div></section>
    </main>
  );
}
