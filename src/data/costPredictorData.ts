/**
 * Pricing model taken from the merch pricing spreadsheet.
 *
 * The sheet's unit price is the customer-facing rate: commission is already
 * inside it. A quote is therefore just unitPrice * quantity, which also lets us
 * price any quantity within a tier rather than only its min/max bounds.
 *
 * `commission` records the share of that unit price we keep. It is documentation
 * of the margin, not a multiplier — applying it on top would charge it twice.
 */

export type GarmentType = 'tshirt' | 'hoodie';
export type DecorationType = 'printing' | 'printing-embroidery';

export interface PricingTier {
  minQty: number;
  maxQty: number | null;
  /** Customer-facing rate per garment, commission included. */
  unitPrice: number | null;
  /** Share of unitPrice we keep. Recorded for reference; never applied on top. */
  commission: number | null;
}

export interface GarmentOption {
  value: GarmentType;
  label: string;
}

export interface DecorationOption {
  value: DecorationType;
  label: string;
}

export const GARMENT_OPTIONS: GarmentOption[] = [
  { value: 'tshirt', label: 'T-Shirts' },
  { value: 'hoodie', label: 'Hoodies' },
];

export const DECORATION_OPTIONS: DecorationOption[] = [
  { value: 'printing', label: 'Printing' },
  { value: 'printing-embroidery', label: 'Printing + Embroidery' },
];

export const MIN_QUANTITY = 20;
export const CUSTOM_QUOTE_THRESHOLD = 200;

export const PRICING_TABLE: Record<GarmentType, Record<DecorationType, PricingTier[]>> = {
  tshirt: {
    printing: [
      { minQty: 20, maxQty: 49, unitPrice: 15, commission: 0.20 },
      { minQty: 50, maxQty: 79, unitPrice: 12, commission: 0.20 },
      { minQty: 80, maxQty: 99, unitPrice: 10, commission: 0.15 },
      { minQty: 100, maxQty: 149, unitPrice: 8.5, commission: 0.15 },
      { minQty: 150, maxQty: 199, unitPrice: 8, commission: 0.12 },
      { minQty: 200, maxQty: null, unitPrice: null, commission: null },
    ],
    'printing-embroidery': [
      { minQty: 20, maxQty: 49, unitPrice: 18, commission: 0.20 },
      { minQty: 50, maxQty: 79, unitPrice: 15, commission: 0.20 },
      { minQty: 80, maxQty: 99, unitPrice: 12, commission: 0.15 },
      { minQty: 100, maxQty: 149, unitPrice: 10, commission: 0.15 },
      { minQty: 150, maxQty: 199, unitPrice: 9, commission: 0.12 },
      { minQty: 200, maxQty: null, unitPrice: null, commission: null },
    ],
  },
  hoodie: {
    printing: [
      { minQty: 20, maxQty: 49, unitPrice: 28, commission: 0.20 },
      { minQty: 50, maxQty: 79, unitPrice: 25, commission: 0.20 },
      { minQty: 80, maxQty: 99, unitPrice: 23, commission: 0.15 },
      { minQty: 100, maxQty: 149, unitPrice: 21, commission: 0.15 },
      { minQty: 150, maxQty: 199, unitPrice: 18, commission: 0.12 },
      { minQty: 200, maxQty: null, unitPrice: null, commission: null },
    ],
    'printing-embroidery': [
      { minQty: 20, maxQty: 49, unitPrice: 30, commission: 0.20 },
      { minQty: 50, maxQty: 79, unitPrice: 27, commission: 0.20 },
      { minQty: 80, maxQty: 99, unitPrice: 25, commission: 0.15 },
      { minQty: 100, maxQty: 149, unitPrice: 23, commission: 0.15 },
      { minQty: 150, maxQty: 199, unitPrice: 20, commission: 0.12 },
      { minQty: 200, maxQty: null, unitPrice: null, commission: null },
    ],
  },
};

export interface CostEstimate {
  tier: PricingTier;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type CostResult =
  | { status: 'ok'; estimate: CostEstimate }
  | { status: 'below-minimum' }
  | { status: 'custom-quote' };

export function findTier(garment: GarmentType, decoration: DecorationType, quantity: number): PricingTier | undefined {
  return PRICING_TABLE[garment][decoration].find(
    (t) => quantity >= t.minQty && (t.maxQty === null || quantity <= t.maxQty)
  );
}

export function estimateCost(garment: GarmentType, decoration: DecorationType, quantity: number): CostResult {
  if (!Number.isFinite(quantity) || quantity < MIN_QUANTITY) {
    return { status: 'below-minimum' };
  }

  const tier = findTier(garment, decoration, quantity);
  if (!tier || tier.unitPrice === null) {
    return { status: 'custom-quote' };
  }

  return {
    status: 'ok',
    estimate: {
      tier,
      quantity,
      unitPrice: tier.unitPrice,
      totalPrice: tier.unitPrice * quantity,
    },
  };
}

/**
 * Quantity gate for the public cost predictor, which shows the inputs and the
 * configuration but keeps the numbers behind an access request. It deliberately
 * touches only the thresholds, so the public page never imports PRICING_TABLE
 * (and the rates stay out of the client bundle).
 */
export type QuantityStatus = 'below-minimum' | 'custom-quote' | 'ok';

export function quantityStatus(quantity: number): QuantityStatus {
  if (!Number.isFinite(quantity) || quantity < MIN_QUANTITY) return 'below-minimum';
  if (quantity >= CUSTOM_QUOTE_THRESHOLD) return 'custom-quote';
  return 'ok';
}
