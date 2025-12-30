import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Edit, 
  RefreshCw, 
  Loader2, 
  XCircle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ManufacturerFeedbackBannerProps {
  designId: string;
}

interface FeedbackData {
  hasIssues: boolean;
  isUnderReview: boolean;
  isFeasibilityConfirmed: boolean;
  manufacturerName: string | null;
  issues: string | null;
  checklistIssues: Array<{
    item: string;
    cleared: boolean;
  }>;
  orderId: string | null;
}

export const ManufacturerFeedbackBanner = ({ designId }: ManufacturerFeedbackBannerProps) => {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resubmitting, setResubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeedback();

    // Subscribe to order updates
    const channel = supabase
      .channel(`manufacturer-feedback-${designId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.new.design_id === designId) {
            fetchFeedback();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [designId]);

  const fetchFeedback = async () => {
    try {
      // Get the order for this design with manufacturer info
      const { data: order } = await supabase
        .from('orders')
        .select(`
          id,
          tech_pack_feasible,
          tech_pack_feasibility_notes,
          tech_pack_checklist,
          production_params_approved,
          manufacturer:manufacturers(name)
        `)
        .eq('design_id', designId)
        .not('manufacturer_id', 'is', null)
        .maybeSingle();

      if (!order) {
        setFeedback(null);
        setLoading(false);
        return;
      }

      // Parse checklist to find blocking items
      let checklistIssues: Array<{ item: string; cleared: boolean }> = [];
      if (order.tech_pack_checklist) {
        const checklist = order.tech_pack_checklist as Record<string, { cleared: boolean; notes?: string }>;
        checklistIssues = Object.entries(checklist)
          .filter(([_, value]) => !value.cleared)
          .map(([key, value]) => ({
            item: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            cleared: value.cleared
          }));
      }

      setFeedback({
        hasIssues: order.tech_pack_feasible === false,
        isUnderReview: order.tech_pack_feasible === null && order.manufacturer !== null,
        isFeasibilityConfirmed: order.tech_pack_feasible === true && order.production_params_approved === true,
        manufacturerName: (order.manufacturer as any)?.name || null,
        issues: order.tech_pack_feasibility_notes,
        checklistIssues,
        orderId: order.id
      });
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTechPack = () => {
    navigate({
      pathname: '/workflow',
      search: `?designId=${designId}&stage=tech-pack`
    });
  };

  const handleResubmit = async () => {
    if (!feedback?.orderId) return;
    
    setResubmitting(true);
    try {
      // Reset feasibility status to null (under review) without wiping notes history
      const { error } = await supabase
        .from('orders')
        .update({ 
          tech_pack_feasible: null
        })
        .eq('id', feedback.orderId);

      if (error) throw error;

      toast.success('Tech pack resubmitted for review. The manufacturer will be notified.');
      fetchFeedback();
    } catch (error: any) {
      console.error('Error resubmitting tech pack:', error);
      toast.error('Failed to resubmit tech pack');
    } finally {
      setResubmitting(false);
    }
  };

  if (loading || !feedback) {
    return null;
  }

  // Show issues banner if manufacturer reported problems
  if (feedback.hasIssues) {
    return (
      <div className="mb-6 space-y-4">
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Manufacturer Feedback Required</AlertTitle>
          <AlertDescription className="mt-2">
            {feedback.manufacturerName || 'The manufacturer'} has reported issues with your tech pack. 
            Please review the feedback below and make the necessary changes.
          </AlertDescription>
        </Alert>

        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-base">
              <XCircle className="w-5 h-5" />
              Issues to Resolve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Manufacturer notes */}
            {feedback.issues && (
              <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                  <FileText className="w-4 h-4" />
                  Manufacturer Notes:
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 whitespace-pre-wrap">
                  {feedback.issues}
                </p>
              </div>
            )}

            {/* Blocking checklist items */}
            {feedback.checklistIssues.length > 0 && (
              <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  Blocking Checklist Items:
                </div>
                <div className="flex flex-wrap gap-2">
                  {feedback.checklistIssues.map((item, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                    >
                      {item.item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={handleEditTechPack}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Fix & Edit Tech Pack
              </Button>
              <Button 
                onClick={handleResubmit}
                disabled={resubmitting}
                className="gap-2"
              >
                {resubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Resubmit for Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show under review status (no action needed)
  if (feedback.isUnderReview) {
    return (
      <Alert className="mb-6 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Under Manufacturer Review</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
          {feedback.manufacturerName || 'The manufacturer'} is reviewing your tech pack. 
          You'll be notified once they confirm feasibility. Production steps remain locked until review is complete.
        </AlertDescription>
      </Alert>
    );
  }

  // Don't show anything if feasibility is confirmed (FeasibilitySummary handles that)
  return null;
};

export default ManufacturerFeedbackBanner;
