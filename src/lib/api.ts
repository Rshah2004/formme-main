import { supabase } from '@/integrations/supabase/client';

/**
 * Backend API client for order management operations.
 * All business logic is handled by the backend edge functions.
 */
export const orderApi = {
  // Order Operations
  async createOrder(params: { design_id: string; quantity?: number; sample_quantity?: number; notes?: string; manufacturer_ids?: string[] }) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'create_order', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async getOrder(order_id: string) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'get_order', order_id }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async getOrdersForDesign(design_id: string) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'get_orders_for_design', design_id }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  // Manufacturer Matching
  async sendToManufacturers(params: { design_id: string; manufacturer_ids: string[]; quantity?: number; sample_quantity?: number; notes?: string }) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'send_to_manufacturers', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async finalizeManufacturer(params: { design_id: string; manufacturer_id?: string; order_id?: string }) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'finalize_manufacturer', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async approveManufacturerMatch(match_id: string, design_id: string) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'approve_manufacturer_match', match_id, design_id }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async rejectManufacturerMatch(match_id: string) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'reject_manufacturer_match', match_id }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  // Tech Pack Feasibility
  async confirmTechPackFeasibility(params: { order_id: string; notes?: string; checklist?: any }) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'confirm_tech_pack_feasibility', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async requestTechPackChanges(params: { order_id: string; notes: string; checklist?: any }) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'request_tech_pack_changes', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  // Production Feasibility
  async confirmProductionFeasibility(params: {
    order_id: string;
    lead_time_days: number;
    fabric_sourcing: string;
    capacity_available: boolean;
    sampling_required: boolean;
    sample_type?: string;
    estimated_sample_date?: string | null;
    estimated_delivery_date?: string | null;
    additional_notes?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'confirm_production_feasibility', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async approveProductionParams(order_id: string) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'approve_production_params', order_id }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async rejectProductionParams(order_id: string, notes?: string) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'reject_production_params', order_id, notes }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  // Sample Development
  async submitSample(params: { order_id: string; photos: string[]; notes?: string; turnaround_days?: number; tracking_url?: string }) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'submit_sample', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async approveSample(order_id: string, notes?: string) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'approve_sample', order_id, notes }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async rejectSample(order_id: string, notes: string) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'reject_sample', order_id, notes }
    });
    if (error) {
      console.error("rejectSample failed:", {
        status: error.status,
        body: error.message,
      });
    }
    if (!data.success) {
      console.error("rejectSample failed:", {
        status: data.message,
        body: data.error,
      });

      throw new Error(data.error);

    }
    return data.data;
  },

  // Quality Check
  async submitQC(params: { order_id: string; photos: any; checklist: any[]; result: string; notes?: string; fail_reason?: string; rework_path?: string }) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'submit_qc', ...params }
    });
    if (error) throw new Error(error.message || JSON.stringify(error));
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async approveQC(order_id: string) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'approve_qc', order_id }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async rejectQC(order_id: string, notes: string) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'reject_qc', order_id, notes }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async sendMessage(params: {
    order_id: string;
    content: string;
    message_type?: 'text' | 'request_changes' | 'fix_applied' | 'approved';
    stage?: string | null;
    parent_message_id?: string | null;
    attachments?: string[] | null;
    action_metadata?: Record<string, any>;
  }) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'send_message', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async submitProductionUpdate(params: {
    order_id: string;
    update_status: string;
    update_message?: string;
    timeline_patch?: Record<string, any>;
    append_photos?: string[];
    new_status?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'submit_production_update', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async confirmShipping(params: {
    order_id: string;
    shipping_tracking_url?: string;
    shipping_carrier?: string;
    shipped_at?: string | null;
    shipping_notes?: string | null;
    shipping_tracking_number?: string | null;
    shipping_carton_count?: number | null;
    shipping_terms?: string | null;
  }) {
    const { data, error } = await supabase.functions.invoke('order-management', {
      body: { action: 'confirm_shipping', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
};

// Chat-based pipeline actions API
export const chatApi = {
  async sendStructuredMessage(params: {
    order_id: string;
    message_type: 'text' | 'request_changes' | 'fix_applied' | 'approved';
    content: string;
    stage?: string;
    parent_message_id?: string;
    attachments?: string[];
    action_metadata?: Record<string, any>;
  }) {
    await orderApi.sendMessage({
      order_id: params.order_id,
      content: params.content,
      message_type: params.message_type,
      stage: params.stage || null,
      parent_message_id: params.parent_message_id || null,
      attachments: params.attachments || null,
      action_metadata: params.action_metadata || {},
    });
    return { success: true };
  },

  async uploadChatAttachment(orderId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('design-files')
      .upload(`chat-attachments/${fileName}`, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('design-files')
      .getPublicUrl(`chat-attachments/${fileName}`);
    
    return publicUrl;
  }
};

export const manufacturerApi = {
  async findMatches(params: { design_id: string; quantity?: string; lead_time?: string; location?: string; price_range?: string; min_price?: string; max_price?: string }) {
    const { data, error } = await supabase.functions.invoke('manufacturer-matching', {
      body: { action: 'find_matches', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async getAllManufacturers(design_id?: string) {
    const { data, error } = await supabase.functions.invoke('manufacturer-matching', {
      body: { action: 'get_all_manufacturers', design_id }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async getPendingMatches() {
    const { data, error } = await supabase.functions.invoke('manufacturer-matching', {
      body: { action: 'get_pending_matches' }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
};

export const paymentApi = {
  async calculateOrderCost(params: { order_id?: string; design_id?: string }) {
    const { data, error } = await supabase.functions.invoke('payment-management', {
      body: { action: 'calculate_order_cost', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  async submitPaymentProof(params: { order_id?: string; design_id?: string; proof_url: string }) {
    const { data, error } = await supabase.functions.invoke('payment-management', {
      body: { action: 'submit_payment_proof', ...params }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
};
