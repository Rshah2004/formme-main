import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TechPackFeasibilityStageProps {
  design: any;
}

const TechPackFeasibilityStage = ({ design }: TechPackFeasibilityStageProps) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // Manufacturer assigned but hasn't responded yet
  if (order.tech_pack_feasible === null) {
    return (
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
            Review in Progress
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
    );
  }

  // Manufacturer approved
  if (order.tech_pack_feasible === true) {
    return (
      <Card className="border-border border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            Tech Pack Approved
          </CardTitle>
          <CardDescription className="text-green-600">
            The manufacturer has confirmed your tech pack is feasible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-green-100/50 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-700">Approved by {order.manufacturer?.name || 'Manufacturer'}</span>
            </div>
            {order.tech_pack_feasibility_confirmed_at && (
              <p className="text-sm text-green-600">
                Confirmed on {new Date(order.tech_pack_feasibility_confirmed_at).toLocaleDateString()}
              </p>
            )}
            {order.tech_pack_feasibility_notes && (
              <div className="mt-3 p-3 bg-white/50 rounded border border-green-200">
                <p className="text-sm text-green-700">{order.tech_pack_feasibility_notes}</p>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            You can now proceed to the Production phase to review production parameters.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Manufacturer requested changes
  return (
    <Card className="border-border border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <XCircle className="w-5 h-5" />
          Changes Requested
        </CardTitle>
        <CardDescription className="text-amber-600">
          The manufacturer needs modifications to your tech pack
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-amber-100/50 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-amber-700">Feedback from {order.manufacturer?.name || 'Manufacturer'}</span>
          </div>
          {order.tech_pack_feasibility_notes && (
            <div className="mt-3 p-3 bg-white/50 rounded border border-amber-200">
              <p className="text-sm text-amber-700">{order.tech_pack_feasibility_notes}</p>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Please review the feedback and update your tech pack accordingly. 
          Return to the Overview tab to make changes.
        </p>
      </CardContent>
    </Card>
  );
};

export default TechPackFeasibilityStage;