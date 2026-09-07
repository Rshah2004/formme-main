import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Plus } from 'lucide-react';
import { CONTACT_HREF } from './LandingChrome';
import { BrandWorkspacePreview } from './BrandWorkspacePreview';
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

const makingSteps = [
  { id: 'brief', title: 'Bring your idea.', description: 'Share your design, product references, and quantity. We help turn the details into a clear production brief.' },
  { id: 'partner', title: 'Find your people.', description: 'We match you with a manufacturer from the network we\u2019ve built, then coordinate the next steps with you and the factory.' },
  { id: 'production', title: 'Make it happen.', description: 'Approve the sample, then let our team coordinate production. Follow quality checks and shipment updates in your workspace.' },
] as const;

function MakingSection() {
  const [step, setStep] = useState<(typeof makingSteps)[number]['id']>('brief');
  const currentIndex = makingSteps.findIndex(item => item.id === step);
  return <section className="brand-making" id="how-formme-works" aria-labelledby="brand-making-title">
    <div className="brand-container">
      <div className="brand-making-heading reveal"><span className="brand-kicker">LESS BACK-AND-FORTH. MORE MOVING FORWARD.</span><h2 id="brand-making-title">Your vision.<br />Our production <span>know-how.</span></h2></div>
      <div className="brand-making-layout reveal">
        <div className="brand-making-steps">{makingSteps.map((item, index) => <div className={step === item.id ? 'is-selected' : ''} key={item.id}><button type="button" id={`making-step-${item.id}`} aria-expanded={step === item.id} aria-controls="making-preview" onClick={() => setStep(item.id)}><span>0{index + 1}</span><strong>{item.title}</strong><ArrowUpRight size={20} /></button>{step === item.id && <p>{item.description}</p>}</div>)}<a className="brand-link" href={CONTACT_HREF}>Tell us what you’re making <ArrowRight size={16} /></a></div>
        <div className={`brand-making-preview making-preview-${step}`} id="making-preview" role="region" aria-labelledby={`making-step-${step}`}>
          <div className="making-preview-top"><span>THE FORMME PROCESS</span><span>0{currentIndex + 1} / 03 · Example</span></div>
          <div className="making-preview-sequence" aria-hidden="true">{makingSteps.map((item, index) => <span key={item.id} className={index <= currentIndex ? 'is-complete' : ''} />)}</div>
          {/* One document, three states. Each step fills the same card anatomy —
              head (icon + status), body, tinted footer strip — so clicking
              through reads as a single artifact progressing rather than three
              separate layouts swapping places. */}
          <div className="making-preview-scene" key={step}>
            <div className="making-doc">
              <div className="making-doc-head">
                <span className="making-doc-step">0{currentIndex + 1}</span>
                <span className="making-doc-status">
                  <Check size={12} />
                  {step === 'brief' && 'Brief shared with Formme'}
                  {step === 'partner' && 'Matched by Formme'}
                  {step === 'production' && 'Managed by Formme'}
                </span>
              </div>

              {step === 'brief' && <>
                <div className="making-doc-body making-brief">
                  <div className="making-brief-materials">
                    <div className="making-brief-drawing"><div className="making-sheet-heading"><span>YOUR DESIGN</span></div><img src="/images/essential-tee-sketch.svg" alt="Technical drawing of an oversized T-shirt" /><span>OVERSIZED T-SHIRT</span></div>
                  </div>
                  {/* The sketch caption already names the garment and the footer
                      swatch already gives the colour, so the spec list carries only
                      what they don't: what a factory actually quotes against. */}
                  <div className="making-brief-details"><span className="making-label">YOUR PRODUCTION BRIEF</span><h3>The details<br />a factory needs.</h3><dl><div><dt>Fabric</dt><dd>240 GSM combed cotton</dd></div><div><dt>Sizes</dt><dd>XS–XXL</dd></div><div><dt>Quantity</dt><dd>600 pieces</dd></div><div><dt>Finish</dt><dd>Screen print, front</dd></div></dl></div>
                </div>
                <div className="making-doc-foot"><i className="making-swatch" aria-hidden="true" /><span>Colourway</span><strong>Off-white</strong></div>
              </>}

              {step === 'partner' && <>
                <div className="making-doc-body making-partner">
                  <span className="making-label">YOUR MANUFACTURING PARTNER</span><h3>Supreme Stitch</h3><p>Bangladesh</p>
                  <div className="making-partner-connection"><span>Your brand</span><i aria-hidden="true" /><span className="making-connection-logo"><img src="/logo-mark.png" alt="Formme" /></span><i aria-hidden="true" /><span>Your factory</span></div>
                  <p className="making-partner-note">Matched from the manufacturing network we’ve built — not a cold introduction. Your Formme team handles the handover and the first sample.</p>
                </div>
                <div className="making-doc-foot"><span>Next step</span><strong>Sampling</strong></div>
              </>}

              {step === 'production' && <>
                <div className="making-doc-body making-production">
                  <span className="making-label">YOUR COLLECTION, IN PRODUCTION</span>
                  <div className="making-production-title"><h3>Coming<br />to life.</h3><strong>72<small>%</small></strong></div>
                  <div className="making-progress" role="progressbar" aria-label="Example collection production" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}><span /></div>
                  <ol><li><span className="making-stage-icon"><Check size={13} /></span><span>Sample approved by you</span><small>Done</small></li><li className="is-current"><span className="making-stage-icon"><i /></span><span>Sewing in progress</span><small>Now</small></li><li><span className="making-stage-icon" /><span>Quality check &amp; shipment</span><small>Next</small></li></ol>
                </div>
                <div className="making-doc-foot"><span>Estimated shipment</span><strong>18 September</strong></div>
              </>}
            </div>
          </div>
        </div>
      </div>
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
      <div className="brand-container brand-hero-bottom"><span>FROM THE FIRST SKETCH TO THE FINAL STITCH.</span><div><span>Manufacturer matching</span><Plus size={13} /><span>Production management</span><Plus size={13} /><span>One shared workspace</span></div></div>
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

    <section className="brand-company" aria-labelledby="brand-company-title"><div className="brand-container brand-company-layout reveal"><div className="brand-company-copy"><span className="brand-kicker">BUILT BY PEOPLE WHO’VE BEEN THERE</span><h2 id="brand-company-title">Fashion people.<br />Factory people.<br /><span>Your people.</span></h2><p>We’ve run factory floors and built a clothing brand. Formme brings that experience together, so your ideas have the support to become something real.</p><div className="brand-company-facts"><div><strong>40+</strong><span>Years of combined<br />manufacturing experience</span></div><div><strong>Vancouver</strong><span>Where Formme<br />is being built</span></div></div><Link className="brand-link" to="/about">Meet the people behind Formme <ArrowUpRight size={17} /></Link></div><figure><img src={companyImage} alt="Formme presented as the fashion stream organiser at a Vancouver startup event" loading="lazy" /><figcaption><span>PART OF THE FASHION COMMUNITY</span><strong>Building something,<br />together.</strong></figcaption></figure></div></section>

    <section className="brand-faq" aria-labelledby="brand-faq-title"><div className="brand-container reveal"><div><span className="brand-kicker">A LITTLE MORE CLARITY</span><h2 id="brand-faq-title">Good questions.<br />Straight answers.</h2><Link className="brand-link" to="/cost-predictor">Explore production estimates <ArrowRight size={16} /></Link></div><div className="brand-faq-list"><details><summary>Does Formme find my manufacturer?</summary><p>Yes. Share your product requirements and quantity, and we match you with a suitable partner from the manufacturing network we’ve built. Our team then coordinates the next steps with you and the factory.</p></details><details><summary>Who manages the production?</summary><p>Formme coordinates with your manufacturer from sampling through shipment. You review and approve samples, and follow updates and next steps in your workspace.</p></details><details><summary>What should I have ready to get started?</summary><p>Tell us what you want to make, your target quantity, and where you are in the design process. Share a tech pack or product references if you have them, and we’ll discuss the next step.</p></details></div></div></section>

    <section className="brand-close" aria-labelledby="brand-close-title"><div className="brand-container reveal"><span className="brand-kicker">YOU’VE GOT THE IDEA.</span><h2 id="brand-close-title">Let’s get<br /><span>it made.</span><ArrowUpRight aria-hidden="true" /></h2><div><p>Your next collection starts with a conversation.<br />Tell us what you have in mind.</p><a className="brand-cta" href={CONTACT_HREF}>Let’s make your collection <ArrowUpRight size={18} /></a></div></div></section>
  </main>;
}
