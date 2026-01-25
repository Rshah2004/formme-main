import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContractStatus {
  isContractFinalized: boolean;
  orderId: string | null;
  loading: boolean;
}

export const useContractStatus = (designId: string | null): ContractStatus => {
  const [isContractFinalized, setIsContractFinalized] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!designId) {
      setLoading(false);
      return;
    }

    const checkContractStatus = async () => {
      try {
        // Check if there's a finalized order (with manufacturer_id and status beyond sent_to_manufacturer)
        const { data: order, error } = await supabase
          .from('orders')
          .select('id, status, manufacturer_id')
          .eq('design_id', designId)
          .not('manufacturer_id', 'is', null)
          .in('status', ['production_approval', 'sample_development', 'quality_check', 'shipping', 'delivered'])
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error checking contract status:', error);
          setIsContractFinalized(false);
          setOrderId(null);
        } else if (order) {
          setIsContractFinalized(true);
          setOrderId(order.id);
        } else {
          setIsContractFinalized(false);
          setOrderId(null);
        }
      } catch (error) {
        console.error('Error checking contract status:', error);
        setIsContractFinalized(false);
      } finally {
        setLoading(false);
      }
    };

    checkContractStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`contract-status-${designId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `design_id=eq.${designId}`,
        },
        () => {
          checkContractStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [designId]);

  return { isContractFinalized, orderId, loading };
};

// Hook to check if user is admin
export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        // Only r12@gmail.com is admin
        setIsAdmin(user?.email === 'r12@gmail.com');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
};
