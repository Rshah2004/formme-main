import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Order {
  id: string;
  design_id: string;
  designer_id: string;
  manufacturer_id: string | null;
  quantity: number | null;
  status: string | null;
  created_at: string;
  updated_at?: string;
  designs: {
    name: string;
    user_id: string;
  };
  profiles: {
    full_name: string | null;
  };
}

export const useManufacturerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get manufacturer record for this user
      const { data: manufacturer } = await supabase
        .from('manufacturers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!manufacturer) {
        setLoading(false);
        return;
      }

      // Fetch orders for this manufacturer
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          designs (
            name,
            user_id,
            category
          ),
          techpacks (
            id,
            pdf_url,
            version
          )
        `
        )
        .eq('manufacturer_id', manufacturer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch designer profiles separately
      const ordersWithProfiles = await Promise.all(
        (data || []).map(async (order) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, company_name')
            .eq('user_id', order.designer_id)
            .single();

          return {
            ...order,
            profiles: profile 
              ? { full_name: profile.full_name || profile.company_name || null }
              : { full_name: null },
          };
        })
      );

      // De-dupe by design_id: keep the most advanced order status so the manufacturer
      // sees the "real" active contract if duplicates were accidentally created.
      const statusRank: Record<string, number> = {
        draft: 0,
        tech_pack_pending: 1,
        sent_to_manufacturer: 2,
        manufacturer_review: 3,
        production_approval: 4,
        sample_development: 5,
        quality_check: 6,
        shipping: 7,
        delivered: 8,
        cancelled: -1,
      };

      const bestByDesign = new Map<string, any>();
      for (const order of ordersWithProfiles as any[]) {
        const key = order.design_id;
        const current = bestByDesign.get(key);
        if (!current) {
          bestByDesign.set(key, order);
          continue;
        }

        const a = statusRank[order.status ?? 'draft'] ?? 0;
        const b = statusRank[current.status ?? 'draft'] ?? 0;

        if (a > b) {
          bestByDesign.set(key, order);
          continue;
        }

        // tie-breaker: latest updated_at/created_at
        if (a === b) {
          const aTime = new Date(order.updated_at ?? order.created_at).getTime();
          const bTime = new Date(current.updated_at ?? current.created_at).getTime();
          if (aTime > bTime) bestByDesign.set(key, order);
        }
      }

      const deduped = Array.from(bestByDesign.values()).sort((a: any, b: any) => {
        const aTime = new Date(a.updated_at ?? a.created_at).getTime();
        const bTime = new Date(b.updated_at ?? b.created_at).getTime();
        return bTime - aTime;
      });

      setOrders(deduped);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, refetch: fetchOrders };
};
