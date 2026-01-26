import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Factory, CheckCircle, XCircle, Upload, Image as ImageIcon, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryDocuments } from './FactoryDocuments';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProductionStageProps { design: Design; }

const ProductionStage = ({ design }: ProductionStageProps) => {
  const { workflowData, updateWorkflowData, currentStage, setCurrentStage, markStageComplete } = useWorkflow();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch order with production parameters
        const { data: order, error } = await supabase
          .from('orders')
          .select(`
            *,
            manufacturers (
              name,
              location
            )
          `)
          .eq('design_id', design.id)
          .eq('designer_id', user.id)
          .not('manufacturer_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching order:', error);
          return;
        }

        setOrderData(order);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();

    // Real-time subscription for production params updates
    const channel = supabase
      .channel('production-params-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `design_id=eq.${design.id}`
        },
        (payload) => {
          setOrderData((prev: any) => prev ? { ...prev, ...payload.new } : payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [design.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading production parameters...</p>
      </div>
    );
  }

  const hasProductionParams = orderData?.production_params_submitted_at;
  const manufacturerName = orderData?.manufacturers?.name || workflowData.selectedFactory?.name || 'the manufacturer';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <StageHeader 
        icon={Factory} 
        title="Review production parameters" 
        description="Factory uploads fabric details and production timeline for your approval before production begins."
        contextInfo={[
          { label: 'Factory', value: workflowData.selectedFactory?.name || 'Not selected' },
          { label: 'Quantity', value: workflowData.quantity || 'Not set' }
        ]}
      />
      
      {!hasProductionParams ? (
        /* Waiting State */
        <div className="max-w-3xl mx-auto mt-12">
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="w-8 h-8 text-muted-foreground animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Waiting for manufacturer
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {manufacturerName} is preparing the production parameters. You'll be able to review fabric specifications once they submit them.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
      /* Production Parameters Display */
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Fabric Specifications</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Fabric Type</Label>
                    <p className="text-sm font-medium">{orderData.fabric_type || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">GSM (Weight)</Label>
                    <p className="text-sm font-medium">{orderData.gsm || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Shrinkage (%)</Label>
                    <p className="text-sm font-medium">{orderData.shrinkage || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Color Fastness</Label>
                    <p className="text-sm font-medium">{orderData.color_fastness || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Production Timeline</h3>
            </div>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Start Date</Label>
                      <p className="text-sm font-medium">{formatDate(orderData?.production_start_date)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Expected Completion</Label>
                      <p className="text-sm font-medium">{formatDate(orderData?.production_completion_date)}</p>
                    </div>
                  </div>
                  {orderData?.production_start_date && orderData?.production_completion_date && (
                  <div className="mt-6">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">{formatDate(orderData.production_start_date)}</span>
                        <span className="text-xs font-medium text-muted-foreground">{formatDate(orderData.production_completion_date)}</span>
                      </div>
                      <div className="overflow-hidden h-3 text-xs flex rounded-full bg-muted">
                        <div className="bg-primary w-1/3 flex items-center justify-center text-white text-[10px] font-semibold">Cutting</div>
                        <div className="bg-primary/60 w-1/3 flex items-center justify-center text-white text-[10px] font-semibold">Sewing</div>
                        <div className="bg-primary/30 w-1/3 flex items-center justify-center text-white text-[10px] font-semibold">Finishing</div>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Button 
                    variant={workflowData.materialsApproved ? 'default' : 'outline'} 
                    className="flex-1 gap-2" 
                    onClick={async () => {
                      updateWorkflowData({ materialsApproved: true, materialsRejected: false });
                      if (orderData?.id) {
                        await supabase
                          .from('orders')
                          .update({ production_params_approved: true } as any)
                          .eq('id', orderData.id);
                        toast.success('Production parameters approved!');
                      }
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />Approve Production Parameters
                  </Button>
                  <Button 
                    variant={workflowData.materialsRejected ? 'destructive' : 'outline'} 
                    className="flex-1 gap-2" 
                    onClick={async () => {
                      updateWorkflowData({ materialsApproved: false, materialsRejected: true });
                      if (orderData?.id) {
                        await supabase
                          .from('orders')
                          .update({ production_params_approved: false } as any)
                          .eq('id', orderData.id);
                        toast.error('Production parameters rejected');
                      }
                    }}
                  >
                    <XCircle className="w-4 h-4" />Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <div className="flex items-center justify-between pt-6 border-t mt-8">
            <Button 
              variant="outline" 
              onClick={() => {
                if (!orderData?.production_params_approved) {
                  toast.error('Please approve production parameters before continuing');
                  return;
                }
                markStageComplete(currentStage);
                setCurrentStage('waiting-sample');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={!orderData?.production_params_approved}
              className="gap-2"
            >
              Skip Payment
            </Button>

            <Button 
              onClick={() => {
                if (!orderData?.production_params_approved) {
                  toast.error('Please approve production parameters before continuing');
                  return;
                }
                markStageComplete(currentStage);
                setCurrentStage('payment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={!orderData?.production_params_approved}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              Continue to Payment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <FactoryDocuments />
        </div>
      </div>
      )}
    </div>
  );
};

export default ProductionStage;
