import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  Factory, 
  Package, 
  Truck, 
  FileCheck,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkflow } from '@/context/WorkflowContext';
import { toast } from 'sonner';
import { useContractStatus } from '@/hooks/useContractStatus';

interface FeasibilitySummaryProps {
  designId: string;
}

interface FeasibilityData {
  isConfirmed: boolean;
  manufacturerName: string | null;
  leadTime: number | null;
  quantity: number | null;
  fabricType: string | null;
  confirmedAt: string | null;
  orderId: string | null;
  deliveryDate: string | null;
  totalCost: number | null;
}

export const FeasibilitySummary = ({ designId }: FeasibilitySummaryProps) => {
  const [data, setData] = useState<FeasibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const { markStageComplete, setCurrentStage } = useWorkflow();
  const { isContractFinalized } = useContractStatus(designId);

  useEffect(() => {
    fetchFeasibilityData();

    // Subscribe to order updates
    const channel = supabase
      .channel(`feasibility-summary-${designId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.new.design_id === designId) {
            fetchFeasibilityData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [designId]);

  const fetchFeasibilityData = async () => {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select(`
          id,
          tech_pack_feasible,
          production_params_approved,
          tech_pack_feasibility_confirmed_at,
          lead_time_days,
          quantity,
          fabric_type,
          price,
          production_completion_date,
          production_timeline_data,
          manufacturer:manufacturers(name)
        `)
        .eq('design_id', designId)
        .not('manufacturer_id', 'is', null)
        .maybeSingle();

      if (!order) {
        setData(null);
        setLoading(false);
        return;
      }

      const isConfirmed = order.tech_pack_feasible === true && order.production_params_approved === true;
      const timelineData = order.production_timeline_data
        ? (typeof order.production_timeline_data === 'string'
            ? JSON.parse(order.production_timeline_data)
            : order.production_timeline_data)
        : null;
      const unitCost = timelineData?.unit_cost ?? order.price ?? 0;
      const shipping = timelineData?.shipping_cost ?? 0;
      const taxes = timelineData?.taxes_and_fees ?? 0;
      const commission = timelineData?.commission_cost ?? 0;
      const quantity = order.quantity ?? 0;
      const totalCost = unitCost || shipping || taxes || commission
        ? (unitCost * quantity) + shipping + taxes + commission
        : null;
      const deliveryDate = timelineData?.estimated_delivery_date || order.production_completion_date || null;

      setData({
        isConfirmed,
        manufacturerName: (order.manufacturer as any)?.name || null,
        leadTime: order.lead_time_days,
        quantity: order.quantity,
        fabricType: order.fabric_type,
        confirmedAt: order.tech_pack_feasibility_confirmed_at,
        orderId: order.id,
        deliveryDate,
        totalCost
      });
    } catch (error) {
      console.error('Error fetching feasibility data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeAgreement = () => {
    // Mark stages as complete and navigate to production
    markStageComplete('tech-pack');
    markStageComplete('factory-match');
    markStageComplete('send-tech-pack');
    markStageComplete('manufacture-selection');
    markStageComplete('tech-pack-feasibility');
    setCurrentStage('production');
    toast.success('Production agreement finalized! Proceeding to production details.');
  };

  if (loading || !data || !data.isConfirmed) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4" data-help="feasibility-summary" data-help-target="feasibility-summary">
      <Card className="border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-950/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 text-base">
            <FileCheck className="w-5 h-5" />
            Feasibility Summary
          </CardTitle>
          <CardDescription className="text-green-600 dark:text-green-300">
            Production details confirmed by {data.manufacturerName || 'manufacturer'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.leadTime && (
              <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                  <Clock className="w-3 h-3" />
                  Lead Time
                </div>
                <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                  {data.leadTime} days
                </p>
              </div>
            )}

            {data.quantity && (
              <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                  <Package className="w-3 h-3" />
                  Quantity
                </div>
                <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                  {data.quantity} units
                </p>
              </div>
            )}

            {data.fabricType && (
              <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                  <Factory className="w-3 h-3" />
                  Fabric
                </div>
                <p className="text-lg font-semibold text-green-800 dark:text-green-200 truncate">
                  {data.fabricType}
                </p>
              </div>
            )}

            {data.confirmedAt && (
              <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                  <CheckCircle className="w-3 h-3" />
                  Confirmed
                </div>
                <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                  {new Date(data.confirmedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                <Package className="w-3 h-3" />
                Delivery Date
              </div>
              <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                {data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString() : 'Not set'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                <CheckCircle className="w-3 h-3" />
                Total Cost
              </div>
              <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                {data.totalCost && data.totalCost > 0 ? `$${data.totalCost.toFixed(2)}` : 'Not set'}
              </p>
            </div>
          </div>

          {!isContractFinalized && (
            <div className="pt-4 border-t border-green-200 dark:border-green-800">
              <Button 
                size="lg" 
                onClick={handleFinalizeAgreement}
                className="w-full sm:w-auto gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4" />
                Finalize Production Agreement
                <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                This will lock in the production terms and move you to the next phase.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeasibilitySummary;
