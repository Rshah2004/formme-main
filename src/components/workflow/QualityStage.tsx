import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkflow } from '@/context/WorkflowContext';

interface QualityStageProps {
  design: any;
}

const QualityStage = ({ design }: QualityStageProps) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentStage } = useWorkflow();

  useEffect(() => {
    fetchOrder();
  }, [design.id]);

  useEffect(() => {
    if (!order?.id) return;
    
    // Real-time subscription for QC updates
    const channel = supabase
      .channel('qc-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `design_id=eq.${design.id}`
        },
        (payload) => {
          setOrder((prev: any) => prev ? { ...prev, ...payload.new } : payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id, design.id]);

  const fetchOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch the order in quality check or later status
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('design_id', design.id)
        .eq('designer_id', user.id)
        .not('manufacturer_id', 'is', null)
        .in('status', ['quality_check', 'shipping', 'delivered'])
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load quality check data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!order?.id) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          qc_approved: true,
          status: 'shipping' as any
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Quality check approved! Moving to shipping.');
      setCurrentStage('shipping', true);
    } catch (error) {
      console.error('Error approving QC:', error);
      toast.error('Failed to approve quality check');
    }
  };

  const handleReject = async () => {
    if (!order?.id) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ qc_approved: false })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Quality check rejected - manufacturer notified');
      fetchOrder();
    } catch (error) {
      console.error('Error rejecting QC:', error);
      toast.error('Failed to reject quality check');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <StageHeader 
        icon={CheckCircle} 
        title="Quality Check" 
        description="Review factory quality control assessment and approve or reject based on your standards." 
      />
      <div className="space-y-6">
        {!order?.qc_submitted_at && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Waiting for Manufacturer QC Submission</p>
                  <p className="text-sm text-muted-foreground">
                    The manufacturer is conducting quality checks and will upload results soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {order?.qc_submitted_at && (
          <>
            {order.qc_approved === true && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-primary">Quality Check Approved</p>
                      <p className="text-sm text-muted-foreground">
                        Order has moved to shipping stage
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {order.qc_approved === false && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="font-medium text-destructive">Quality Check Rejected</p>
                      <p className="text-sm text-muted-foreground">
                        Manufacturer has been notified to resubmit
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">QC Photos by Size</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { size: 'S', url: order.qc_photos_s },
                      { size: 'M', url: order.qc_photos_m },
                      { size: 'L', url: order.qc_photos_l },
                      { size: 'XL', url: order.qc_photos_xl }
                    ].map(({ size, url }) => (
                      <div key={size}>
                        <Label>Size {size}</Label>
                        {url ? (
                          <div className="mt-2 rounded-lg overflow-hidden border">
                            <img src={url} alt={`QC Photo Size ${size}`} className="w-full h-48 object-cover" />
                          </div>
                        ) : (
                          <div className="mt-2 rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
                            No photo uploaded
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {order.qc_notes && (
                  <div>
                    <Label>QC Notes & Defect Counts</Label>
                    <Card className="mt-2 bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm">{order.qc_notes}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div>
                  <Label>Overall QC Result</Label>
                  <Card className="mt-2">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        {order.qc_result === 'passed' ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-primary" />
                            <span className="font-medium text-primary">Passed</span>
                          </>
                        ) : order.qc_result ? (
                          <>
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <span className="font-medium text-amber-500">Needs Fixes</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Pending result</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {order.qc_approved === null && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleApprove} className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Quality Check
                    </Button>
                    <Button onClick={handleReject} variant="outline" className="flex-1">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Reject & Request Fixes
                    </Button>
                  </div>
                )}

                {order.qc_approved === true && (
                  <div className="pt-4">
                    <Button onClick={() => setCurrentStage('shipping', true)} className="w-full">
                      Continue to Delivery
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <StageNavigation 
          onNext={() => order?.qc_approved === true} 
          nextLabel="Continue to Delivery" 
          showBack={true}
          disabled={!order?.qc_submitted_at}
          disabledMessage="Waiting for manufacturer to submit quality check photos"
        />
      </div>
    </div>
  );
};

export default QualityStage;
