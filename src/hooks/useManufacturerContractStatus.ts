import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ManufacturerContractStatus {
  isContractFinalized: boolean;
  orderId: string | null;
  loading: boolean;
}

export const useManufacturerContractStatus = (orderId: string | null): ManufacturerContractStatus => {
  const [isContractFinalized, setIsContractFinalized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const checkContractStatus = async () => {
      try {
        // Check if the order is in a finalized state (status beyond sent_to_manufacturer)
        const { data: order, error } = await supabase
          .from('orders')
          .select('id, status, manufacturer_id')
          .eq('id', orderId)
          .not('manufacturer_id', 'is', null)
          .in('status', ['production_approval', 'sample_development', 'quality_check', 'shipping', 'delivered'])
          .maybeSingle();

        if (error) {
          console.error('Error checking manufacturer contract status:', error);
          setIsContractFinalized(false);
        } else if (order) {
          setIsContractFinalized(true);
        } else {
          setIsContractFinalized(false);
        }
      } catch (error) {
        console.error('Error checking manufacturer contract status:', error);
        setIsContractFinalized(false);
      } finally {
        setLoading(false);
      }
    };

    checkContractStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`manufacturer-contract-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        () => {
          checkContractStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return { isContractFinalized, orderId, loading };
};
