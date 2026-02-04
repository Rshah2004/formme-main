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
      <StageHeader icon={Truck} title="Shipping & Logistics" description="Track your shipment and access shipping documents." />
      
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
              <h3 className="text-sm font-semibold text-foreground mb-3">Shipping Details</h3>
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {order?.shipping_terms && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Shipping Terms</p>
                        <p className="text-sm font-medium uppercase">{order.shipping_terms}</p>
                      </div>
                    )}
                    {order?.shipping_carton_count && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Carton Count</p>
                        <p className="text-sm font-medium">{order.shipping_carton_count} cartons</p>
                      </div>
                    )}
                    {order?.shipping_tracking_number && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tracking Number</p>
                        <p className="text-sm font-medium font-mono">{order.shipping_tracking_number}</p>
                      </div>
                    )}
                    {order?.shipping_notes && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm">{order.shipping_notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Shipment Progress */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Shipment Status</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      {shipmentStages.map((stage, idx) => {
                        const Icon = stage.icon;
                        const isComplete = idx <= currentStageIndex;
                        const isCurrent = idx === currentStageIndex;
                        
                        return (
                          <div key={stage.key} className="flex flex-col items-center relative flex-1">
                            {idx < shipmentStages.length - 1 && (
                              <div 
                                className={`absolute left-1/2 top-5 h-0.5 w-full ${
                                  isComplete ? 'bg-primary' : 'bg-border'
                                }`}
                              />
                            )}
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 ${
                                isComplete 
                                  ? 'bg-primary border-primary' 
                                  : 'bg-background border-border'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isComplete ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                            </div>
                            <p className={`text-xs mt-2 text-center max-w-[80px] ${
                              isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'
                            }`}>
                              {stage.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="bg-muted/50 rounded-lg p-4 mt-6">
                    <p className="text-sm font-medium mb-1">Latest Update</p>
                    <p className="text-sm text-muted-foreground">
                      {!isShippingConfirmed 
                        ? 'Waiting for manufacturer to confirm shipping details.'
                        : isDelivered 
                          ? 'Your order has been delivered!'
                          : `Your order is currently ${shipmentStages[currentStageIndex]?.label?.toLowerCase() || 'being processed'}.`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Invoices & Documents - Only show when shipping is confirmed */}
          {isShippingConfirmed && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Shipping Documents</h3>
              <Tabs defaultValue="invoices" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="customs">Customs</TabsTrigger>
                </TabsList>
                <TabsContent value="invoices">
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {mockInvoices.map((invoice, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">{invoice.name}</p>
                              <p className="text-xs text-muted-foreground">{invoice.date}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="gap-2">
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="customs">
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No customs documents available yet
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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