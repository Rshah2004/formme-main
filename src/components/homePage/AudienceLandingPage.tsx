import { SEO } from '@/components/SEO';
import { LandingHeader, LandingFooter } from './LandingChrome';
import { ProductionLandingExperience } from './ProductionLandingExperience';
import { BrandLandingPage } from './BrandLandingPage';
import { useLandingReveal } from './useLandingReveal';
import type { Audience } from './theme';

const routeFor: Record<Audience, string> = { brand: '/brands', manufacturer: '/manufacturers' };

const seoCopy: Record<Audience, string> = {
  brand: 'Formme helps brands get apparel produced — connect with vetted manufacturers, approve samples, and track production from tech pack to shipment.',
  manufacturer: 'Formme helps manufacturers run production — manage orders, plan lines, track quality, and keep brands updated automatically.',
};

export const AudienceLandingPage = ({ audience }: { audience: Audience }) => {
  /* Lenis smooth scroll + fade-in for `.reveal` blocks, so both audience pages
   * scroll the same way as the cost predictor. Keyed on audience so the reveal
   * scan re-runs when the whole subtree swaps. */
  useLandingReveal(audience);
  return (
    <div className={`production-page${audience === 'brand' ? ' brand-site-shell' : ''}`}>
      <SEO canonical={routeFor[audience]} description={seoCopy[audience]} />
      <LandingHeader />
      {audience === 'brand' ? <BrandLandingPage /> : <ProductionLandingExperience key={audience} audience={audience} />}
      <LandingFooter />
    </div>
  );
};
