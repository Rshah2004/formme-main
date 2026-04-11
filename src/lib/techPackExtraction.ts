import { Json } from '@/integrations/supabase/types';

export type ExtractedMeasurement = {
  name: string;
  value: string;
  unit?: string | null;
  size?: string | null;
  normalizedKey?: string | null;
  confidence?: number | null;
  sourceText?: string | null;
};

export type ExtractedTechPackData = {
  garmentType?: string | null;
  brand?: string | null;
  baseSize?: string | null;
  sizeRange?: string[];
  grading?: string | null;
  fabricType?: string | null;
  gsm?: number | null;
  printType?: string | null;
  constructionNotes?: string | null;
  measurements?: ExtractedMeasurement[];
  additionalDetails?: Record<string, unknown>;
};

type StandardMeasurements = {
  chestWidth: string;
  length: string;
  sleeveLength: string;
  shoulderWidth: string;
  hemWidth: string;
  baseSize?: string;
  sizeRange?: string[];
  grading?: string;
};

const emptyMeasurements: StandardMeasurements = {
  chestWidth: '',
  length: '',
  sleeveLength: '',
  shoulderWidth: '',
  hemWidth: '',
};

function sanitizeText(value: string): string {
  return value.replace(/\u0000/g, '').replace(/\r/g, '\n');
}

function sanitizeJsonValue(value: unknown): Json {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return sanitizeText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((entry) => sanitizeJsonValue(entry));
  if (typeof value === 'object') {
    const result: Record<string, Json> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      result[key] = sanitizeJsonValue(entry);
    }
    return result;
  }
  return String(value);
}

function coerceString(value: unknown): string {
  return typeof value === 'string' ? sanitizeText(value) : '';
}

export function normalizeMeasurementValue(value: string, unit?: string | null): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const numericMatch = trimmed.match(/-?\d+(\.\d+)?/);
  if (!numericMatch) return trimmed;

  const unitText = (unit || '').toLowerCase();
  const unitInValue = trimmed.toLowerCase();

  if (
    unitText.includes('cm') ||
    unitInValue.includes(' cm') ||
    unitInValue.endsWith('cm')
  ) {
    const inches = Number(numericMatch[0]) / 2.54;
    return Number.isFinite(inches) ? inches.toFixed(2).replace(/\.00$/, '') : trimmed;
  }

  return numericMatch[0];
}

export function buildMeasurementPrefill(
  extraction?: ExtractedTechPackData | null,
  existing?: Record<string, unknown> | null
): StandardMeasurements {
  const merged: StandardMeasurements = {
    chestWidth: coerceString(existing?.chestWidth),
    length: coerceString(existing?.length),
    sleeveLength: coerceString(existing?.sleeveLength),
    shoulderWidth: coerceString(existing?.shoulderWidth),
    hemWidth: coerceString(existing?.hemWidth),
    baseSize: coerceString(existing?.baseSize) || undefined,
    sizeRange: Array.isArray(existing?.sizeRange)
      ? (existing?.sizeRange as string[]).filter(Boolean)
      : undefined,
    grading: coerceString(existing?.grading) || undefined,
  };

  for (const measurement of extraction?.measurements || []) {
    const key = measurement.normalizedKey;
    if (!key || !(key in merged)) continue;
    const nextValue = normalizeMeasurementValue(measurement.value, measurement.unit);
    if (nextValue && !merged[key as keyof StandardMeasurements]) {
      (merged[key as keyof StandardMeasurements] as string) = nextValue;
    }
  }

  if (!merged.baseSize && extraction?.baseSize) merged.baseSize = extraction.baseSize;
  if ((!merged.sizeRange || merged.sizeRange.length === 0) && extraction?.sizeRange?.length) {
    merged.sizeRange = extraction.sizeRange;
  }
  if (!merged.grading && extraction?.grading) merged.grading = extraction.grading;

  return merged;
}

export function buildDesignSpecsExtractionUpdate(
  extraction: ExtractedTechPackData,
  existingSpecs?: {
    attachments?: Json | null;
    measurements?: Json | null;
    fabric_type?: string | null;
    gsm?: number | null;
    print_type?: string | null;
    construction_notes?: string | null;
  } | null,
  source?: {
    extractedText?: string;
    fileUrl?: string;
    fileName?: string;
    rawExtraction?: unknown;
  }
) {
  const existingMeasurements =
    existingSpecs?.measurements && typeof existingSpecs.measurements === 'object' && !Array.isArray(existingSpecs.measurements)
      ? (existingSpecs.measurements as Record<string, unknown>)
      : null;

  const prefill = buildMeasurementPrefill(extraction, existingMeasurements);
  const existingAttachments =
    existingSpecs?.attachments && typeof existingSpecs.attachments === 'object' && !Array.isArray(existingSpecs.attachments)
      ? { ...(existingSpecs.attachments as Record<string, unknown>) }
      : {};

  return {
    measurements: prefill,
    fabric_type: extraction.fabricType ? sanitizeText(extraction.fabricType) : existingSpecs?.fabric_type || null,
    gsm: extraction.gsm ?? existingSpecs?.gsm ?? null,
    print_type: extraction.printType ? sanitizeText(extraction.printType) : existingSpecs?.print_type || null,
    construction_notes: extraction.constructionNotes ? sanitizeText(extraction.constructionNotes) : existingSpecs?.construction_notes || null,
    attachments: sanitizeJsonValue({
      ...existingAttachments,
      techPackExtraction: {
        extractedAt: new Date().toISOString(),
        source: {
          fileUrl: source?.fileUrl || null,
          fileName: source?.fileName || null,
        },
        extractedText: source?.extractedText || '',
        extraction,
        rawExtraction: source?.rawExtraction || null,
      },
    }) as Json,
  };
}
