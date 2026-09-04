/**
 * Pricing model reverse-engineered from the merch pricing spreadsheet.
 *
 * For every tier, "Production Cost + Shipping" = unitPrice * quantity, and
 * "Total Price" = production cost * (1 + commission). Confirmed against every
 * min/max cell in the source sheet (e.g. T-shirt/Printing 20-49: unit $15,
 * commission 20% -> 15*20=$300 prod / $360 total, 15*49≈$740 prod / $890 total).
 * That lets us quote any quantity within a tier, not just its min/max bounds.
 */

export type GarmentType = 'tshirt' | 'hoodie';
export type DecorationType = 'printing' | 'printing-embroidery';

export interface PricingTier {
  minQty: number;
  maxQty: number | null;
  unitPrice: number | null;
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
  productionCost: number;
  totalPrice: number;
  commission: number;
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
  if (!tier || tier.unitPrice === null || tier.commission === null) {
    return { status: 'custom-quote' };
  }

  const productionCost = tier.unitPrice * quantity;
  const totalPrice = productionCost * (1 + tier.commission);

  return {
    status: 'ok',
    estimate: {
      tier,
      quantity,
      unitPrice: tier.unitPrice,
      productionCost,
      totalPrice,
      commission: tier.commission,
    },
  };
}
