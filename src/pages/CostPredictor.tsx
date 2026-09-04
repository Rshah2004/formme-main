import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BG, LAVENDER, INK, MUTED2, BORDER, PURPLE, PURPLE_BG } from '@/components/homePage/theme';
import { Eyebrow, SolidButton, LandingHeader, LandingFooter, CONTACT_HREF } from '@/components/homePage/LandingChrome';
import { useLandingReveal } from '@/components/homePage/useLandingReveal';
import {
  GARMENT_OPTIONS,
  DECORATION_OPTIONS,
  MIN_QUANTITY,
  CUSTOM_QUOTE_THRESHOLD,
  estimateCost,
  type GarmentType,
  type DecorationType,
} from '@/data/costPredictorData';

const currency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const OptionPill = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-xl px-4 py-3 text-[13px] font-inter font-medium transition-colors duration-200 text-left"
    style={
      active
        ? { background: PURPLE, color: '#fff', border: `1px solid ${PURPLE}` }
        : { background: '#fff', color: INK, border: `1px solid ${BORDER}` }
    }
  >
    {children}
  </button>
);

const CostPredictor = () => {
  const prefersReduced = useLandingReveal();
  const [garment, setGarment] = useState<GarmentType>('tshirt');
  const [decoration, setDecoration] = useState<DecorationType>('printing');
  const [quantityInput, setQuantityInput] = useState('50');

  const quantity = parseInt(quantityInput, 10);
  const result = estimateCost(garment, decoration, quantity);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: INK }}>
      <SEO
        title="Cost Predictor"
        canonical="/cost-predictor"
        description="Estimate the cost of your custom merch run in seconds — pick a garment, a decoration method, and a quantity."
      />

      <LandingHeader />

      {/* Hero */}
      <section className="relative" style={{ background: LAVENDER }}>
        <div className="mx-auto max-w-[900px] px-6 pt-36 pb-16 md:pt-44 md:pb-20 text-center">
          <div className="reveal flex justify-center">
            <Eyebrow>Cost predictor</Eyebrow>
          </div>
          <h1 className="reveal font-cormorant font-medium leading-[1.08] tracking-[-0.01em]" style={{ color: INK, fontSize: 'clamp(36px, 5vw, 58px)' }}>
            Know your cost{' '}
            <span className="italic" style={{ color: PURPLE }}>before you commit.</span>
          </h1>
          <p className="reveal mt-6 max-w-xl mx-auto font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '15px' }}>
            Pick a garment, a decoration method, and a quantity to get an instant estimate of production cost and total price.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16 md:py-20 px-6" style={{ background: BG }}>
        <div className="reveal mx-auto max-w-[900px] grid md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Inputs */}
          <div className="rounded-2xl bg-white p-6 md:p-7 flex flex-col gap-6" style={{ border: `1px solid ${BORDER}` }}>
            <div>
              <label className="block font-inter font-medium mb-3" style={{ color: INK, fontSize: '13px' }}>
                Garment
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GARMENT_OPTIONS.map((option) => (
                  <OptionPill key={option.value} active={garment === option.value} onClick={() => setGarment(option.value)}>
                    {option.label}
                  </OptionPill>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-inter font-medium mb-3" style={{ color: INK, fontSize: '13px' }}>
                Decoration
              </label>
              <div className="grid grid-cols-1 gap-2">
                {DECORATION_OPTIONS.map((option) => (
                  <OptionPill key={option.value} active={decoration === option.value} onClick={() => setDecoration(option.value)}>
                    {option.label}
                  </OptionPill>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="quantity" className="block font-inter font-medium mb-3" style={{ color: INK, fontSize: '13px' }}>
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min={MIN_QUANTITY}
                step={1}
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-[15px] font-inter focus:outline-none"
                style={{ border: `1px solid ${BORDER}`, color: INK }}
              />
              <p className="mt-2 font-inter" style={{ color: MUTED2, fontSize: '12px' }}>
                Minimum order is {MIN_QUANTITY} units.
              </p>
            </div>
          </div>

          {/* Results */}
          <div
            className="rounded-2xl p-6 md:p-7 flex flex-col gap-5 min-h-[280px]"
            style={{ background: result.status === 'ok' ? LAVENDER : '#F7F6FB', border: `1px solid ${BORDER}` }}
          >
            {result.status === 'below-minimum' && (
              <div className="flex-1 flex flex-col justify-center">
                <p className="font-dm-sans font-semibold mb-2" style={{ color: INK, fontSize: '18px' }}>
                  Enter at least {MIN_QUANTITY} units
                </p>
                <p className="font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '13.5px' }}>
                  Runs below {MIN_QUANTITY} units aren't supported for custom merch production yet.
                </p>
              </div>
            )}

            {result.status === 'custom-quote' && (
              <div className="flex-1 flex flex-col justify-center">
                <p className="font-dm-sans font-semibold mb-2" style={{ color: INK, fontSize: '18px' }}>
                  Custom quote for {CUSTOM_QUOTE_THRESHOLD}+ units
                </p>
                <p className="font-inter leading-relaxed mb-5" style={{ color: MUTED2, fontSize: '13.5px' }}>
                  Orders of {CUSTOM_QUOTE_THRESHOLD} units or more are priced individually based on your specs. Get in touch and we'll put a number together.
                </p>
                <SolidButton href={CONTACT_HREF}>
                  Get a custom quote <ArrowRight className="w-3.5 h-3.5" />
                </SolidButton>
              </div>
            )}

            {result.status === 'ok' && (
              <>
                <div>
                  <p className="font-inter uppercase tracking-[0.08em] mb-1" style={{ color: MUTED2, fontSize: '11px' }}>
                    Estimated total price
                  </p>
                  <p className="font-dm-sans font-semibold" style={{ color: INK, fontSize: 'clamp(32px, 5vw, 44px)' }}>
                    {currency(result.estimate.totalPrice)}
                  </p>
                  <p className="font-inter mt-1" style={{ color: MUTED2, fontSize: '13px' }}>
                    ≈ {currency(result.estimate.totalPrice / result.estimate.quantity)} per unit · includes production &amp; shipping
                  </p>
                </div>

                <p className="font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '11.5px' }}>
                  Estimate only — final pricing is confirmed once a manufacturer reviews your tech pack and artwork.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24 px-6" style={{ background: LAVENDER }}>
        <div className="reveal mx-auto max-w-[900px] rounded-2xl bg-white p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6" style={{ border: `1px solid ${BORDER}` }}>
          <div>
            <div className="inline-flex mb-3">
              <span className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.1em] font-inter font-medium" style={{ background: PURPLE_BG, color: PURPLE }}>
                Ready to move forward?
              </span>
            </div>
            <h2 className="font-dm-sans font-semibold leading-[1.15]" style={{ color: INK, fontSize: 'clamp(22px, 3vw, 30px)' }}>
              Turn this estimate into a real production plan.
            </h2>
          </div>
          <SolidButton href={CONTACT_HREF}>
            Get in touch <ArrowRight className="w-3.5 h-3.5" />
          </SolidButton>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default CostPredictor;
