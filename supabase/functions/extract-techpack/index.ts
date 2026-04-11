import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import JSZip from "npm:jszip@3.10.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ExtractedMeasurement = {
  name: string;
  value: string;
  unit?: string | null;
  size?: string | null;
  normalizedKey?: string | null;
  confidence?: number | null;
  sourceText?: string | null;
};

type ExtractedTechPack = {
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

const SIZE_PATTERNS: Array<{ pattern: RegExp; normalized: string }> = [
  { pattern: /\b(?:triple\s*x\s*small|xxxs)\b/i, normalized: 'XXXS' },
  { pattern: /\b(?:double\s*x\s*small|xxs)\b/i, normalized: 'XXS' },
  { pattern: /\b(?:extra\s*small|x\s*small|xs)\b/i, normalized: 'XS' },
  { pattern: /\bsmall\b/i, normalized: 'S' },
  { pattern: /\bmedium\b/i, normalized: 'M' },
  { pattern: /\blarge\b/i, normalized: 'L' },
  { pattern: /\b(?:x\s*large|xlarge|extra\s*large|xl)\b/i, normalized: 'XL' },
  { pattern: /\b(?:xx\s*large|xxlarge|double\s*(?:x|xl)|extra\s*extra\s*large|2xl)\b/i, normalized: 'XXL' },
  { pattern: /\b(?:xxx\s*large|xxxlarge|triple\s*(?:x|xl)|extra\s*extra\s*extra\s*large|3xl)\b/i, normalized: 'XXXL' },
  { pattern: /\b(?:4xl|quad(?:ruple)?\s*(?:x|xl)|extra\s*extra\s*extra\s*extra\s*large)\b/i, normalized: '4XL' },
];

function stripXmlTags(input: string): string {
  return input
    .replace(/\u0000/g, '')
    .replace(/<w:tab\/>/g, ' ')
    .replace(/<w:br\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractDocxText(fileBytes: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(fileBytes);
  const xmlPaths = Object.keys(zip.files)
    .filter((path) =>
      path === 'word/document.xml' ||
      path.startsWith('word/header') ||
      path.startsWith('word/footer') ||
      path.startsWith('word/footnotes')
    )
    .sort();

  const chunks = await Promise.all(
    xmlPaths.map(async (path) => stripXmlTags(await zip.file(path)!.async('text')))
  );

  return chunks.filter(Boolean).join('\n\n').trim();
}

function extractPdfText(fileBytes: Uint8Array): string {
  const binaryText = new TextDecoder('latin1').decode(fileBytes);
  const literalStrings = Array.from(binaryText.matchAll(/\((?:\\.|[^()\\]){2,}\)/g))
    .map((match) =>
      match[0]
        .slice(1, -1)
        .replace(/\\[nrt]/g, ' ')
        .replace(/\\([()\\])/g, '$1')
        .replace(/\s{2,}/g, ' ')
        .trim()
    )
    .filter((value) => /[A-Za-z]/.test(value));

  return literalStrings.join('\n').replace(/\u0000/g, '').trim();
}

async function extractFileText(fileUrl: string, fileName?: string, mimeType?: string): Promise<string> {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error(`Failed to fetch uploaded tech pack: ${response.status}`);

  const fileBytes = new Uint8Array(await response.arrayBuffer());
  const extension = (fileName?.split('.').pop() || '').toLowerCase();
  const type = mimeType?.toLowerCase() || response.headers.get('content-type')?.toLowerCase() || '';

  if (type.includes('wordprocessingml') || extension === 'docx') {
    return extractDocxText(fileBytes);
  }

  if (type.includes('pdf') || extension === 'pdf') {
    return extractPdfText(fileBytes);
  }

  if (
    type.startsWith('text/') ||
    ['txt', 'csv', 'json', 'md'].includes(extension)
  ) {
    return new TextDecoder().decode(fileBytes).trim();
  }

  return '';
}

function sanitizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.replace(/\u0000/g, '').trim();
  return trimmed ? trimmed : null;
}

function parseNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function dedupe<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function normalizeMeasurementKey(name: string): string | null {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const mapping: Array<[RegExp, string]> = [
    [/\b(chest|pit to pit|ptp|body width|1\/2 chest|half chest)\b/, 'chestWidth'],
    [/\b(body length|length|hps length|high point shoulder|center back length)\b/, 'length'],
    [/\b(sleeve length|short sleeve|long sleeve)\b/, 'sleeveLength'],
    [/\b(shoulder|across shoulder|shoulder width)\b/, 'shoulderWidth'],
    [/\b(hem|sweep|bottom opening|hem width)\b/, 'hemWidth'],
  ];

  for (const [pattern, key] of mapping) {
    if (pattern.test(normalized)) return key;
  }
  return null;
}

function detectGarmentType(text: string): string | null {
  const candidates = [
    'T-Shirt', 'Hoodie', 'Sweatshirt', 'Tank Top', 'Polo', 'Jacket',
    'Pant', 'Short', 'Legging', 'Dress', 'Skirt', 'Crewneck'
  ];
  const lower = text.toLowerCase();
  for (const candidate of candidates) {
    if (lower.includes(candidate.toLowerCase())) return candidate;
  }
  return null;
}

function extractLabeledValue(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*[:\\-]\\s*([^\\n]+)`, 'i');
    const match = text.match(pattern);
    if (match?.[1]) return sanitizeString(match[1]);
  }
  return null;
}

function parseSizeRange(text: string): string[] {
  const detected: string[] = [];
  for (const { pattern, normalized } of SIZE_PATTERNS) {
    if (text.match(pattern)) detected.push(normalized);
  }
  return dedupe(detected);
}

function extractPrintColorDetails(text: string, lines: string[]): Array<{ printType: string; notes: string }> {
  const entries: Array<{ printType: string; notes: string }> = [];
  const printType = detectPrintType(text) || 'None';

  const relevantLines = lines.filter((line) =>
    /\b(print|ink|pantone|pms|screen print|dtg|embroidery|heat transfer|sublimation|artwork color|print color)\b/i.test(line)
  );

  const joinedNotes = dedupe(
    relevantLines
      .map((line) => sanitizeString(line))
      .filter(Boolean) as string[]
  ).join(' • ');

  if (printType !== 'None' || joinedNotes) {
    entries.push({
      printType,
      notes: joinedNotes || '',
    });
  }

  return entries;
}

function extractColorDetails(text: string, lines: string[]): { primary?: string | null; colors: string[]; notes?: string | null } {
  const captured = new Set<string>();

  const addColor = (value: string | null) => {
    if (!value) return;
    value
      .split(/[,/]|(?:\band\b)/i)
      .map((part) => sanitizeString(part))
      .filter(Boolean)
      .forEach((part) => {
        const clean = part as string;
        if (clean.length > 1 && clean.length < 64) captured.add(clean);
      });
  };

  addColor(extractLabeledValue(text, ['color', 'colour', 'colorway', 'colourway', 'body color', 'body colour']));

  for (const line of lines) {
    if (!/\b(color|colour|pantone)\b/i.test(line)) continue;
    if (/^(size|qty|quantity|fabric|measurement)/i.test(line)) continue;
    addColor(line.replace(/^[^:.-]*[:.-]\s*/, ''));
  }

  const colors = Array.from(captured);
  const pantones = Array.from(text.matchAll(/\b(?:pantone|pms)\s*[:#-]?\s*([A-Z0-9 -]{2,20})/gi))
    .map((match) => sanitizeString(match[1]))
    .filter(Boolean) as string[];

  const notes = dedupe(pantones).join(', ');

  return {
    primary: colors[0] || null,
    colors,
    notes: notes || null,
  };
}

function detectPrintType(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('screen print')) return 'Screen Print';
  if (lower.includes('dtg')) return 'DTG';
  if (lower.includes('embroidery')) return 'Embroidery';
  if (lower.includes('heat transfer')) return 'Heat Transfer';
  if (lower.includes('sublimation')) return 'Sublimation';
  return null;
}

function extractConstructionNotes(lines: string[]): string | null {
  const headings = [
    'construction notes',
    'construction details',
    'sewing details',
    'stitching details',
    'make details',
  ];

  const headingIndex = lines.findIndex((line) =>
    headings.some((heading) => line.toLowerCase().includes(heading))
  );

  if (headingIndex === -1) return null;

  const collected: string[] = [];
  for (let i = headingIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    if (
      /^[A-Z][A-Z /&-]{4,}$/.test(line) ||
      /^(fabric|measurement|spec|bill of materials|trim|artwork|packaging)/i.test(line)
    ) {
      break;
    }
    collected.push(line);
    if (collected.length >= 8) break;
  }

  return sanitizeString(collected.join(' '));
}

function extractMeasurements(lines: string[], baseSize: string | null, sizeRange: string[]): ExtractedMeasurement[] {
  const results: ExtractedMeasurement[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const normalizedKey = normalizeMeasurementKey(line);
    const hasMeasurementSignal = normalizedKey || /\b(chest|length|sleeve|shoulder|hem|sweep|bottom opening|pit to pit)\b/i.test(line);
    if (!hasMeasurementSignal) continue;

    const tokens = line
      .replace(/\|/g, ' ')
      .split(/\s{2,}|\t|:{1}/)
      .map((token) => token.trim())
      .filter(Boolean);

    const numberTokens = Array.from(line.matchAll(/\b\d+(?:\.\d+)?\b/g)).map((match) => match[0]);
    if (numberTokens.length === 0) continue;

    let chosenValue = numberTokens[0];
    let chosenSize: string | null = null;

    const lineSizes = parseSizeRange(line);
    const candidateSizes = lineSizes.length > 0 ? lineSizes : sizeRange;

    if (baseSize && candidateSizes.length > 1 && numberTokens.length >= candidateSizes.length) {
      const idx = candidateSizes.indexOf(baseSize.toUpperCase());
      if (idx >= 0 && idx < numberTokens.length) {
        chosenValue = numberTokens[idx];
        chosenSize = baseSize;
      }
    }

    const labelMatch = line.match(/^([A-Za-z][A-Za-z0-9 \/()%-]+?)(?:\s*[:\-]\s*|\s+\d)/);
    const name = sanitizeString(labelMatch?.[1]?.replace(/[:\-]+$/, '') || tokens[0]?.replace(/[:\-]+$/, '')) || line.slice(0, 48);
    const unitMatch = line.match(/\b(in|inch|inches|cm|mm)\b/i);
    const unit = unitMatch ? unitMatch[1] : null;
    const id = `${name}|${chosenValue}|${chosenSize || ''}`;
    if (seen.has(id)) continue;
    seen.add(id);

    results.push({
      name,
      value: chosenValue,
      unit,
      size: chosenSize,
      normalizedKey,
      confidence: normalizedKey ? 0.9 : 0.65,
      sourceText: line,
    });
  }

  return results;
}

function extractTechPackData(text: string, fileName?: string): ExtractedTechPack {
  const normalizedText = text
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
  const lines = normalizedText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const brand = extractLabeledValue(normalizedText, ['brand', 'customer', 'client']);
  const baseSize = extractLabeledValue(normalizedText, ['base size', 'sample size', 'fit sample size']);
  const sizeRange = parseSizeRange(normalizedText);
  const fabricType = extractLabeledValue(normalizedText, ['shell fabric', 'main fabric', 'body fabric', 'fabric']);
  const gsmMatch = normalizedText.match(/\b(\d{2,4}(?:\.\d+)?)\s*gsm\b/i);
  const grading = extractLabeledValue(normalizedText, ['grading', 'grade rule']);
  const printType = detectPrintType(normalizedText);
  const constructionNotes = extractConstructionNotes(lines);
  const measurements = extractMeasurements(lines, baseSize, sizeRange);
  const colorDetails = extractColorDetails(normalizedText, lines);
  const printColors = extractPrintColorDetails(normalizedText, lines);
  const garmentType =
    extractLabeledValue(normalizedText, ['garment type', 'style type', 'category']) ||
    detectGarmentType(`${fileName || ''}\n${normalizedText}`);

  const additionalDetails: Record<string, unknown> = {};

  const trimLine = extractLabeledValue(normalizedText, ['trim', 'trims']);
  if (trimLine) additionalDetails.trims = trimLine;

  if (colorDetails.primary) additionalDetails.colorway = colorDetails.primary;
  if (colorDetails.colors.length > 0) additionalDetails.colors = colorDetails.colors;
  if (colorDetails.notes) additionalDetails.colorNotes = colorDetails.notes;
  if (printColors.length > 0) additionalDetails.printColors = printColors;

  const fitLine = extractLabeledValue(normalizedText, ['fit']);
  if (fitLine) additionalDetails.fit = fitLine;

  return {
    garmentType,
    brand,
    baseSize,
    sizeRange,
    grading,
    fabricType,
    gsm: gsmMatch ? Number(gsmMatch[1]) : null,
    printType,
    constructionNotes,
    measurements,
    additionalDetails,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const techPack = body.techPack || {};
    const fileUrl = techPack.fileUrl;
    const fileName = techPack.fileName || '';
    const mimeType = techPack.mimeType || '';

    if (!fileUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing techPack.fileUrl in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractedText = await extractFileText(fileUrl, fileName, mimeType);
    const extraction = extractTechPackData(extractedText, fileName);

    return new Response(
      JSON.stringify({
        success: true,
        extractedText,
        extraction,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('extract-techpack error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
