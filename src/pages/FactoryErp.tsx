import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { LandingHeader, LandingFooter, CONTACT_HREF } from '@/components/homePage/LandingChrome';
import '@/components/homePage/production-landing.css';
import './factory-erp.css';

const stages = ['Fabric in', 'Cutting', 'Knitting', 'Sewing', 'Finishing', 'Dispatch'];

const benefits = [
  { title: 'Know where the work stands.', body: 'A shared view of each order, so your team knows what’s moving and what needs attention.', label: 'PRODUCTION CLARITY' },
  { title: 'Keep the details together.', body: 'Materials, stage updates and order history connected to the work they belong to.', label: 'ONE SHARED RECORD' },
  { title: 'Make every handoff clearer.', body: 'From fabric arriving to goods leaving, keep the next team informed as an order moves forward.', label: 'CONNECTED TEAMS' },
];

const FactoryErp = () => (
  <div className="production-page factory-erp-page">
    <SEO
      title="Factory ERP"
      canonical="/factory-erp"
      description="Formme Factory ERP is in development with apparel manufacturers. A connected system for materials, production stages and dispatch, built around the factory floor."
    />
    <LandingHeader />

    <main className="erp-main">
      <section className="erp-hero" aria-labelledby="erp-title">
        <div className="production-container erp-hero-layout">
          <div className="erp-hero-copy">
            <div className="erp-product-label"><span>FORMME FACTORY ERP</span><span className="erp-build-badge"><i aria-hidden="true" />In development</span></div>
            <h1 id="erp-title">Your factory.<br /><span>Working as one.</span></h1>
            <p className="erp-lead">Materials, production and dispatch, connected. We’re building one system to help apparel manufacturers keep every order moving.</p>
            <div className="erp-hero-actions">
              <a className="erp-button" href={CONTACT_HREF}>Help shape Factory ERP <ArrowUpRight size={17} /></a>
              <a className="erp-explore" href="#erp-overview">Explore what’s coming <ArrowDown size={15} /></a>
            </div>
            <p className="erp-build-note">Built alongside manufacturers in Bangladesh.</p>
          </div>

          <figure className="erp-floor-visual">
            <img src="/factory.jpg" alt="Garment-making workspace with sewing machines, fabric and cutting tables" fetchPriority="high" />
            <figcaption>
              <div className="erp-photo-heading"><span>BUILT AROUND REAL WORK</span><span>01 — THE FACTORY FLOOR</span></div>
              <strong>One order.<br />Every stage, connected.</strong>
              <div className="erp-photo-flow" aria-hidden="true"><span>Materials</span><ArrowRight size={14} /><span>Production</span><ArrowRight size={14} /><span>Dispatch</span></div>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="erp-coverage" aria-labelledby="erp-coverage-title">
        <div className="production-container erp-coverage-layout">
          <h2 id="erp-coverage-title">From fabric in<br /> to goods out.</h2>
          <ul className="erp-stages" aria-label="Production stages covered">
            {stages.map((stage, index) => <li key={stage}><span>0{index + 1}</span>{stage}</li>)}
          </ul>
        </div>
      </section>

      <section className="erp-overview" id="erp-overview" aria-labelledby="erp-overview-title">
        <div className="production-container">
          <div className="erp-section-heading">
            <div><span className="erp-kicker">LESS CHASING. MORE CLARITY.</span><h2 id="erp-overview-title">A clearer picture.<br />A smoother working day.</h2></div>
            <p>Designed to bring the floor and the office onto the same page, with the information your team needs to move forward.</p>
          </div>
          <div className="erp-benefits">
            {benefits.map((item, index) => <article key={item.label}>
              <div className="erp-benefit-label"><span>0{index + 1}</span><span>{item.label}</span></div>
              <h3>{item.title}</h3><p>{item.body}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className="erp-invitation" aria-labelledby="erp-invitation-title">
        <div className="production-container erp-invitation-panel">
          <div><span className="erp-kicker">BUILT WITH MANUFACTURERS</span><h2 id="erp-invitation-title">Your floor.<br />Your experience.<br /><span>Help shape what’s next.</span></h2></div>
          <div className="erp-invitation-copy"><p>Factory ERP is in development. Tell us how your factory works, where the handoffs get difficult, and what would make a difference to your team.</p><a className="erp-button erp-button-light" href={CONTACT_HREF}>Let’s talk about your factory <ArrowUpRight size={17} /></a><span className="erp-contact-note">A conversation with the Formme team.</span></div>
        </div>
      </section>
    </main>

    <LandingFooter />
  </div>
);

export default FactoryErp;
