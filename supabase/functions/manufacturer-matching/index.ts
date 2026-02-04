import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.formme.io, http://localhost:8080",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANUFACTURER-MATCHING] ${step}${detailsStr}`);
};

// Matching algorithm - calculates score based on criteria
function calculateMatchScore(
  criteria: {
    quantity: number;
    leadTime: string;
    location: string;
    priceRange: string;
    categories: string[];
    minPrice?: number;
    maxPrice?: number;
  },
  manufacturer: {
    min_order_quantity: number | null;
    max_capacity: number | null;
    lead_time_days: number | null;
    location: string | null;
    price_range: string | null;
    categories: string[] | null;
    rating: number | null;
  }
): number {
  let score = 50; // Base score

  // Category match (most important)
  if (criteria.categories.length > 0 && manufacturer.categories) {
    const hasMatch = criteria.categories.some(cat =>
      manufacturer.categories!.some(mCat =>
        mCat.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(mCat.toLowerCase())
      )
    );
    if (hasMatch) score += 25;
    else score -= 20;
  }

  // Quantity check
  const moq = manufacturer.min_order_quantity || 0;
  const maxCap = manufacturer.max_capacity || Infinity;
  if (criteria.quantity >= moq && criteria.quantity <= maxCap) {
    score += 15;
  } else if (criteria.quantity < moq) {
    score -= 10;
  }

  // Lead time preference
  const leadTimeMap: Record<string, number> = {
    '1-2': 14,
    '2-4': 28,
    '4-6': 42,
    '6+': 60
  };
  const targetDays = leadTimeMap[criteria.leadTime] || 30;
  const actualDays = manufacturer.lead_time_days || 30;
  if (actualDays <= targetDays) {
    score += 10;
  } else if (actualDays > targetDays * 1.5) {
    score -= 5;
  }

  // Location preference
  if (criteria.location !== 'any' && manufacturer.location) {
    const locationMatch = manufacturer.location.toLowerCase().includes(criteria.location.toLowerCase());
    if (locationMatch) score += 10;
  }

  // Rating bonus
  if (manufacturer.rating) {
    if (manufacturer.rating >= 4.5) score += 10;
    else if (manufacturer.rating >= 4.0) score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
  return new Response("ok", {
    status: 200,
    headers: corsHeaders,
  });
}


  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { action, ...params } = await req.json();
    logStep("Action requested", { action });

    let result: any;

    switch (action) {
      case "find_matches":
        result = await findMatches(supabaseClient, user.id, params);
        break;
      case "get_all_manufacturers":
        result = await getAllManufacturers(supabaseClient, params);
        break;
      case "get_pending_matches":
        result = await getPendingMatches(supabaseClient, user.id);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function findMatches(supabase: any, userId: string, params: any) {
  const { design_id, quantity, lead_time, location, price_range, min_price, max_price } = params;

  // Get design category
  const { data: design } = await supabase
    .from('designs')
    .select('category, user_id')
    .eq('id', design_id)
    .single();

  if (!design) throw new Error("Design not found");
  if (design.user_id !== userId) throw new Error("Not authorized");

  // Fetch all active manufacturers
  const { data: manufacturers, error } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;

  const criteria = {
    quantity: parseInt(quantity) || 100,
    leadTime: lead_time || '4-6',
    location: location || 'any',
    priceRange: price_range || 'mid',
    categories: design.category ? [design.category] : [],
    minPrice: min_price ? parseInt(min_price) : undefined,
    maxPrice: max_price ? parseInt(max_price) : undefined
  };

  // Calculate scores and sort
  const scoredManufacturers = manufacturers.map((m: any) => ({
    ...m,
    matchScore: calculateMatchScore(criteria, m)
  }));

  // Filter by category if specified
  let filtered = scoredManufacturers;
  if (design.category) {
    filtered = scoredManufacturers.filter((m: any) =>
      m.categories?.some((cat: string) =>
        cat.toLowerCase().includes(design.category.toLowerCase()) ||
        design.category.toLowerCase().includes(cat.toLowerCase())
      )
    );
  }

  // Sort by score descending
  filtered.sort((a: any, b: any) => b.matchScore - a.matchScore);

  logStep("Matches found", { count: filtered.length });
  return filtered;
}

async function getAllManufacturers(supabase: any, params: any) {
  const { design_id } = params;

  // Get design category for scoring
  let designCategory = null;
  if (design_id) {
    const { data: design } = await supabase
      .from('designs')
      .select('category')
      .eq('id', design_id)
      .single();
    designCategory = design?.category;
  }

  // Fetch all active manufacturers
  const { data: manufacturers, error } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;

  // Add scores if we have a design category
  if (designCategory) {
    const criteria = {
      quantity: 100,
      leadTime: '4-6',
      location: 'any',
      priceRange: 'mid',
      categories: [designCategory]
    };

    const scored = manufacturers.map((m: any) => ({
      ...m,
      matchScore: calculateMatchScore(criteria, m)
    }));

    scored.sort((a: any, b: any) => b.matchScore - a.matchScore);
    return scored;
  }

  return manufacturers.map((m: any) => ({ ...m, matchScore: 50 }));
}

async function getPendingMatches(supabase: any, userId: string) {
  // Get manufacturer for user
  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!manufacturer) throw new Error("User is not a manufacturer");

  // Fetch pending matches with design info
  const { data: matches, error } = await supabase
    .from('manufacturer_matches')
    .select(`
      *,
      designs!manufacturer_matches_design_id_fkey (
        id,
        name,
        category,
        user_id
      )
    `)
    .eq('manufacturer_id', manufacturer.id)
    .eq('status', 'pending');

  if (error) throw error;

  // Add designer names
  const matchesWithDesigners = await Promise.all(
    (matches || []).map(async (match: any) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', match.designs.user_id)
        .maybeSingle();

      return {
        ...match,
        designs: {
          ...match.designs,
          designer_name: profile?.full_name || 'Unknown Designer'
        }
      };
    })
  );

  return matchesWithDesigners;
}
