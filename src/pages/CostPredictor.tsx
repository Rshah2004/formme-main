import { useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SEO } from '@/components/SEO';
import { BG, LAVENDER, INK, MUTED2, BORDER, SURFACE, PURPLE, PURPLE_TEXT, PURPLE_BG } from '@/components/homePage/theme';
import { Eyebrow, SolidButton, LandingHeader, LandingFooter, CONTACT_EMAIL, CONTACT_HREF } from '@/components/homePage/LandingChrome';
import { useLandingReveal } from '@/components/homePage/useLandingReveal';
import {
  GARMENT_OPTIONS,
  DECORATION_OPTIONS,
  MIN_QUANTITY,
  CUSTOM_QUOTE_THRESHOLD,
  PRICING_TABLE,
  quantityStatus,
  estimateCost,
  type GarmentType,
  type DecorationType,
} from '@/data/costPredictorData';

/**
 * Public configuration with a temporary route-based club calculator.
 */

const contactHref = (subject: string, body?: string) => {
  const params = new URLSearchParams({ subject });
  if (body) params.set('body', body);
  return `${CONTACT_HREF}?${params.toString().replace(/\+/g, '%20')}`;
};

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
        : { background: BG, color: INK, border: `1px solid ${BORDER}` }
    }
  >
    {children}
  </button>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className="font-inter" style={{ color: MUTED2, fontSize: '12.5px' }}>{label}</span>
    <span className="font-inter font-medium text-right" style={{ color: INK, fontSize: '13px' }}>{value}</span>
  </div>
);

const CostPredictor = ({ hasAccessLink = false }: { hasAccessLink?: boolean }) => {
  const prefersReduced = useLandingReveal();
  const [garment, setGarment] = useState<GarmentType>('tshirt');
  const [decoration, setDecoration] = useState<DecorationType>('printing');
  const [quantityInput, setQuantityInput] = useState('50');

  const quantity = Number(quantityInput);
  const status = quantityStatus(quantity);
  const result = hasAccessLink ? estimateCost(garment, decoration, quantity) : null;
  const quote = result?.status === 'ok' ? result.estimate : null;
  const priceTiers = PRICING_TABLE[garment][decoration].filter((tier) => tier.unitPrice !== null);
  const pricingCurve = [
    ...priceTiers.map((tier) => ({ quantity: tier.minQty, unitPrice: tier.unitPrice })),
    { quantity: CUSTOM_QUOTE_THRESHOLD - 1, unitPrice: priceTiers.at(-1)!.unitPrice },
  ];

  const garmentLabel = GARMENT_OPTIONS.find((o) => o.value === garment)!.label;
  const decorationLabel = DECORATION_OPTIONS.find((o) => o.value === decoration)!.label;

  const accessHref = contactHref(
    'Cost Predictor — Request access',
    [
      'Hi Formme team,',
      '',
      "Could I get access to the cost predictor? Here's the run I'm planning.",
      '',
      `Garment: ${garmentLabel}`,
      `Decoration: ${decorationLabel}`,
      `Quantity: ${Number.isFinite(quantity) ? quantity : ''} units`,
      '',
      'Timeline:',
      'Tech pack: ',
      '',
      'Thanks,',
    ].join('\n')
  );

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: INK }}>
      <SEO
        title="Cost Predictor"
        canonical="/cost-predictor"
        description="Build your custom merch run — garment, decoration method and quantity — then contact Formme for access to production cost and total price."
      />

      <LandingHeader />

      {/* Hero */}
      <section className="relative" style={{ background: LAVENDER }}>
        <div className="mx-auto max-w-[900px] px-6 pt-36 pb-16 md:pt-44 md:pb-20 text-center">
          <div className="reveal flex justify-center">
            <Eyebrow>{hasAccessLink ? 'Cost predictor · club access' : 'Cost predictor · request access'}</Eyebrow>
          </div>
          <h1 className="reveal font-dm-sans font-semibold leading-[1.1] tracking-[-0.02em]" style={{ color: INK, fontSize: 'clamp(36px, 4.2vw, 54px)' }}>
            Know your cost<br />
            <span className="font-cormorant italic font-medium" style={{ color: PURPLE_TEXT }}>before you commit.</span>
          </h1>
          <p className="reveal mt-6 max-w-xl mx-auto font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '15px' }}>
            {hasAccessLink ? 'Build your run — choose your garment, decoration method and quantity to see your estimated unit price and total.' : "Build your run — garment, decoration method, quantity. Ask us for access and we'll open the cost predictor up to you, with production cost and total price on every run."}
          </p>
          {!hasAccessLink && <div className="reveal mt-8 flex justify-center">
            <SolidButton href={accessHref}>
              Contact us for access <ArrowRight className="w-3.5 h-3.5" />
            </SolidButton>
          </div>}
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16 md:py-20 px-6" style={{ background: BG }}>
        <div className="reveal mx-auto max-w-[900px] grid md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Inputs */}
          <div className="rounded-2xl p-6 md:p-7 flex flex-col gap-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
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
                style={{ background: BG, border: `1px solid ${BORDER}`, color: INK }}
              />
              <p className="mt-2 font-inter" style={{ color: MUTED2, fontSize: '12px' }}>
                Minimum order is {MIN_QUANTITY} units.
              </p>
            </div>
          </div>

          {/* Gated result */}
          <div
            className="rounded-2xl p-6 md:p-7 flex flex-col gap-5 min-h-[280px]"
            style={{ background: status === 'ok' ? LAVENDER : SURFACE, border: `1px solid ${BORDER}` }}
          >
            {status === 'below-minimum' && (
              <div className="flex-1 flex flex-col justify-center">
                <p className="font-dm-sans font-semibold mb-2" style={{ color: INK, fontSize: '18px' }}>
                  Enter at least {MIN_QUANTITY} units
                </p>
                <p className="font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '13.5px' }}>
                  Runs below {MIN_QUANTITY} units aren't supported for custom merch production yet.
                </p>
              </div>
            )}

            {status === 'custom-quote' && (
              <div className="flex-1 flex flex-col justify-center">
                <p className="font-dm-sans font-semibold mb-2" style={{ color: INK, fontSize: '18px' }}>
                  Custom quote for {CUSTOM_QUOTE_THRESHOLD}+ units
                </p>
                <p className="font-inter leading-relaxed mb-5" style={{ color: MUTED2, fontSize: '13.5px' }}>
                  Orders of {CUSTOM_QUOTE_THRESHOLD} units or more are priced individually based on your specs. Contact us and we'll put a number together for you.
                </p>
                <SolidButton href={accessHref}>
                  Contact us <ArrowRight className="w-3.5 h-3.5" />
                </SolidButton>
              </div>
            )}

            {status === 'ok' && (
              <>
                <div className="flex flex-col gap-2.5">
                  <p className="font-inter uppercase tracking-[0.08em]" style={{ color: MUTED2, fontSize: '11px' }}>
                    Your run
                  </p>
                  <SummaryRow label="Garment" value={garmentLabel} />
                  <SummaryRow label="Decoration" value={decorationLabel} />
                  <SummaryRow label="Quantity" value={`${quantity} units`} />
                </div>

                {hasAccessLink ? <div aria-live="polite" className="rounded-xl p-5 md:p-6 flex flex-col gap-4" style={{ background: `linear-gradient(135deg, ${LAVENDER} 0%, #EAE4FF 100%)`, border: `1px solid ${BORDER}` }}>
                  {!Number.isSafeInteger(quantity) ? <p>Enter a whole number of units.</p> : quote && <>
                    <div>
                      <p className="font-inter text-xs font-medium" style={{ color: MUTED2 }}>Estimated unit price</p>
                      <p className="font-dm-sans text-4xl font-semibold tracking-tight mt-2" style={{ color: INK }}>
                        ${quote.unitPrice.toFixed(2)} <span className="font-inter text-sm font-normal tracking-normal" style={{ color: MUTED2 }}>CAD / unit</span>
                      </p>
                    </div>
                    <div className="pt-4 flex flex-col gap-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                      <p className="font-inter text-xs" style={{ color: MUTED2 }}>
                        {quantity} units × ${quote.unitPrice.toFixed(2)} per unit
                      </p>
                      <SummaryRow label="Estimated total" value={`$${quote.totalPrice.toFixed(2)}`} />
                    </div>
                    <p className="font-inter text-xs leading-relaxed rounded-lg px-3 py-2.5" style={{ color: INK, background: 'rgba(255,255,255,0.7)' }}>
                      All prices are in CAD and include shipping costs.
                    </p>
                    <div className="pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
                      <div className="mb-4">
                        <p className="font-inter text-xs font-semibold" style={{ color: INK }}>Unit price by quantity</p>
                        <p className="font-inter text-[11px] mt-1" style={{ color: MUTED2 }}>Larger runs receive a lower price per unit.</p>
                      </div>
                      <div className="h-44 w-full" role="img" aria-label={`Unit price decreases from $${priceTiers[0].unitPrice!.toFixed(2)} at ${priceTiers[0].minQty} units to $${priceTiers.at(-1)!.unitPrice!.toFixed(2)} at ${priceTiers.at(-1)!.minQty} units.`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={pricingCurve} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                            <defs>
                              <linearGradient id="unitPriceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={PURPLE} stopOpacity={0.32} />
                                <stop offset="100%" stopColor={PURPLE} stopOpacity={0.03} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="quantity" type="number" domain={[MIN_QUANTITY, CUSTOM_QUOTE_THRESHOLD - 1]} ticks={[20, 50, 80, 100, 150, 199]} tick={{ fontSize: 10, fill: MUTED2 }} tickLine={false} axisLine={false} />
                            <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 10, fill: MUTED2 }} tickLine={false} axisLine={false} width={48} />
                            <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)} CAD`, 'Unit price']} labelFormatter={(value) => `${value} units`} contentStyle={{ borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 12 }} />
                            <ReferenceLine x={quantity} stroke={INK} strokeDasharray="3 3" />
                            <Area type="stepAfter" dataKey="unitPrice" stroke={PURPLE} strokeWidth={3} fill="url(#unitPriceGradient)" dot={{ r: 3, fill: PURPLE, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="font-inter text-[10px] text-center mt-1" style={{ color: MUTED2 }}>Quantity (units)</p>
                    </div>
                  </>}
                </div> : <div className="rounded-xl px-4 py-4 flex flex-col gap-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" style={{ color: PURPLE_TEXT }} aria-hidden="true" />
                    <p className="font-inter font-medium" style={{ color: INK, fontSize: '13px' }}>
                      We can give you access
                    </p>
                  </div>
                  <p className="font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '13px' }}>
                    Pricing is open to brands we're working with. Contact us and we'll give you access to the cost predictor — production cost and total price, for this run and any other.
                  </p>
                  <SolidButton href={accessHref}>
                    Contact us for access <ArrowRight className="w-3.5 h-3.5" />
                  </SolidButton>
                  <p className="font-inter" style={{ color: MUTED2, fontSize: '11.5px' }}>
                    {CONTACT_EMAIL}
                  </p>
                </div>}

                <p className="font-inter leading-relaxed" style={{ color: MUTED2, fontSize: '11.5px' }}>
                  Final pricing is confirmed once a manufacturer reviews your tech pack and artwork.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24 px-6" style={{ background: LAVENDER }}>
        <div className="reveal mx-auto max-w-[900px] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div>
            <div className="inline-flex mb-3">
              <span className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.1em] font-inter font-medium" style={{ background: PURPLE_BG, color: PURPLE_TEXT }}>
                Ready to move forward?
              </span>
            </div>
            <h2 className="font-dm-sans font-semibold leading-[1.15]" style={{ color: INK, fontSize: 'clamp(22px, 3vw, 30px)' }}>
              Turn your run into a real production plan.
            </h2>
            <p className="mt-3 font-inter" style={{ color: MUTED2, fontSize: '13.5px' }}>
              {hasAccessLink ? `Contact us at ${CONTACT_EMAIL} to discuss your run and confirm pricing.` : `Contact us at ${CONTACT_EMAIL} — we'll give you access to the cost predictor and take it from there.`}
            </p>
          </div>
          <SolidButton href={accessHref}>
            Contact us <ArrowRight className="w-3.5 h-3.5" />
          </SolidButton>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default CostPredictor;
