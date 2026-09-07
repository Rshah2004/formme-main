import { ArrowRight, ChartNoAxesCombined, Factory, Sprout, Truck, Users } from 'lucide-react';
import { CONTACT_HREF } from './LandingChrome';
import './visibility-preview.css';

const topics = [
  { name: 'Materials', description: 'See what goes in.', icon: Sprout },
  { name: 'Partners', description: 'Who’s involved.', icon: Users },
  { name: 'Delivery', description: 'Follow progress.', icon: Truck },
  { name: 'Production', description: 'Track where it’s at.', icon: Factory },
  { name: 'Insights', description: 'What’s next.', icon: ChartNoAxesCombined },
];

export function VisibilityPreview() {
  return <main className="visibility-preview">
    <div className="production-container">
      <section className="visibility-hero" aria-labelledby="visibility-title">
        <div className="visibility-copy">
          <span className="production-eyebrow">COMING SOON</span>
          <h1 id="visibility-title">Know what goes<br />into your order.</h1>
          <p>We’re building deeper visibility into the materials, partners and processes behind every Formme order.</p>
          <a className="production-button" href={`${CONTACT_HREF}?subject=${encodeURIComponent('Supply Chain Visibility — Early Access')}`}>Join early access <ArrowRight size={17} /></a>
          <span className="visibility-contact-note">Email us to register your interest.</span>
        </div>
        <div className="visibility-orbit" role="group" aria-label="Planned visibility across materials, partners, delivery, production, and insights">
          <svg className="visibility-connections" viewBox="0 0 600 560" aria-hidden="true">
            <ellipse cx="300" cy="280" rx="224" ry="212" />
            {[[300, 65], [515, 208], [435, 452], [165, 452], [85, 208]].map(([x,y]) => <path key={x} d={`M300 280 L${x} ${y}`} />)}
            {[[157, 117], [469, 143], [503, 369], [284, 491], [88, 357]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="5" />)}
          </svg>
          <div className="visibility-hub"><img src="/logo-mark.png" alt="Formme" /></div>
          {topics.map(({name, description, icon: Icon}, index) => <div className={`visibility-node visibility-node-${index}`} key={name}><Icon size={29} strokeWidth={1.8} /><h2>{name}</h2><p>{description}</p></div>)}
        </div>
      </section>
      <section className="visibility-next" aria-labelledby="visibility-next-title">
        <div><span className="production-eyebrow">BUILT ON WHAT ALREADY WORKS</span><h2 id="visibility-next-title">The next step in a more<br />connected industry.</h2></div>
        <p>Production visibility is just the beginning. We’re working towards giving brands more insight across the people, materials and processes that bring their products to life.</p>
      </section>
    </div>
  </main>;
}
