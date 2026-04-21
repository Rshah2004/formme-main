import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, CheckCircle, Download, Package, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryDocuments } from './FactoryDocuments';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams } from 'react-router-dom';

interface ShippingStageProps { design: Design; }

const ShippingStage = ({ design }: ShippingStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const designId = searchParams.get('designId') || design?.id;

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      if (!designId) return;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('design_id', designId)
        .not('manufacturer_id', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`order-shipping-${designId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `design_id=eq.${designId}`
        },
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [designId]);

  // Check if manufacturer has confirmed shipping
  const isShippingConfirmed = !!order?.shipping_confirmed_at;
  const isDelivered = order?.status === 'delivered';

  // Determine current shipment status based on order data
  const getCurrentStatus = () => {
    if (isDelivered) return 'delivered';
    if (isShippingConfirmed) return 'shipped';
    return 'pending';
  };

  const currentStatus = getCurrentStatus();

  const shipmentStages = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'dispatched', label: 'Dispatched', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'carrier', label: 'At Carrier Facility', icon: MapPin },
    { key: 'out-for-delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const currentStageIndex = shipmentStages.findIndex(s => s.key === currentStatus);

  const mockInvoices = [
    { name: 'Shipping Invoice', date: 'Nov 20, 2025' },
    { name: 'Customs Document', date: 'Nov 18, 2025' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <StageHeader stageLabel="Step 03 · Production" title="Shipping & Logistics" description="Track your shipment and access shipping documents." />
      
      {/* Waiting for Manufacturer Alert */}
      {!isShippingConfirmed && (
        <Alert className="mb-6 border-amber-200 bg-amber-50/50">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Waiting for Manufacturer</AlertTitle>
          <AlertDescription className="text-amber-700 text-sm">
            The manufacturer has not yet confirmed shipping details. You will be notified when they update the delivery information.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Shipping Details from Manufacturer */}
{isShippingConfirmed && (
  <section>
    <h3 className="text-sm font-semibold text-foreground mb-3">
      Shipping Details
    </h3>

    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Carrier</p>
            <p className="text-sm font-medium">
              {order.shipping_carrier}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Dispatch Date</p>
            <p className="text-sm font-medium">
              {new Date(order.shipped_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Tracking</p>
          <a
            href={order.shipping_tracking_url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline"
          >
            View tracking link
          </a>
        </div>

        {order.shipping_notes && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{order.shipping_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  </section>
)}
          {isShippingConfirmed && (
  <section>
    <h3 className="text-sm font-semibold text-foreground mb-3">
      Package Photos
    </h3>

    <Card>
      <CardContent className="p-6">
        {order.shipping_package_images?.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {order.shipping_package_images.map((url: string) => (
              <img
                key={url}
                src={url}
                className="h-24 w-full object-cover rounded-md border"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
            No package photos provided
          </div>
        )}
      </CardContent>
    </Card>
  </section>
)}

          {/* Confirm Delivery - Only show when shipped */}
          {isShippingConfirmed && (
            <section>
              <Card className="border-border">
                <CardContent className="p-6">
                  <Button 
                    variant={workflowData.deliveryConfirmed ? 'default' : 'outline'} 
                    className="w-full gap-2" 
                    onClick={() => updateWorkflowData({ deliveryConfirmed: !workflowData.deliveryConfirmed })}
                    disabled={!isShippingConfirmed}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {workflowData.deliveryConfirmed ? 'Confirmed ✓' : 'Confirm Delivery'}
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}

          <StageNavigation 
            onNext={() => true} 
            nextLabel="Mark as Complete"
            showBack={true}
            disabled={!isShippingConfirmed}
          />
        </div>
        <div className="space-y-4">
          <FactoryDocuments />
        </div>
      </div>
    </div>
  );
};

export default ShippingStage;