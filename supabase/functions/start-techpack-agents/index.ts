import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.formme.io",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { garmentBrief, svgUrl, designId } = await req.json();

    if (!garmentBrief) {
      throw new Error("garmentBrief is required");
    }

    console.log("Starting techpack generation for design:", designId);
    console.log("Garment brief:", garmentBrief);
    console.log("SVG URL:", svgUrl);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Call Lovable AI to analyze the design and generate techpack sections
    const prompt = `You are a fashion techpack AI assistant. Analyze this garment design and create a comprehensive techpack.

${garmentBrief}

Please provide a detailed techpack with the following sections:

1. DESIGN OVERVIEW:
   - Style description
   - Silhouette
   - Fit
   - Intended use
   - Key features

2. MATERIALS:
   - Shell fabric recommendations
   - Lining fabric (if applicable)
   - Trims needed
   - Hardware specifications

3. CONSTRUCTION NOTES:
   - Sewing techniques
   - Assembly instructions
   - Quality control points

Format the response as structured JSON with these three main sections.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a fashion techpack specialist. Provide detailed, professional techpack specifications.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limits exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable workspace.');
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || '';

    console.log("Techpack generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Techpack generation completed",
        designId: designId,
        techpackContent: generatedText,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating techpack:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
