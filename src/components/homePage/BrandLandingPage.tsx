import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { CONTACT_HREF } from './LandingChrome';
import { BrandWorkspacePreview } from './BrandWorkspacePreview';
import { BrandProcessCards } from './BrandProcessCards';
import companyImage from '@/assets/about-formme-feature.jpg';
import './brand-landing-page.css';

function FashionStudio() {
  return <div className="fashion-studio" aria-label="Illustrative collection from design to production">
    <div className="fashion-studio-backdrop" aria-hidden="true" />
    <figure className="fashion-studio-photo"><img src="/images/formme-fashion-studio.jpg" alt="Studio fashion photograph of a model wearing a white oversized T-shirt" fetchPriority="high" /><figcaption>YOUR NEXT COLLECTION, TAKING SHAPE.</figcaption></figure>
    <div className="fashion-studio-sketch"><div><span>01 / THE IDEA</span></div><img src="/images/essential-tee-sketch.svg" alt="Technical drawing of an oversized T-shirt" /><span>Designed by you.</span><div className="fashion-studio-swatches" aria-label="Illustrative white, charcoal, and soft-blue fabric colors"><i /><i /><i /></div></div>
    <div className="fashion-studio-signoff"><span><Check size={13} /> Sample approved</span><small>Made for your brand.</small></div>
    <div className="fashion-studio-production"><span className="fashion-studio-number">02</span><div><span>THE RIGHT PARTNER</span><strong>Matched by Formme.</strong><small>Supreme Stitch Bangladesh · Example</small></div></div>
    <span className="fashion-studio-footnote">Design reference & illustrative order</span>
  </div>;
}

function MakingSection() {
  return <section className="brand-making" id="how-formme-works" aria-labelledby="brand-making-title">
    <div className="brand-container">
      <div className="brand-making-heading reveal">
        <span className="brand-kicker">LESS BACK-AND-FORTH. MORE MOVING FORWARD.</span>
        <h2 id="brand-making-title">Your vision.<br />Our production <span>know-how.</span></h2>
      </div>
      <div className="brand-making-layout reveal">
        <BrandProcessCards />
        <a className="brand-link brand-making-cta" href={CONTACT_HREF}>Tell us what you’re making <ArrowRight size={16} /></a>
      </div>
    </div>
  </section>;
}


/* The cost predictor was reachable only from the nav and one text link in the
 * FAQ, so nobody browsing the page learned it existed. This shows what the
 * tool asks for rather than announcing it — a dismissible strip reads as an
 * ad and gets skipped. No figure is quoted: the estimate carries its caveats
 * on its own page, and a number here would anchor a price without them. */
function EstimateSection() {
  return <section className="brand-estimate" aria-labelledby="brand-estimate-title">
    <div className="brand-container brand-estimate-layout reveal">
      <div>
        <h2 id="brand-estimate-title">Know what it costs.</h2>
        <p>Pick a garment, a decoration and a quantity — get a per-unit and total estimate in seconds. T-shirts and hoodies, from 20 pieces.</p>
      </div>
      <Link className="brand-cta" to="/cost-predictor">Request a cost estimate <ArrowUpRight size={18} /></Link>
    </div>
  </section>;
}

export function BrandLandingPage() {
  return <main className="brand-site">
    <section className="brand-hero" aria-labelledby="brand-hero-title">
      <div className="brand-container brand-hero-layout">
        <div className="brand-hero-copy">
          <span className="brand-kicker"><span className="brand-kicker-line" /> FOR APPAREL BRANDS WITH BIG IDEAS</span>
          <h1 id="brand-hero-title">You design it.<br /><span>We get it<br className="brand-title-break" /> made.</span></h1>
          <p>We match you with a manufacturer from our network and manage the production — from the first sample to the final shipment.</p>
          <div className="brand-hero-actions"><a className="brand-cta" href={CONTACT_HREF}>Let’s make your collection <ArrowUpRight size={18} /></a><a className="brand-link" href="#how-formme-works">See how it works <ArrowDown size={15} /></a></div>
          <div className="brand-hero-note"><span>YOUR CREATIVE VISION.</span><span>OUR PRODUCTION EXPERTISE.</span></div>
        </div>
        <FashionStudio />
      </div>
    </section>

    <section className="brand-proof reveal" aria-label="Production capability">
      <div className="brand-container brand-proof-layout">
        <div>
          <span className="brand-kicker">MANUFACTURERS IN OUR NETWORK ALSO PRODUCE FOR</span>
          <ul className="brand-proof-names"><li>Polo</li><li>Old Navy</li><li>Walmart</li><li>Fanatics</li><li>Jack &amp; Jones</li></ul>
        </div>
        <p className="brand-proof-moq"><strong>From 30 pieces.</strong> Start small, or run full production — the network covers both.</p>
      </div>
    </section>

    <MakingSection />
    <BrandWorkspacePreview />
    <EstimateSection />

    <section className="brand-company" aria-labelledby="brand-company-title"><div className="brand-container brand-company-layout reveal"><div className="brand-company-copy"><span className="brand-kicker">BUILT BY PEOPLE WHO’VE BEEN THERE</span><h2 id="brand-company-title">Fashion people.<br />Factory people.<br /><span>Your people.</span></h2><p>We’ve run factory floors and built a clothing brand. Formme brings that experience together, so your ideas have the support to become something real.</p><div className="brand-company-facts"><div><strong>40+</strong><span>Years of combined<br />manufacturing experience</span></div><div><strong>Vancouver</strong><span>Where Formme<br />is being built</span></div></div><Link className="brand-link" to="/about">Meet the people behind Formme <ArrowUpRight size={17} /></Link></div><figure><img src={companyImage} alt="Formme presented as the fashion stream organiser at a Vancouver startup event" loading="lazy" /><figcaption><span>PART OF THE FASHION COMMUNITY</span><strong>Building something,<br />together.</strong></figcaption></figure></div></section>

    <section className="brand-faq" aria-labelledby="brand-faq-title"><div className="brand-container reveal"><div><span className="brand-kicker">A LITTLE MORE CLARITY</span><h2 id="brand-faq-title">Good questions.<br />Straight answers.</h2><Link className="brand-link" to="/cost-predictor">Explore production estimates <ArrowRight size={16} /></Link></div><div className="brand-faq-list"><details><summary>Does Formme find my manufacturer?</summary><p>Yes. Share your product requirements and quantity, and we match you with a suitable partner from the manufacturing network we’ve built. Our team then coordinates the next steps with you and the factory.</p></details><details><summary>Who manages the production?</summary><p>Formme coordinates with your manufacturer from sampling through shipment. You review and approve samples, and follow updates and next steps in your workspace.</p></details><details><summary>What should I have ready to get started?</summary><p>A tech pack for your product, your target quantity, and your timeline. The tech pack is what a factory quotes and produces against, so bring yours along — we’ll take it from there.</p></details></div></div></section>

    <section className="brand-close" aria-labelledby="brand-close-title"><div className="brand-container reveal"><span className="brand-kicker">YOU’VE GOT THE IDEA.</span><h2 id="brand-close-title">Let’s get<br /><span>it made.</span><ArrowUpRight aria-hidden="true" /></h2><div><p>Your next collection starts with a conversation.<br />Tell us what you have in mind.</p><a className="brand-cta" href={CONTACT_HREF}>Let’s make your collection <ArrowUpRight size={18} /></a></div></div></section>
  </main>;
}
