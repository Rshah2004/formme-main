import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ORDER-MANAGEMENT] ${step}${detailsStr}`);
};

// Order status flow validation
const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  'draft': ['tech_pack_pending', 'sent_to_manufacturer'],
  'tech_pack_pending': ['sent_to_manufacturer'],
  'sent_to_manufacturer': ['manufacturer_review', 'cancelled'],
  'manufacturer_review': ['production_approval', 'sent_to_manufacturer', 'cancelled'],
  'production_approval': ['sample_development', 'manufacturer_review', 'cancelled'],
  'sample_development': ['quality_check', 'sample_development', 'cancelled'],
  'quality_check': ['shipping', 'sample_development', 'cancelled'],
  'shipping': ['delivered', 'cancelled'],
  'delivered': [],
  'cancelled': []
};

const isValidStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  const validTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];
  return validTransitions.includes(newStatus);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
    logStep("Action requested", { action, params });

    let result: any;

    switch (action) {
      case "create_order":
        result = await createOrder(supabaseClient, user.id, params);
        break;
      case "update_order_status":
        result = await updateOrderStatus(supabaseClient, user.id, params);
        break;
      case "approve_manufacturer_match":
        result = await approveManufacturerMatch(supabaseClient, user.id, params);
        break;
      case "reject_manufacturer_match":
        result = await rejectManufacturerMatch(supabaseClient, user.id, params);
        break;
      case "confirm_tech_pack_feasibility":
        result = await confirmTechPackFeasibility(supabaseClient, user.id, params);
        break;
      case "request_tech_pack_changes":
        result = await requestTechPackChanges(supabaseClient, user.id, params);
        break;
      case "confirm_production_feasibility":
        result = await confirmProductionFeasibility(supabaseClient, user.id, params);
        break;
      case "approve_production_params":
        result = await approveProductionParams(supabaseClient, user.id, params);
        break;
      case "reject_production_params":
        result = await rejectProductionParams(supabaseClient, user.id, params);
        break;
      case "submit_sample":
        result = await submitSample(supabaseClient, user.id, params);
        break;
      case "approve_sample":
        result = await approveSample(supabaseClient, user.id, params);
        break;
      case "reject_sample":
        result = await rejectSample(supabaseClient, user.id, params);
        break;
      case "submit_qc":
        result = await submitQC(supabaseClient, user.id, params);
        break;
      case "approve_qc":
        result = await approveQC(supabaseClient, user.id, params);
        break;
      case "reject_qc":
        result = await rejectQC(supabaseClient, user.id, params);
        break;
      case "send_to_manufacturers":
        result = await sendToManufacturers(supabaseClient, user.id, params);
        break;
      case "get_order":
        result = await getOrder(supabaseClient, user.id, params);
        break;
      case "get_orders_for_design":
        result = await getOrdersForDesign(supabaseClient, user.id, params);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    logStep("Action completed", { action, success: true });
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

// ============== ORDER OPERATIONS ==============

async function createOrder(supabase: any, userId: string, params: any) {
  const { design_id, quantity, notes, manufacturer_ids } = params;

  // Verify user owns the design
  const { data: design, error: designError } = await supabase
    .from('designs')
    .select('id, user_id')
    .eq('id', design_id)
    .single();

  if (designError || !design) throw new Error("Design not found");
  if (design.user_id !== userId) throw new Error("Not authorized to create order for this design");

  // Check user has designer role
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'designer')
    .maybeSingle();

  if (!role) throw new Error("User is not a designer");

  // If manufacturer_ids provided, create/ensure one order per (design_id, manufacturer_id)
  if (manufacturer_ids && manufacturer_ids.length > 0) {
    let createdOrders = 0;
    let reusedOrders = 0;

    for (const manufacturerId of manufacturer_ids) {
      // Ensure match exists (limit(1) avoids maybeSingle errors if duplicates already exist)
      const { data: existingMatch } = await supabase
        .from('manufacturer_matches')
        .select('id')
        .eq('design_id', design_id)
        .eq('manufacturer_id', manufacturerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existingMatch) {
        await supabase.from('manufacturer_matches').insert({
          design_id,
          manufacturer_id: manufacturerId,
          status: 'pending',
        });
      }

      // If an order already exists for this manufacturer, do NOT create another
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('design_id', design_id)
        .eq('manufacturer_id', manufacturerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingOrder?.id) {
        reusedOrders += 1;
        continue;
      }

      await supabase.from('orders').insert({
        design_id,
        designer_id: userId,
        manufacturer_id: manufacturerId,
        quantity: quantity || 100,
        status: 'sent_to_manufacturer',
        notes,
      });

      createdOrders += 1;
    }

    return { createdOrders, reusedOrders };
  }

  // Otherwise, create a single draft order without a manufacturer (idempotent)
  const { data: existingDraft } = await supabase
    .from('orders')
    .select('*')
    .eq('design_id', design_id)
    .is('manufacturer_id', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingDraft?.id) return existingDraft;

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      design_id,
      designer_id: userId,
      quantity: quantity || 100,
      status: 'draft',
      notes,
    })
    .select()
    .single();

  if (error) throw error;
  return order;
}

async function updateOrderStatus(supabase: any, userId: string, params: any) {
  const { order_id, new_status } = params;
  
  // Get current order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, manufacturers(user_id)')
    .eq('id', order_id)
    .single();
    
  if (orderError || !order) throw new Error("Order not found");
  
  // Check authorization (designer or manufacturer)
  const isDesigner = order.designer_id === userId;
  const isManufacturer = order.manufacturers?.user_id === userId;
  
  if (!isDesigner && !isManufacturer) {
    throw new Error("Not authorized to update this order");
  }
  
  // Validate status transition
  if (!isValidStatusTransition(order.status, new_status)) {
    throw new Error(`Invalid status transition from ${order.status} to ${new_status}`);
  }
  
  const { data: updated, error } = await supabase
    .from('orders')
    .update({ status: new_status, updated_at: new Date().toISOString() })
    .eq('id', order_id)
    .select()
    .single();
    
  if (error) throw error;
  return updated;
}

async function getOrder(supabase: any, userId: string, params: any) {
  const { order_id } = params;
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      designs(*),
      manufacturers(*),
      design_specs:design_specs(*)
    `)
    .eq('id', order_id)
    .single();
    
  if (error) throw error;
  
  // Verify access
  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
    
  const isDesigner = order.designer_id === userId;
  const isManufacturer = manufacturer && order.manufacturer_id === manufacturer.id;
  
  if (!isDesigner && !isManufacturer) {
    throw new Error("Not authorized to view this order");
  }
  
  return order;
}

async function getOrdersForDesign(supabase: any, userId: string, params: any) {
  const { design_id } = params;
  
  // Verify user owns design or is assigned manufacturer
  const { data: design } = await supabase
    .from('designs')
    .select('user_id')
    .eq('id', design_id)
    .single();
    
  if (!design) throw new Error("Design not found");
  
  if (design.user_id !== userId) {
    // Check if user is manufacturer for any order
    const { data: manufacturer } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (!manufacturer) throw new Error("Not authorized");
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, manufacturers(*)')
      .eq('design_id', design_id)
      .eq('manufacturer_id', manufacturer.id);
      
    if (error) throw error;
    return orders;
  }
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, manufacturers(*)')
    .eq('design_id', design_id);
    
  if (error) throw error;
  return orders;
}

// ============== MANUFACTURER MATCHING ==============

async function sendToManufacturers(supabase: any, userId: string, params: any) {
  const { design_id, manufacturer_ids, quantity, notes } = params;

  // Verify user owns the design
  const { data: design } = await supabase
    .from('designs')
    .select('id, user_id')
    .eq('id', design_id)
    .single();

  if (!design || design.user_id !== userId) {
    throw new Error("Not authorized");
  }

  const results: Array<{ manufacturerId: string; orderId?: string; reused?: boolean }> = [];
  let created = 0;
  let reused = 0;

  for (const manufacturerId of manufacturer_ids) {
    // Idempotency: if an order already exists for this (design, manufacturer), reuse it
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('design_id', design_id)
      .eq('manufacturer_id', manufacturerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingOrder?.id) {
      results.push({ manufacturerId, orderId: existingOrder.id, reused: true });
      reused += 1;
      continue;
    }

    // Ensure match exists (limit(1) avoids maybeSingle errors if duplicates already exist)
    const { data: existingMatch } = await supabase
      .from('manufacturer_matches')
      .select('id')
      .eq('design_id', design_id)
      .eq('manufacturer_id', manufacturerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!existingMatch) {
      await supabase.from('manufacturer_matches').insert({
        design_id,
        manufacturer_id: manufacturerId,
        status: 'pending',
      });
    }

    // Create order
    const { data: order } = await supabase
      .from('orders')
      .insert({
        design_id,
        designer_id: userId,
        manufacturer_id: manufacturerId,
        quantity: quantity || 100,
        status: 'sent_to_manufacturer',
        notes,
      })
      .select()
      .single();

    results.push({ manufacturerId, orderId: order?.id, reused: false });
    created += 1;
  }

  return { created, reused, results };
}

async function approveManufacturerMatch(supabase: any, userId: string, params: any) {
  const { match_id, design_id } = params;
  
  // Get manufacturer for user
  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (!manufacturer) throw new Error("User is not a manufacturer");

  // Update match status
  const { error: matchError } = await supabase
    .from('manufacturer_matches')
    .update({ status: 'accepted' })
    .eq('id', match_id);

  if (matchError) throw matchError;

  // Update order status
  const { error: orderError } = await supabase
    .from('orders')
    .update({ 
      status: 'manufacturer_review',
      manufacturer_id: manufacturer.id 
    })
    .eq('design_id', design_id)
    .eq('manufacturer_id', manufacturer.id);

  if (orderError) throw orderError;
  
  return { approved: true };
}

async function rejectManufacturerMatch(supabase: any, userId: string, params: any) {
  const { match_id } = params;
  
  // Get manufacturer for user
  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (!manufacturer) throw new Error("User is not a manufacturer");

  const { error } = await supabase
    .from('manufacturer_matches')
    .update({ status: 'rejected' })
    .eq('id', match_id);

  if (error) throw error;
  
  return { rejected: true };
}

// ============== TECH PACK FEASIBILITY ==============

async function confirmTechPackFeasibility(supabase: any, userId: string, params: any) {
  const { order_id, notes, checklist } = params;
  
  // Verify manufacturer owns this order
  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (!manufacturer) throw new Error("User is not a manufacturer");

  const { data: order } = await supabase
    .from('orders')
    .select('manufacturer_id, status')
    .eq('id', order_id)
    .single();
    
  if (!order || order.manufacturer_id !== manufacturer.id) {
    throw new Error("Not authorized to update this order");
  }
  
  // Validate current status allows this transition
  if (order.status !== 'manufacturer_review') {
    throw new Error("Order is not in manufacturer_review status");
  }

  // Note: Do NOT change status here - keep at manufacturer_review
  // Status only changes to production_approval when DESIGNER finalizes the contract
  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      tech_pack_feasible: true,
      tech_pack_feasibility_confirmed_at: new Date().toISOString(),
      tech_pack_feasibility_notes: notes,
      tech_pack_checklist: checklist,
      // Status remains unchanged - designer must finalize
      updated_at: new Date().toISOString()
    })
    .eq('id', order_id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

async function requestTechPackChanges(supabase: any, userId: string, params: any) {
  const { order_id, notes, checklist } = params;
  
  // Verify manufacturer owns this order
  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (!manufacturer) throw new Error("User is not a manufacturer");

  const { data: order } = await supabase
    .from('orders')
    .select('manufacturer_id')
    .eq('id', order_id)
    .single();
    
  if (!order || order.manufacturer_id !== manufacturer.id) {
    throw new Error("Not authorized to update this order");
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      tech_pack_feasible: false,
      tech_pack_feasibility_notes: notes,
      tech_pack_checklist: checklist,
      status: 'sent_to_manufacturer', // Send back for revisions
      updated_at: new Date().toISOString()
    })
    .eq('id', order_id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

// ============== PRODUCTION FEASIBILITY ==============

async function confirmProductionFeasibility(supabase: any, userId: string, params: any) {
  const { order_id, lead_time_days, fabric_sourcing, capacity_available, sampling_required, sample_type, additional_notes } = params;
  
  // Verify manufacturer owns this order
  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (!manufacturer) throw new Error("User is not a manufacturer");

  const { data: order } = await supabase
    .from('orders')
    .select('manufacturer_id, status')
    .eq('id', order_id)
    .single();
    
  if (!order || order.manufacturer_id !== manufacturer.id) {
    throw new Error("Not authorized to update this order");
  }

  const productionTimelineData = {
    lead_time_days,
    fabric_sourcing,
    capacity_available,
    sampling_required,
    sample_type,
    additional_notes,
    confirmed_at: new Date().toISOString()
  };

  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      lead_time_days,
      production_timeline_data: productionTimelineData,
      production_params_submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', order_id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

async function approveProductionParams(supabase: any, userId: string, params: any) {
  const { order_id } = params;
  
  // Verify designer owns this order
  const { data: order } = await supabase
    .from('orders')
    .select('designer_id, status, production_params_submitted_at')
    .eq('id', order_id)
    .single();
    
  if (!order || order.designer_id !== userId) {
    throw new Error("Not authorized to approve this order");
  }
  
  if (!order.production_params_submitted_at) {
    throw new Error("Production parameters have not been submitted yet");
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      production_params_approved: true,
      status: 'sample_development',
      updated_at: new Date().toISOString()
    })
    .eq('id', order_id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

async function rejectProductionParams(supabase: any, userId: string, params: any) {
  const { order_id, notes } = params;
  
  // Verify designer owns this order
  const { data: order } = await supabase
    .from('orders')
    .select('designer_id')
    .eq('id', order_id)
    .single();
    
  if (!order || order.designer_id !== userId) {
    throw new Error("Not authorized to reject this order");
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      production_params_approved: false,
      production_params_submitted_at: null, // Reset so manufacturer can resubmit
      notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', order_id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

// ============== SAMPLE DEVELOPMENT ==============

async function submitSample(supabase: any, userId: string, params: any) {
  const { order_id, photos, notes, turnaround_days } = params;
  
  // Verify manufacturer owns this order
  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (!manufacturer) throw new Error("User is not a manufacturer");

  const { data: order } = await supabase
    .from('orders')
    .select('manufacturer_id, status, production_timeline_data')
    .eq('id', order_id)
    .single();
    
  if (!order || order.manufacturer_id !== manufacturer.id) {
    throw new Error("Not authorized to update this order");
  }

  const updatedTimelineData = {
    ...order.production_timeline_data,
    sample_photos: photos,
    sample_notes: notes,
    sample_turnaround_days: turnaround_days
  };

  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      sample_submitted_at: new Date().toISOString(),
      production_timeline_data: updatedTimelineData,
      updated_at: new Date().toISOString()
    })
    .eq('id', order_id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

async function approveSample(supabase: any, userId: string, params: any) {
  const { order_id, notes } = params;
  
  // Verify designer owns this order
  const { data: order } = await supabase
    .from('orders')
    .select('designer_id, sample_submitted_at')
    .eq('id', order_id)
    .single();
    
  if (!order || order.designer_id !== userId) {
    throw new Error("Not authorized to approve this sample");
  }
  
  if (!order.sample_submitted_at) {
    throw new Error("Sample has not been submitted yet");
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      sample_approved: true,
      status: 'quality_check',
      notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', order_id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

async function rejectSample(supabase: any, userId: string, params: any) {
  const { order_id, notes } = params;
  
  // Verify designer owns this order
  const { data: order } = await supabase
    .from('orders')
    .select('designer_id')
    .eq('id', order_id)
    .single();
    
  if (!order || order.designer_id !== userId) {
    throw new Error("Not authorized to reject this sample");
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      sample_approved: false,
      sample_submitted_at: null, // Reset for resubmission
      notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', order_id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

// ============== QUALITY CHECK ==============

async function submitQC(supabase: any, userId: string, params: any) {
  const { order_id, photos, checklist, result, notes, fail_reason, rework_path } = params;
  
  // Verify manufacturer owns this order
  const { data: manufacturer } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (!manufacturer) throw new Error("User is not a manufacturer");

  const { data: order } = await supabase
    .from('orders')
    .select('manufacturer_id, status')
    .eq('id', order_id)
    .single();
    
  if (!order || order.manufacturer_id !== manufacturer.id) {
    throw new Error("Not authorized to update this order");
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      qc_submitted_at: new Date().toISOString(),
      qc_photos_s: photos?.s,
      qc_photos_m: photos?.m,
      qc_photos_l: photos?.l,
      qc_photos_xl: photos?.xl,
      qc_result: result,
      qc_notes: notes + (fail_reason ? `\nFail Reason: ${fail_reason}` : '') + (rework_path ? `\nRework Path: ${rework_path}` : ''),
      updated_at: new Date().toISOString()
    })
    .eq('id', order_id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

async function approveQC(supabase: any, userId: string, params: any) {
  const { order_id } = params;
  
  // Verify designer owns this order
  const { data: order } = await supabase
    .from('orders')
    .select('designer_id, qc_submitted_at')
    .eq('id', order_id)
    .single();
    
  if (!order || order.designer_id !== userId) {
    throw new Error("Not authorized to approve QC");
  }
  
  if (!order.qc_submitted_at) {
    throw new Error("QC has not been submitted yet");
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      qc_approved: true,
      status: 'shipping',
      updated_at: new Date().toISOString()
    })
    .eq('id', order_id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

async function rejectQC(supabase: any, userId: string, params: any) {
  const { order_id, notes } = params;
  
  // Verify designer owns this order
  const { data: order } = await supabase
    .from('orders')
    .select('designer_id')
    .eq('id', order_id)
    .single();
    
  if (!order || order.designer_id !== userId) {
    throw new Error("Not authorized to reject QC");
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      qc_approved: false,
      qc_submitted_at: null, // Reset for resubmission
      qc_notes: notes,
      status: 'sample_development', // Send back to sample stage
      updated_at: new Date().toISOString()
    })
    .eq('id', order_id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}
