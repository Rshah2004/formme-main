import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {CreditCard, Loader2, ArrowLeft, ArrowRight, AlertCircle} from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { useSearchParams } from 'react-router-dom';
import { StageHeader } from './StageHeader';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { paymentApi } from '@/lib/api';

interface PaymentStageProps {
  design: Design;
}

interface PricingData {
  unitCost: number;
  shipping: number;
  taxes: number;
  quantity: number;
  subtotal: number;
  total: number;
}

const PaymentStage = ({ design }: PaymentStageProps) => {
  const { workflowData } = useWorkflow();
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const { currentStage, setCurrentStage, markStageComplete } = useWorkflow();
  const [searchParams, setSearchParams] = useSearchParams();
  const verifyRef = useRef(false);


  useEffect(() => {
    fetchOrderDetails();
  }, [design.id]);

  const fetchOrderDetails = async () => {
    setPricingLoading(true);
    try {
      // Fetch order with production_timeline_data which contains pricing
      const { data: order } = await supabase
        .from('orders')
        .select('*, manufacturers(name)')
        .eq('design_id', design.id)
        .not('manufacturer_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setOrderDetails(order);

      if (order) {
        // Parse pricing from production_timeline_data
        const timelineData = order.production_timeline_data 
          ? (typeof order.production_timeline_data === 'string' 
              ? JSON.parse(order.production_timeline_data) 
              : order.production_timeline_data)
          : null;

        const quantity = order.quantity || parseInt(workflowData.quantity) || 100;
        const unitCost = timelineData?.unit_cost || order.price || 0;
        const shipping = timelineData?.shipping_cost || 0;
        const taxes = timelineData?.taxes_and_fees || 0;
        const subtotal = unitCost * quantity;
        const total = subtotal + shipping + taxes;
        setPricing({
          unitCost,
          shipping,
          taxes,
          quantity,
          subtotal,
          total
        });
      }
    } catch (error) {
      console.error('[PaymentStage] Error fetching order:', error);
    } finally {
      setPricingLoading(false);
    }
  };

  const orderId = orderDetails?.id;
  const sessionId = searchParams.get('session_id');
  const sessionOrderId = searchParams.get('order_id');

  useEffect(() => {
    if (!sessionId || !sessionOrderId || verifyRef.current) return;
    verifyRef.current = true;

    (async () => {
      try {
        const result = await paymentApi.verifyPayment(sessionId, sessionOrderId);
        if (result?.paid) {
          toast.success('Payment confirmed.');
          await fetchOrderDetails();
        } else {
          toast.error('Payment not confirmed yet. Please try again in a moment.');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to verify payment');
      } finally {
        // Clean query params after verification attempt
        const next = new URLSearchParams(searchParams);
        next.delete('session_id');
        next.delete('order_id');
        setSearchParams(next, { replace: true });
      }
    })();
  }, [sessionId, sessionOrderId, searchParams, setSearchParams]);

  const handleBack = () => {
    // setCurrentStage('tech-pack');
  };

  const handleContinue = () => {
    if (!paid) {
      toast.error('Please complete payment before sampling begins.');
      return;
    }
    markStageComplete('payment');
    setCurrentStage('waiting-sample');
  };

  const handlePayment = async () => {
    if (!pricing || pricing.total === 0) {
      toast.error('Pricing not yet set by manufacturer. Please wait for the manufacturer to confirm pricing.');
      return;
    }

    try {
      setLoading(true);
      
      console.log('[PaymentStage] Initiating checkout for design:', design.id);
      
      const successUrl = `${window.location.origin}/workflow?designId=${design.id}&stage=payment&session_id={CHECKOUT_SESSION_ID}&order_id=${orderId || ''}`;
      const result = await paymentApi.createCheckout({
        design_id: design.id,
        success_url: successUrl,
        cancel_url: `${window.location.origin}/workflow?designId=${design.id}&stage=payment`,
      });

      console.log('[PaymentStage] Checkout response:', result);

      if (result?.url) {
        console.log('[PaymentStage] Opening Stripe checkout:', result.url);
        window.open(result.url, '_blank');
        toast.success('Redirecting to payment...');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('[PaymentStage] Payment error:', error);
      toast.error(error?.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasPricing = pricing && pricing.unitCost > 0;
  const paymentInfo = orderDetails?.production_timeline_data
    ? (typeof orderDetails.production_timeline_data === 'string'
        ? JSON.parse(orderDetails.production_timeline_data)
        : orderDetails.production_timeline_data)
    : null;
  const paid = paymentInfo?.payment?.paid === true;
  const factoryName =
    orderDetails?.manufacturers?.name ||
    workflowData.selectedFactory?.name ||
    'Not selected';

  return (
    <div>
      <StageHeader
        icon={CreditCard}
        title="Make payment"
        description="Complete payment to begin sampling and start production."
        contextInfo={[
          { label: 'Factory', value: factoryName },
          { label: 'Quantity', value: (pricing?.quantity || orderDetails?.quantity || 100).toString() },
          { label: 'Delivery Date', value: workflowData.deliveryDate || 'Not set' }
        ]}
      />

      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Complete payment to start sampling. If you face any issues, contact us at{' '}
                  <span className="font-medium text-foreground">formme.design@gmail.com</span>{' '}
                  or fill the <Link to="/support" className="font-medium text-foreground underline underline-offset-4">support form</Link>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Cost Breakdown</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              {pricingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading pricing...</span>
                </div>
              ) : !hasPricing ? (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      Pricing Not Yet Available
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      The manufacturer has not yet set the pricing for this order. Please wait for them to confirm production feasibility with pricing details.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unit Cost</span>
                    <span className="font-medium">${pricing.unitCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity × {pricing.quantity}</span>
                    <span className="font-medium">${pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping & Handling</span>
                    <span className="font-medium">${pricing.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span className="font-medium">${pricing.taxes.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-border my-3"/>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-primary">${pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Payment Method */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Payment Method</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Payment processing will be handled securely. You'll be redirected to complete your payment.
                </p>
                <Button
                    onClick={handlePayment}
                    className="w-full gap-2"
                    size="lg"
                    disabled={loading || !hasPricing || paid}
                >
                  {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin"/>
                        Processing...
                      </>
                  ) : (
                      <>
                        <CreditCard className="w-4 h-4"/>
                        {paid ? 'Payment Received' : 'Pay Now'}
                      </>
                  )}
                </Button>
                {paid && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                    Payment received. Thank you.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4"/>
            Back to Tech Pack
          </Button>
          <Button onClick={handleContinue} className="gap-2" disabled={!paid}>
            Continue to sample review
            <ArrowRight className="w-4 h-4"/>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default PaymentStage;
