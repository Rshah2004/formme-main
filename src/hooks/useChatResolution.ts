import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { orderApi } from '@/lib/api';
import { toast } from 'sonner';

export type ResolutionStage = 'tech_pack_review' | 'production_parameters' | 'sample_development' | 'quality_check';

interface UseChatResolutionOptions {
  orderId: string;
  stage: ResolutionStage;
  onApproved?: () => void;
  onChangesRequested?: () => void;
}

export const useChatResolution = ({
  orderId,
  stage,
  onApproved,
  onChangesRequested
}: UseChatResolutionOptions) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const openResolutionChat = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const closeResolutionChat = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handleApproved = useCallback(async () => {
    try {
      // Update the appropriate approval field based on stage
      switch (stage) {
        case 'tech_pack_review':
          await orderApi.confirmTechPackFeasibility({ order_id: orderId });
          break;
        case 'production_parameters':
          await orderApi.approveProductionParams(orderId);
          break;
        case 'sample_development':
          await orderApi.approveSample(orderId);
          break;
        case 'quality_check':
          await orderApi.approveQC(orderId);
          break;
      }
      onApproved?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve stage');
    }
  }, [orderId, stage, onApproved]);

  const handleChangesRequested = useCallback(async () => {
    try {
      // Update the appropriate field to indicate changes are needed
      switch (stage) {
        case 'tech_pack_review':
          await orderApi.requestTechPackChanges({ order_id: orderId, notes: 'See chat for details' });
          break;
        case 'production_parameters':
          await orderApi.rejectProductionParams(orderId, 'See chat for details');
          break;
        case 'sample_development':
          await orderApi.rejectSample(orderId, 'See chat for details');
          break;
        case 'quality_check':
          await orderApi.rejectQC(orderId, 'See chat for details');
          break;
      }
      onChangesRequested?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to request changes');
    }
  }, [orderId, stage, onChangesRequested]);

  return {
    isExpanded,
    openResolutionChat,
    closeResolutionChat,
    handleApproved,
    handleChangesRequested
  };
};

// Stage name mappings
export const STAGE_NAMES: Record<ResolutionStage, string> = {
  tech_pack_review: 'Tech Pack Review',
  production_parameters: 'Production Parameters',
  sample_development: 'Sample Development',
  quality_check: 'Quality Check'
};

// Check if a stage needs resolution (has changes_requested)
export const stageNeedsResolution = (order: any, stage: ResolutionStage): boolean => {
  switch (stage) {
    case 'tech_pack_review':
      return order?.tech_pack_feasible === false;
    case 'production_parameters':
      return order?.production_params_approved === false;
    case 'sample_development':
      return order?.sample_approved === false;
    case 'quality_check':
      return order?.qc_approved === false;
    default:
      return false;
  }
};
