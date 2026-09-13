export type GarmentType = 'tshirt' | 'hoodie';
export type DecorationType = 'printing' | 'printing-embroidery';

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

/**
 * Quantity gate for the public cost predictor, which shows the inputs and the
 * configuration but keeps the numbers behind an access request. It deliberately
 * touches only the thresholds. Rates live in the server function.
 */
export type QuantityStatus = 'below-minimum' | 'custom-quote' | 'ok';

export function quantityStatus(quantity: number): QuantityStatus {
  if (!Number.isFinite(quantity) || quantity < MIN_QUANTITY) return 'below-minimum';
  if (quantity >= CUSTOM_QUOTE_THRESHOLD) return 'custom-quote';
  return 'ok';
}
