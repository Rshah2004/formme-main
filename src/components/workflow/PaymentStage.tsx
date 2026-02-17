import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {CreditCard, Loader2, ArrowLeft, ArrowRight, AlertCircle} from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
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
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const { setCurrentStage, markStageComplete } = useWorkflow();
  const [uploading, setUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);


  useEffect(() => {
    fetchOrderDetails();
  }, [design.id]);

  useEffect(() => {
    const channel = supabase
      .channel(`payment-status-${design.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `design_id=eq.${design.id}` },
        () => {
          fetchOrderDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
  const handleBack = () => {
    // setCurrentStage('tech-pack');
  };

  const handleContinue = () => {
    if (paymentStatus !== 'approved') {
      toast.error('Payment must be approved before sampling begins.');
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
      if (!proofFile) {
        toast.error('Please upload your Interac payment screenshot.');
        return;
      }
      if (!orderId) {
        toast.error('Order not found. Please refresh.');
        return;
      }

      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to upload payment proof.');
        setUploading(false);
        return;
      }

      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowed.includes(proofFile.type)) {
        toast.error('Please upload a PNG, JPG, or PDF file.');
        setUploading(false);
        return;
      }

      const ext = proofFile.name.split('.').pop() || 'png';
      const filePath = `${user.id}/payment-proofs/${orderId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(filePath, proofFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(filePath);

      await paymentApi.submitPaymentProof({
        order_id: orderId,
        proof_url: publicUrl,
      });

      toast.success('Payment proof submitted. We will review it shortly.');
      setProofFile(null);
      await fetchOrderDetails();
    } catch (error: any) {
      console.error('[PaymentStage] Payment proof error:', error);
      toast.error(error?.message || 'Failed to submit payment proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const hasPricing = pricing && pricing.unitCost > 0;
  const paymentInfo = orderDetails?.production_timeline_data
    ? (typeof orderDetails.production_timeline_data === 'string'
        ? JSON.parse(orderDetails.production_timeline_data)
        : orderDetails.production_timeline_data)
    : null;
  const paymentStatus = paymentInfo?.payment?.status || (paymentInfo?.payment?.paid ? 'approved' : null);
  const paid = paymentStatus === 'approved';
  const paymentProofUrl = paymentInfo?.payment?.proof_url || null;
  const factoryName =
    orderDetails?.manufacturers?.name ||
    workflowData.selectedFactory?.name ||
    'Not selected';

  return (
    <div>
      <StageHeader
        icon={CreditCard}
        title="Make payment"
        description="Send an Interac transfer and upload proof to begin sampling."
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
                  Send your Interac transfer to{' '}
                  <span className="font-medium text-foreground">royd4405aoi@gmail.com</span> and upload the screenshot below.
                  If you face any issues, contact us at{' '}
                  <span className="font-medium text-foreground">formme.design@gmail.com</span>{' '}
                  or fill the <Link to="/support" className="font-medium text-foreground underline underline-offset-4">support form</Link>.
                </p>
                {pricing?.total ? (
                  <p className="text-sm text-foreground">
                    Amount due: <span className="font-semibold">${pricing.total.toFixed(2)}</span>
                  </p>
                ) : null}
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
                  Upload your Interac transfer screenshot (PNG/JPG/PDF). Our team will review and approve it.
                </p>
                {paymentStatus === 'pending' && (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                    Payment proof submitted. Awaiting approval.
                  </div>
                )}
                {paymentStatus === 'rejected' && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                    Payment proof rejected. Please upload a new screenshot.
                  </div>
                )}
                {paid && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                    Payment approved. You can continue to sample review.
                  </div>
                )}
                {paymentProofUrl && (
                  <a
                    href={paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline"
                  >
                    View uploaded proof
                  </a>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="text-sm"
                  disabled={uploading || paid || paymentStatus === 'pending'}
                />
                <Button
                    onClick={handlePayment}
                    className="w-full gap-2"
                    size="lg"
                    disabled={uploading || !hasPricing || paid || paymentStatus === 'pending'}
                >
                  {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin"/>
                        Processing...
                      </>
                  ) : (
                      <>
                        <CreditCard className="w-4 h-4"/>
                        {paid ? 'Payment Received' : 'Submit Proof'}
                      </>
                  )}
                </Button>
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
