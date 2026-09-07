import { ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { LandingHeader, LandingFooter, CONTACT_HREF } from '@/components/homePage/LandingChrome';
import { useLandingReveal } from '@/components/homePage/useLandingReveal';
import '@/components/homePage/production-landing.css';

/* Names the stages the system covers and the problem it replaces. It shows no
 * interface and describes no mechanism — enough to make the work legible to a
 * manufacturer without setting out how any of it is built. */
const stages = ['Fabric in', 'Cutting', 'Knitting', 'Sewing', 'Finishing', 'Dispatch'];

const replaces = [
  { title: 'One record, not five.', body: 'Where an order stands lives in one place, rather than in a spreadsheet, a chat thread, a register and someone’s memory.' },
  { title: 'Recorded where the work happens.', body: 'Each stage is logged on the floor as it moves, so the status is what the floor actually did — not what was remembered at the end of the day.' },
  { title: 'The whole order, end to end.', body: 'From fabric arriving to goods leaving, the same order carries its own history instead of being rebuilt from fragments.' },
];

const FactoryErp = () => {
  useLandingReveal();
  return (
    <div className="production-page factory-erp-page">
      <SEO
        title="Factory ERP"
        canonical="/factory-erp"
        description="Formme is building a production system for apparel factories — fabric in, cutting, knitting, sewing, finishing and dispatch, tracked in one place."
      />
      <LandingHeader />

      <main>
        <section className="production-section factory-erp" aria-labelledby="factory-erp-title">
          <div className="production-container reveal">
            <span className="production-eyebrow">NOW IN BUILD</span>
            <h1 id="factory-erp-title">The whole floor.<br /><em>One system.</em></h1>
            <p className="factory-erp-lead">Every stage of an order recorded where the work happens — what went to cutting and when, which fabric arrived from where, what is on the line right now.</p>
            <ol className="factory-erp-stages" aria-label="Production stages covered">
              {stages.map(stage => <li key={stage}>{stage}</li>)}
            </ol>
            <p className="factory-erp-note">We are building this now, alongside manufacturers in Bangladesh.</p>
          </div>
        </section>

        <section className="production-section factory-erp-replaces" aria-labelledby="factory-erp-replaces-title">
          <div className="production-container reveal">
            <h2 id="factory-erp-replaces-title">Instead of tools<br />that never quite agree.</h2>
            <div className="factory-erp-grid">
              {replaces.map(item => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="production-section factory-erp-cta" aria-labelledby="factory-erp-cta-title">
          <div className="production-container reveal">
            <h2 id="factory-erp-cta-title">Run a factory?<br /><em>We’d like to hear how yours works.</em></h2>
            <p>We are building this with manufacturers, not for them at a distance. If you run a floor and the way you track it is held together with spreadsheets, tell us about it.</p>
            <a className="production-button" href={CONTACT_HREF}>Talk about your factory <ArrowRight size={16} /></a>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default FactoryErp;
