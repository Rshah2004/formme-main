import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Clock, CheckCircle, XCircle, MessageSquare, AlertTriangle, Edit, RefreshCw, Lock, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkflow } from "@/context/WorkflowContext.tsx";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useContractStatus } from '@/hooks/useContractStatus';

interface TechPackFeasibilityStageProps {
  design: any;
}

const TechPackFeasibilityStage = ({ design }: TechPackFeasibilityStageProps) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resubmitting, setResubmitting] = useState(false);
  const { currentStage, setCurrentStage, markStageComplete } = useWorkflow();
  const navigate = useNavigate();
  const { isContractFinalized } = useContractStatus(design?.id ?? null);

  console.log('what is design id', design.id);
  useEffect(() => {
    const fetchOrder = async () => {
      if (!design?.id) return;
      
      try {
        const { data } = await supabase
          .from('orders')
          .select('*, manufacturer:manufacturers(*)')
          .eq('design_id', design.id)
          .maybeSingle();
        
        setOrder(data);
        console.log('what is the order', data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    // Subscribe to order updates
    const channel = supabase
      .channel('tech-pack-feasibility')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.new.design_id === design.id) {
            setOrder(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [design?.id]);

  const handleProceed = () => {
    markStageComplete('tech-pack-feasibility');
    setCurrentStage('production');
  }

  const handleEditTechPack = () => {
    // Navigate back to tech pack editing
    navigate({
      pathname: '/workflow',
      search: `?designId=${design.id}&stage=tech-pack`
    });
  };

  const handleResubmit = async () => {
    if (!order?.id) return;
    
    setResubmitting(true);
    try {
      // Reset feasibility status to null (under review) without wiping notes history
      // The notes are preserved for context
      const { error } = await supabase
        .from('orders')
        .update({ 
          tech_pack_feasible: null,
          // Don't reset tech_pack_feasibility_notes - preserve history
          // Don't reset tech_pack_feasibility_confirmed_at - will be updated on new confirmation
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Tech pack resubmitted for review. The manufacturer will be notified.');
      
      // Refresh order data
      const { data } = await supabase
        .from('orders')
        .select('*, manufacturer:manufacturers(*)')
        .eq('id', order.id)
        .single();
      
      setOrder(data);
    } catch (error: any) {
      console.error('Error resubmitting tech pack:', error);
      toast.error('Failed to resubmit tech pack');
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  // No order or manufacturer not assigned yet
  if (!order || !order.manufacturer_id) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Tech Pack Feasibility
          </CardTitle>
          <CardDescription>
            Waiting for manufacturer selection
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No manufacturer selected yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please go to "Finding Manufacturers" to select a manufacturer first. 
            Once selected, they will review your tech pack for feasibility.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Manufacturer assigned but hasn't responded yet (tech_pack_feasible is null)
  if (order.tech_pack_feasible === null) {
    return (
      <div className="space-y-6">
        {/* Info banner about process */}
        <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">What happens next?</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
            The manufacturer is reviewing your tech pack specifications. Once they confirm feasibility and production capacity, 
            you can finalize the production agreement. Production steps are locked until this review is complete.
          </AlertDescription>
        </Alert>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              Awaiting Manufacturer Response
            </CardTitle>
            <CardDescription>
              The manufacturer is reviewing your tech pack
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Feasibility Review in Progress
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              {order.manufacturer?.name || 'The manufacturer'} is currently reviewing your tech pack 
              to confirm production feasibility. You'll be notified once they respond.
            </p>
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              Pending Review
            </Badge>
          </CardContent>
        </Card>

        {/* Locked production steps indicator */}
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Lock className="w-5 h-5" />
              <div>
                <p className="font-medium">Production steps are locked</p>
                <p className="text-sm">Payment, Sample Review, Quality Check, and Shipping will unlock after feasibility confirmation.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Manufacturer approved (both tech pack and production params)
  if (order.tech_pack_feasible === true && order.production_params_approved === true) {
    return (
      <div className="space-y-6">
        <Card className="border-border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              Feasibility Confirmed
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-300">
              The manufacturer has confirmed your tech pack is feasible and production can proceed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Feasibility Summary */}
            <div className="grid grid-cols-2 gap-4">
              {order.lead_time_days && (
                <div className="p-3 rounded-lg bg-green-100/50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">Lead Time</p>
                  <p className="font-semibold text-green-700 dark:text-green-300">{order.lead_time_days} days</p>
                </div>
              )}
              {order.quantity && (
                <div className="p-3 rounded-lg bg-green-100/50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">Quantity</p>
                  <p className="font-semibold text-green-700 dark:text-green-300">{order.quantity} units</p>
                </div>
              )}
            </div>
            
            <div className="p-4 rounded-lg bg-green-100/50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-700 dark:text-green-300">Approved by {order.manufacturer?.name || 'Manufacturer'}</span>
              </div>
              {order.tech_pack_feasibility_confirmed_at && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Confirmed on {new Date(order.tech_pack_feasibility_confirmed_at).toLocaleDateString()}
                </p>
              )}
              {order.tech_pack_feasibility_notes && (
                <div className="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">{order.tech_pack_feasibility_notes}</p>
                </div>
              )}
            </div>
            {isContractFinalized ? (
              <p className="text-sm text-muted-foreground">
                The production agreement is already finalized.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  You can now finalize the production agreement and continue to payment.
                </p>
                <Button onClick={handleProceed} className="gap-2 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4" />
                  Finalize Production Agreement
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tech pack approved but waiting for production params
  if (order.tech_pack_feasible === true && !order.production_params_approved) {
    return (
      <div className="space-y-6">
        <Card className="border-border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Clock className="w-5 h-5" />
              Tech Pack Approved - Awaiting Production Confirmation
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-300">
              The manufacturer has approved your tech pack and is now confirming production capacity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-100/50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Tech Pack: Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Production Capacity: Pending Confirmation</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The manufacturer is confirming lead time, capacity, and production details. 
              You'll be able to finalize the agreement once they complete this step.
            </p>
          </CardContent>
        </Card>

        {/* Locked production steps indicator */}
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Lock className="w-5 h-5" />
              <div>
                <p className="font-medium">Production steps are still locked</p>
                <p className="text-sm">Waiting for manufacturer to confirm production capacity and details.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Manufacturer requested changes (tech_pack_feasible === false)
  return (
    <div className="space-y-6">
      {/* Warning alert about issues */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Action Required</AlertTitle>
        <AlertDescription>
          The manufacturer has reported issues with your tech pack. Please review the feedback, 
          make the necessary changes, and resubmit for review.
        </AlertDescription>
      </Alert>

      <Card className="border-border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <XCircle className="w-5 h-5" />
            Changes Requested
          </CardTitle>
          <CardDescription className="text-amber-600 dark:text-amber-300">
            The manufacturer needs modifications to your tech pack before confirming feasibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-amber-100/50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="font-medium text-amber-700 dark:text-amber-300">Feedback from {order.manufacturer?.name || 'Manufacturer'}</span>
            </div>
            {order.tech_pack_feasibility_notes && (
              <div className="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300 whitespace-pre-wrap">{order.tech_pack_feasibility_notes}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={handleEditTechPack}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Tech Pack
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

          <p className="text-sm text-muted-foreground">
            After making changes to your tech pack, click "Resubmit for Review" to send the updated specifications 
            to the manufacturer. Your previous conversation history will be preserved.
          </p>
        </CardContent>
      </Card>

      {/* Locked production steps indicator */}
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Lock className="w-5 h-5" />
            <div>
              <p className="font-medium">Production steps are locked</p>
              <p className="text-sm">Resolve the reported issues and get feasibility confirmation to unlock production steps.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechPackFeasibilityStage;
