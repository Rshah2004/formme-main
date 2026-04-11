import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import jsPDF from "https://esm.sh/jspdf@2.5.1";
import JSZip from "npm:jszip@3.10.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// uAgent endpoints
const SVG_AGENT_URL = Deno.env.get('SVG_AGENT_URL') || "http://localhost:8003/submit";
const DESIGN_AGENT_URL = Deno.env.get('DESIGN_AGENT_URL') || "http://localhost:8001/submit";
const MATERIALS_AGENT_URL = Deno.env.get('MATERIALS_AGENT_URL') || "http://localhost:8002/submit";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

type ExtractedMeasurement = {
  name: string;
  value: string;
  unit?: string;
  size?: string;
  normalizedKey?: string;
  confidence?: number;
  sourceText?: string;
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

// Helper: Call a uAgent endpoint
async function callAgent(url: string, payload: any): Promise<any> {
  try {
    console.log(`📡 Calling agent at ${url}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent ${url} returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Agent ${url} responded successfully`);
    return result;
  } catch (error) {
    console.error(`❌ Agent ${url} failed:`, error);
    throw new Error(`Agent at ${url} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function callLovableJson(systemPrompt: string, userPrompt: string, imageUrl?: string): Promise<any> {
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const content = imageUrl
    ? [
        { type: 'text', text: userPrompt },
        { type: 'image_url', image_url: { url: imageUrl } }
      ]
    : userPrompt;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('Extractor returned no content');
  }

  return typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
}

// Helper: Convert SVG URL/data to base64
async function svgToBase64(designImageUrl: string): Promise<string> {
  try {
    if (designImageUrl.startsWith('http://') || designImageUrl.startsWith('https://')) {
      const response = await fetch(designImageUrl);
      const svgText = await response.text();
      return btoa(svgText);
    } else if (designImageUrl.startsWith('data:')) {
      const base64Match = designImageUrl.match(/base64,(.+)$/);
      return base64Match ? base64Match[1] : btoa(designImageUrl);
    } else {
      return btoa(designImageUrl);
    }
  } catch (error) {
    console.error('SVG conversion error:', error);
    return '';
  }
}

function stripXmlTags(input: string): string {
  return input
    .replace(/<w:tab\/>/g, ' ')
    .replace(/<w:br\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
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

  return literalStrings.join('\n').trim();
}

async function extractFileText(fileUrl: string, fileName?: string, mimeType?: string): Promise<string> {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch uploaded tech pack: ${response.status}`);
  }

  const fileBytes = new Uint8Array(await response.arrayBuffer());
  const extension = (fileName?.split('.').pop() || '').toLowerCase();
  const type = mimeType?.toLowerCase() || response.headers.get('content-type')?.toLowerCase() || '';

  if (type.includes('wordprocessingml') || extension === 'docx') {
    return extractDocxText(fileBytes);
  }

  if (
    type.startsWith('text/') ||
    extension === 'txt' ||
    extension === 'csv' ||
    extension === 'json' ||
    extension === 'md'
  ) {
    return new TextDecoder().decode(fileBytes).trim();
  }

  if (type.includes('pdf') || extension === 'pdf') {
    return extractPdfText(fileBytes);
  }

  return '';
}

function sanitizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseNumericValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const match = value.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function normalizeMeasurementKey(name: string): string | null {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!normalized) return null;

  const mapping: Array<[RegExp, string]> = [
    [/\b(chest|pit to pit|ptp|body width|1\/2 chest|half chest)\b/, 'chestWidth'],
    [/\b(body length|length|hps length|center back length)\b/, 'length'],
    [/\b(sleeve length|short sleeve|long sleeve)\b/, 'sleeveLength'],
    [/\b(shoulder|across shoulder|shoulder width)\b/, 'shoulderWidth'],
    [/\b(hem|sweep|bottom opening|hem width)\b/, 'hemWidth'],
  ];

  for (const [pattern, key] of mapping) {
    if (pattern.test(normalized)) return key;
  }

  return null;
}

function normalizeExtractorResponse(payload: any): ExtractedTechPack {
  const rawMeasurements = Array.isArray(payload?.measurements) ? payload.measurements : [];

  const measurements = rawMeasurements
    .map((entry: any) => {
      const name = sanitizeString(entry?.name);
      const value = sanitizeString(entry?.value);
      if (!name || !value) return null;

      return {
        name,
        value,
        unit: sanitizeString(entry?.unit) || undefined,
        size: sanitizeString(entry?.size) || undefined,
        normalizedKey: sanitizeString(entry?.normalizedKey) || normalizeMeasurementKey(name) || undefined,
        confidence: typeof entry?.confidence === 'number' ? entry.confidence : undefined,
        sourceText: sanitizeString(entry?.sourceText) || undefined,
      };
    })
    .filter(Boolean) as ExtractedMeasurement[];

  const sizeRange = Array.isArray(payload?.sizeRange)
    ? payload.sizeRange.map((value: any) => sanitizeString(value)).filter(Boolean)
    : [];

  return {
    garmentType: sanitizeString(payload?.garmentType),
    brand: sanitizeString(payload?.brand),
    baseSize: sanitizeString(payload?.baseSize),
    sizeRange,
    grading: sanitizeString(payload?.grading),
    fabricType: sanitizeString(payload?.fabricType),
    gsm: parseNumericValue(payload?.gsm),
    printType: sanitizeString(payload?.printType),
    constructionNotes: sanitizeString(payload?.constructionNotes),
    measurements,
    additionalDetails: typeof payload?.additionalDetails === 'object' && payload.additionalDetails
      ? payload.additionalDetails
      : {},
  };
}

// Orchestrator: Coordinates all agents
async function runOrchestration(garmentBrief: string, designImageUrl: string) {
  console.log('🎯 Starting uAgent orchestration...');

  const svgB64 = designImageUrl ? await svgToBase64(designImageUrl) : '';

  console.log('📊 Step 1/3: Calling SVG Parse Agent...');
  const svgPayload = {
    model: "SVGParseTask",
    svg_b64: svgB64,
    garment_brief: garmentBrief
  };

  const svgResponse = await callAgent(SVG_AGENT_URL, svgPayload);
  
  if (svgResponse.error) {
    throw new Error(`SVG Agent error: ${svgResponse.error}`);
  }

  const svgFeatures = svgResponse.features || {};
  console.log('✅ SVG features extracted:', Object.keys(svgFeatures));

  console.log('🎨 Step 2/3: Calling Design Agent...');
  const designPayload = {
    model: "SectionTask",
    section: "design",
    garment_brief: garmentBrief,
    template_image_b64: svgB64,
    svg_features: svgFeatures
  };

  console.log('🧵 Step 3/3: Calling Materials Agent...');
  const materialsPayload = {
    model: "SectionTask",
    section: "materials",
    garment_brief: garmentBrief,
    template_image_b64: svgB64,
    svg_features: svgFeatures
  };

  const [designResponse, materialsResponse] = await Promise.all([
    callAgent(DESIGN_AGENT_URL, designPayload),
    callAgent(MATERIALS_AGENT_URL, materialsPayload)
  ]);

  const designSection = designResponse.content || {};
  const materialsSection = materialsResponse.content || {};

  console.log('✅ All agents completed successfully');

  return {
    svgFeatures,
    designSection,
    materialsSection
  };
}

// Compile markdown
async function compileTechPackMarkdown(data: any) {
  const sections = [];

  sections.push(`# TECHNICAL SPECIFICATION\n`);
  sections.push(`**Style Name:** ${data.header?.styleName || 'Untitled'}`);
  sections.push(`**Style Number:** ${data.header?.styleNumber || 'TBD'}`);
  sections.push(`**Category:** ${data.header?.category || 'Not specified'}`);
  sections.push(`**Brand:** ${data.header?.brand || 'TBD'}`);
  sections.push(`**Season:** ${data.header?.season || 'TBD'}\n`);

  sections.push(`## GARMENT OVERVIEW\n`);
  const design = data.designSection;
  if (design) {
    sections.push(`**Style Description:** ${design.style_description || 'N/A'}`);
    sections.push(`**Silhouette:** ${design.silhouette || 'N/A'}`);
    sections.push(`**Fit:** ${design.fit || 'N/A'}`);
    sections.push(`**Intended Use:** ${design.intended_use || 'N/A'}`);
    
    if (design.key_features?.length) {
      sections.push(`\n**Key Features:**`);
      design.key_features.forEach((f: string) => sections.push(`- ${f}`));
    }
  }

  sections.push(`\n## MATERIALS & TRIMS\n`);
  const materials = data.materialsSection;
  if (materials) {
    sections.push(`**Shell Fabric:** ${materials.shell_fabric || 'TBD'}`);
    sections.push(`**Lining:** ${materials.lining_fabric || 'TBD'}`);
    
    if (materials.trims?.length) {
      sections.push(`\n**Trims:**`);
      materials.trims.forEach((t: string) => sections.push(`- ${t}`));
    }
    
    if (materials.hardware?.length) {
      sections.push(`\n**Hardware:**`);
      materials.hardware.forEach((h: string) => sections.push(`- ${h}`));
    }
  }

  if (data.measurements?.length) {
    sections.push(`\n## MEASUREMENT SPEC\n`);
    sections.push(`| Measurement | Value |`);
    sections.push(`|-------------|-------|`);
    data.measurements.forEach((m: any) => {
      sections.push(`| ${m.name} | ${m.value} |`);
    });
  }

  if (data.constructionNotes) {
    sections.push(`\n## CONSTRUCTION NOTES\n`);
    sections.push(data.constructionNotes);
  }

  return sections.join('\n');
}

// Generate PDF
function generatePDF(techPackContent: string, designData: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  const addHeader = () => {
    doc.setFillColor(52, 76, 61);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('TECHNICAL SPECIFICATION', margin, 17);
    doc.setTextColor(0, 0, 0);
  };

  const addFooter = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
    doc.setTextColor(0, 0, 0);
  };

  addHeader();
  yPosition = 35;

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(designData.name || 'Untitled Design', margin + 5, yPosition + 10);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Type: ${designData.garmentType || 'Not specified'}`, margin + 5, yPosition + 18);
  doc.setTextColor(0, 0, 0);
  yPosition += 35;

  const lines = techPackContent.split('\n');
  let pageNum = 1;

  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pageHeight - 30) {
      addFooter(pageNum);
      doc.addPage();
      pageNum++;
      addHeader();
      yPosition = 35;
      return true;
    }
    return false;
  };

  for (const line of lines) {
    if (line.startsWith('# ')) {
      checkPageBreak(20);
      doc.setFillColor(52, 76, 61);
      doc.rect(margin, yPosition, contentWidth, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(line.replace('# ', '').toUpperCase(), margin + 5, yPosition + 8);
      doc.setTextColor(0, 0, 0);
      yPosition += 18;
    } else if (line.startsWith('## ')) {
      checkPageBreak(15);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(52, 76, 61);
      doc.text(line.replace('## ', ''), margin, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;
    } else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      checkPageBreak(8);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(line.replace(/\*\*/g, ''), margin, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 6;
    } else if (line.trim().startsWith('- ')) {
      checkPageBreak(8);
      doc.setFontSize(10);
      doc.circle(margin + 2, yPosition - 1, 1, 'F');
      const textLines = doc.splitTextToSize(line.replace('- ', ''), contentWidth - 10);
      doc.text(textLines, margin + 6, yPosition);
      yPosition += Math.max(textLines.length * 5, 6);
    } else if (line.includes('|')) {
      checkPageBreak(8);
      const cells = line.split('|').filter(c => c.trim());
      const colWidth = contentWidth / cells.length;
      cells.forEach((cell, idx) => {
        doc.text(cell.trim(), margin + idx * colWidth, yPosition);
      });
      yPosition += 6;
    } else if (line.trim()) {
      checkPageBreak(8);
      doc.setFontSize(10);
      const textLines = doc.splitTextToSize(line, contentWidth);
      doc.text(textLines, margin, yPosition);
      yPosition += Math.max(textLines.length * 5, 6);
    } else {
      yPosition += 4;
    }
  }

  addFooter(pageNum);
  return doc.output('datauristring').split(',')[1];
}

// MAIN SERVE HANDLER
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const body = await req.json();
    
    // Get action from URL query param OR body
    const action = url.searchParams.get('action') || body.action || 'draft';
    
    console.log(`🎯 Action requested: ${action}`);
    console.log(`📦 Request body keys:`, Object.keys(body));

    // ROUTE 1: Generate Draft (NO PDF)
    if (action === 'draft') {
      const designData = body.designData;
      
      if (!designData) {
        return new Response(
          JSON.stringify({ error: 'Missing designData in request body' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('🎯 Generating DRAFT ONLY for:', designData.name);

      const garmentBrief = `Design Name: ${designData.name}
Garment Type: ${designData.garmentType}

Measurements:
${designData.measurements?.map((m: any) => `- ${m.name}: ${m.value}`).join('\n') || 'None provided'}

Fabric Specifications:
${designData.fabricSpecs?.map((f: any) => `- ${f.type}: ${f.details}${f.gsm ? ` (${f.gsm} GSM)` : ''}`).join('\n') || 'None provided'}

Construction Notes:
${designData.constructionNotes || 'None provided'}`;

      const { svgFeatures, designSection, materialsSection } = await runOrchestration(
        garmentBrief,
        designData.designImageUrl || ''
      );

      const markdownPreview = await compileTechPackMarkdown({
        header: {
          styleName: designData.name || '',
          styleNumber: '',
          category: designData.garmentType || '',
          season: '',
          brand: ''
        },
        designSection,
        materialsSection,
        measurements: designData.measurements || [],
        fabricSpecs: designData.fabricSpecs || [],
        constructionNotes: designData.constructionNotes || ''
      });

      const response = {
        success: true,
        draft: {
          header: {
            styleName: designData.name || '',
            styleNumber: '',
            category: designData.garmentType || '',
            season: '',
            createdBy: 'AI Agent System',
            brand: ''
          },
          designOverview: designSection,
          materials: materialsSection,
          measurements: designData.measurements || [],
          fabricSpecs: designData.fabricSpecs || [],
          constructionNotes: designData.constructionNotes || '',
          markdownPreview
        },
        svgFeatures,
        agentResults: {
          svgAnalysis: svgFeatures,
          designSection,
          materialsSection
        }
      };

      console.log('✅ Sending DRAFT response (no PDF)');

      return new Response(
        JSON.stringify(response), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ROUTE 2: Finalize (generate PDF from edited draft)
    if (action === 'finalize') {
      const editedDraft = body.editedDraft || {};
      const originalDesignData = body.originalDesignData || {};

      console.log('📄 Finalizing with PDF generation');

      const finalMarkdown = await compileTechPackMarkdown({
        header: editedDraft.header,
        designSection: editedDraft.designOverview,
        materialsSection: editedDraft.materials,
        measurements: editedDraft.measurements,
        fabricSpecs: editedDraft.fabricSpecs,
        constructionNotes: editedDraft.constructionNotes
      });

      const pdfData = generatePDF(finalMarkdown, {
        name: editedDraft.header.styleName,
        garmentType: editedDraft.header.category,
        designImageUrl: originalDesignData?.designImageUrl
      });

      return new Response(
        JSON.stringify({ 
          success: true,
          techPackContent: finalMarkdown,
          pdfData,
          message: 'Tech pack finalized successfully'
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ROUTE 3: Regenerate Section
    if (action === 'regenerate') {
      const { section, context, additionalPrompt } = body;
      console.log(`🔄 Regenerating ${section} section`);

      const garmentBrief = context.garmentBrief + (additionalPrompt ? `\n\nADDITIONAL: ${additionalPrompt}` : '');
      const svgB64 = context.designImageUrl ? await svgToBase64(context.designImageUrl) : '';

      let newContent;
      
      if (section === 'design') {
        const payload = {
          model: "SectionTask",
          section: "design",
          garment_brief: garmentBrief,
          template_image_b64: svgB64,
          svg_features: context.svgFeatures || {}
        };
        const response = await callAgent(DESIGN_AGENT_URL, payload);
        newContent = response.content;
      } else if (section === 'materials') {
        const payload = {
          model: "SectionTask",
          section: "materials",
          garment_brief: garmentBrief,
          template_image_b64: svgB64,
          svg_features: context.svgFeatures || {}
        };
        const response = await callAgent(MATERIALS_AGENT_URL, payload);
        newContent = response.content;
      } else {
        throw new Error(`Unknown section: ${section}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          newContent,
          section
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ROUTE 4: Extract structured data from an uploaded tech pack
    if (action === 'extract') {
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

      console.log('🧠 Extracting structured specs from tech pack:', fileName || fileUrl);

      const extractedText = await extractFileText(fileUrl, fileName, mimeType);
      const isImage = mimeType.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(fileName || fileUrl);
      const prompt = `Extract the key production specifications from this garment tech pack and return strict JSON.

Rules:
- Tech packs differ by brand, so infer structure from section names, tables, callouts, and measurement specs.
- Prefer exact values from the document. Do not invent missing values.
- Normalize only when confident. Otherwise leave the field null and keep the original detail in additionalDetails.
- Measurements should be an array of objects with: name, value, unit, size, normalizedKey, confidence, sourceText.
- normalizedKey should only be one of: chestWidth, length, sleeveLength, shoulderWidth, hemWidth when the match is clear.
- Keep constructionNotes concise but useful for manufacturing.
- sizeRange must be an array when available.
- additionalDetails can contain trims, labels, packaging, wash care, artwork notes, tolerances, colorways, stitching, or any other extracted fields.

Return JSON with exactly these top-level keys:
{
  "garmentType": string|null,
  "brand": string|null,
  "baseSize": string|null,
  "sizeRange": string[],
  "grading": string|null,
  "fabricType": string|null,
  "gsm": number|null,
  "printType": string|null,
  "constructionNotes": string|null,
  "measurements": Array<{ "name": string, "value": string, "unit": string|null, "size": string|null, "normalizedKey": string|null, "confidence": number|null, "sourceText": string|null }>,
  "additionalDetails": object
}

Context:
- Design name: ${techPack.designName || 'Unknown'}
- File name: ${fileName || 'Unknown'}
- Mime type: ${mimeType || 'Unknown'}

Extracted text:
${extractedText || 'No direct text extraction available. Use the provided file if possible.'}`;

      const rawResponse = await callLovableJson(
        'You extract structured apparel manufacturing specs from heterogeneous brand tech packs and return strict JSON only.',
        prompt,
        isImage ? fileUrl : undefined
      );
      const normalized = normalizeExtractorResponse(rawResponse);

      return new Response(
        JSON.stringify({
          success: true,
          extractedText,
          extraction: normalized,
          rawExtraction: rawResponse,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unknown action
    console.error(`❌ Unknown action: ${action}`);
    return new Response(
      JSON.stringify({ 
        error: 'Invalid action parameter',
        message: `Action '${action}' is not supported. Use 'draft', 'finalize', 'regenerate', or 'extract'`,
        received: action
      }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in generate-techpack function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to generate tech pack'
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
