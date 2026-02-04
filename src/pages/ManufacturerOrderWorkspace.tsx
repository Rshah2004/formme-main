import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import NavBar from '@/components/Navbar';
import { MessageSquare, FileDown, Upload, CheckCircle, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { ManufacturerStepper } from '@/components/workflow/ManufacturerStepper';
import { FactoryMessaging } from '@/components/workflow/FactoryMessaging';
import { FloatingMessagesWidget } from '@/components/workflow/FloatingMessagesWidget';
import { ManufacturerMessaging } from '@/components/manufacturer/ManufacturerMessaging';
import { ManufacturerReviewFeasibility } from '@/components/manufacturer/ManufacturerReviewFeasibility';
import { AcceptOrderStage } from '@/components/manufacturer/AcceptOrderStage';
import { ShippingLogisticsStage } from '@/components/manufacturer/ShippingLogisticsStage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ManufacturerOrderWorkspace = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('accept-order');
  
  const handleTabChange = (newTab: string) => {
    // Check if trying to access stages beyond accept-order without acceptance
    if (newTab !== 'accept-order' && matchStatus !== 'accepted' && 
        order?.status !== 'production_approval' && 
        order?.status !== 'sample_development' &&
        order?.status !== 'quality_check' &&
        order?.status !== 'shipping' &&
        order?.status !== 'delivered') {
      toast.error('Please accept the order first to access this stage');
      return;
    }
    
    // Check if trying to access Sample Development without production params approval
    if (newTab === 'sample' && order?.production_params_approved !== true) {
      toast.error('You cannot access Sample Development until the designer approves your production parameters');
      return;
    }
    
    // Check if trying to access Production without sample approval
    if (newTab === 'production' && order?.sample_approved !== true) {
      toast.error('You cannot access Production until the designer approves your sample');
      return;
    }
    
    // Check if trying to access Quality Check without production completion
    if (newTab === 'quality' && order?.sample_approved !== true) {
      toast.error('You cannot access Quality Check until sample is approved');
      return;
    }
    
    // Check if trying to access Shipping without QC approval
    if (newTab === 'shipping' && order?.qc_approved !== true) {
      toast.error('You cannot access Shipping & Logistics until the designer approves your quality check');
      return;
    }
    
    setActiveTab(newTab);
  };
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matchStatus, setMatchStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [productionStartDate, setProductionStartDate] = useState('');
  const [productionCompletionDate, setProductionCompletionDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fabricType, setFabricType] = useState('');
  const [gsm, setGsm] = useState('');
  const [shrinkage, setShrinkage] = useState('');
  const [colorFastness, setColorFastness] = useState('');
  const [samplePhotos, setSamplePhotos] = useState<FileList | null>(null);
  const [sampleNotes, setSampleNotes] = useState('');
  const [productionPhotos, setProductionPhotos] = useState<FileList | null>(null);
  const [qcPhotosS, setQcPhotosS] = useState<string>('');
  const [qcPhotosM, setQcPhotosM] = useState<string>('');
  const [qcPhotosL, setQcPhotosL] = useState<string>('');
  const [qcPhotosXL, setQcPhotosXL] = useState<string>('');
  const [qcNotes, setQcNotes] = useState('');
  const [qcResult, setQcResult] = useState<string>('');

  useEffect(() => {
  const fetchOrder = async () => {
      if (!id) return;
      
      try {
        // Fetch order with design and design specs
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*, tech_pack_feasible, tech_pack_feasibility_confirmed_at, tech_pack_checklist')
          .eq('id', id)
          .single();

        if (orderError) throw orderError;

        // Fetch design details with URLs
        const { data: designData, error: designError } = await supabase
          .from('designs')
          .select('id, name, category, user_id, design_file_url, tech_pack_url, thumbnail_url')
          .eq('id', orderData.design_id)
          .maybeSingle();

        if (designError) console.error('Design error:', designError);

        // Fetch design specs
        const { data: specsData } = await supabase
          .from('design_specs')
          .select('*')
          .eq('design_id', orderData.design_id)
          .maybeSingle();

        // Fetch techpack if exists
        const { data: techpackData } = await supabase
          .from('techpacks')
          .select('id, pdf_url, version, created_at')
          .eq('design_id', orderData.design_id)
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Fetch designer profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, company_name')
          .eq('user_id', orderData.designer_id)
          .maybeSingle();

        // Fetch match status
        const { data: matchData } = await supabase
          .from('manufacturer_matches')
          .select('status')
          .eq('design_id', orderData.design_id)
          .eq('manufacturer_id', orderData.manufacturer_id)
          .maybeSingle();

        const matchStatusValue = (matchData?.status as 'pending' | 'accepted' | 'rejected') || null;
        setMatchStatus(matchStatusValue);

        setOrder({
          ...orderData,
          designs: designData,
          design_specs: specsData,
          techpack: techpackData,
          profiles: profile 
            ? { full_name: profile.full_name || profile.company_name || 'Unknown' }
            : { full_name: 'Unknown' },
          match_status: matchStatusValue
        });

        // Auto-navigate based on status
        const isOrderAccepted = matchStatusValue === 'accepted' || 
          orderData.status === 'production_approval' || 
          orderData.status === 'sample_development' ||
          orderData.status === 'quality_check' ||
          orderData.status === 'shipping' ||
          orderData.status === 'delivered';

        if (isOrderAccepted) {
          // Navigate to the correct stage based on order status
          if (orderData.status === 'shipping' || orderData.status === 'delivered') {
            setActiveTab('shipping');
          } else if (orderData.status === 'quality_check') {
            // If QC is approved, go to shipping
            if (orderData.qc_approved === true) {
              setActiveTab('shipping');
            } else {
              setActiveTab('quality');
            }
          } else if (orderData.sample_approved === true) {
            const productionData = orderData.production_timeline_data as Record<string, any> | null;
            if (productionData?.production_completed === true) {
              setActiveTab('quality');
            } else {
              setActiveTab('production');
            }
          } else if (orderData.production_params_approved === true) {
            setActiveTab('sample');
          } else if (orderData.tech_pack_feasible === true) {
            setActiveTab('review-feasibility');
          } else {
            setActiveTab('review-feasibility');
          }
        } else {
          // Not yet accepted, stay on accept-order
          setActiveTab('accept-order');
        }

        // Set timeline dates if they exist
        if (orderData.production_start_date) {
          setProductionStartDate(orderData.production_start_date);
        }
        if (orderData.production_completion_date) {
          setProductionCompletionDate(orderData.production_completion_date);
        }
        // Set fabric specs if they exist
        if (orderData.fabric_type) setFabricType(orderData.fabric_type);
        if (orderData.gsm) setGsm(orderData.gsm);
        if (orderData.shrinkage) setShrinkage(orderData.shrinkage);
        if (orderData.color_fastness) setColorFastness(orderData.color_fastness);

        setMatchStatus((matchData?.status as 'pending' | 'accepted' | 'rejected') || null);
      } catch (err: any) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Real-time subscription for production approval updates
    const channel = supabase
      .channel('order-approval-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`
        },
        (payload) => {
          const previousOrder = order;
          setOrder((prev: any) => prev ? { ...prev, ...payload.new } : payload.new);
          
          // Show toast when designer resubmits tech pack for review
          if (payload.new.tech_pack_feasible === null && previousOrder?.tech_pack_feasible === false) {
            toast.info('Designer has resubmitted the tech pack for review. Please check the updated specifications.', {
              duration: 6000,
            });
            // Navigate to review tab
            setActiveTab('review-feasibility');
          }
          
          // Show toast when designer approves production parameters
          if (payload.new.production_params_approved === true && !previousOrder?.production_params_approved) {
            toast.success('Designer approved your production parameters! You can now proceed to Sample Development.');
          }
          
          // Show toast when designer approves sample
          if (payload.new.sample_approved === true && !previousOrder?.sample_approved) {
            toast.success('Designer has approved the sample! You can now proceed to Quality Check.');
          }
          
          // Show toast when designer approves QC
          if (payload.new.qc_approved === true && !previousOrder?.qc_approved) {
            toast.success('Designer has approved the quality check! You can now proceed to Shipping.');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleAcceptMatch = async () => {
    if (!order || !order.manufacturer_id) return;
    
    setAccepting(true);
    try {
      // Update manufacturer match status only
      const { error: matchError } = await supabase
        .from('manufacturer_matches')
        .update({ status: 'accepted' })
        .eq('design_id', order.design_id)
        .eq('manufacturer_id', order.manufacturer_id);

      if (matchError) throw matchError;

      // Don't update order status here - wait for designer to finalize contract

      setMatchStatus('accepted');
      toast.success('You agreed to review the tech pack. The designer will be notified.');
    } catch (error: any) {
      console.error('Error accepting match:', error);
      toast.error('Failed to respond. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleSubmitProductionApproval = async () => {
    if (!order?.id) return;
    
    if (!productionStartDate || !productionCompletionDate) {
      toast.error('Please provide both start and completion dates');
      return;
    }

    if (!fabricType || !gsm) {
      toast.error('Please provide fabric type and GSM');
      return;
    }
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          production_start_date: productionStartDate,
          production_completion_date: productionCompletionDate,
          fabric_type: fabricType,
          gsm: gsm,
          shrinkage: shrinkage || null,
          color_fastness: colorFastness || null,
          production_params_submitted_at: new Date().toISOString(),
          status: 'production_approval'
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Production parameters submitted successfully!');
      // Refresh order data
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order.id)
        .single();
      
      if (updatedOrder) {
        setOrder({ ...order, ...updatedOrder });
      }
    } catch (error: any) {
      console.error('Error submitting production approval:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclineMatch = async () => {
    if (!order || !order.manufacturer_id) return;
    
    try {
      const { error } = await supabase
        .from('manufacturer_matches')
        .update({ status: 'rejected' })
        .eq('design_id', order.design_id)
        .eq('manufacturer_id', order.manufacturer_id);

      if (error) throw error;

      setMatchStatus('rejected');
      alert('Match declined.');
    } catch (error: any) {
      console.error('Error declining match:', error);
      alert('Failed to decline match. Please try again.');
    }
  };

  const handleSubmitSampleUpdate = async () => {
    if (!order?.id) return;
    
    setSubmitting(true);
    try {
      // Upload sample photos if any
      let sampleUrls: string[] = [];
      if (samplePhotos && samplePhotos.length > 0) {
        const uploadPromises = Array.from(samplePhotos).map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${order.id}-sample-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${order.designer_id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('design-files')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('design-files')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        sampleUrls = await Promise.all(uploadPromises);
      }

      // Get existing sample URLs from database
      const existingSampleUrls = order.production_timeline_data?.sample_photos || [];
      const allSampleUrls = [...existingSampleUrls, ...sampleUrls];

      const { error } = await supabase
        .from('orders')
        .update({
          production_timeline_data: {
            ...order.production_timeline_data,
            sample_photos: allSampleUrls,
            sample_notes: sampleNotes || order.production_timeline_data?.sample_notes,
            sample_last_updated: new Date().toISOString()
          },
          sample_submitted_at: new Date().toISOString(),
          sample_approved: null, // Reset approval status
          status: 'sample_development'
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Sample update submitted to designer for approval');
      
      // Refresh order data
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order.id)
        .single();
      
      if (updatedOrder) {
        setOrder({ ...order, ...updatedOrder });
        setSamplePhotos(null);
        setSampleNotes('');
      }
    } catch (error: any) {
      console.error('Error submitting sample update:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQCPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, size: string) => {
    const file = e.target.files?.[0];
    if (!file || !order?.id) return;

    setSubmitting(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${order.id}/qc-${size.toLowerCase()}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('design-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(fileName);

      // Update state based on size
      if (size === 'S') setQcPhotosS(publicUrl);
      else if (size === 'M') setQcPhotosM(publicUrl);
      else if (size === 'L') setQcPhotosL(publicUrl);
      else if (size === 'XL') setQcPhotosXL(publicUrl);

      toast.success(`Size ${size} photo uploaded`);
    } catch (error) {
      console.error('Error uploading QC photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQC = async () => {
    if (!order?.id || !qcResult) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          qc_photos_s: qcPhotosS || null,
          qc_photos_m: qcPhotosM || null,
          qc_photos_l: qcPhotosL || null,
          qc_photos_xl: qcPhotosXL || null,
          qc_notes: qcNotes || null,
          qc_result: qcResult,
          qc_submitted_at: new Date().toISOString(),
          qc_approved: null // Reset approval status
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Quality check submitted to designer');
      
      // Refetch order data  
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order.id)
        .single();
      
      if (updatedOrder) {
        setOrder({ ...order, ...updatedOrder });
      }
    } catch (error) {
      console.error('Error submitting QC:', error);
      toast.error('Failed to submit quality check');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 pt-32 pb-12">
          <p className="text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 pt-32 pb-12">
          <p className="text-muted-foreground">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 pt-32 pb-12">
        {/* Back Button */}
        <Link to="/manufacturer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Contract Finalized Banner */}
        {order.status === 'production_approval' && (
          <Card className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 border-2">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Contract Finalized!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    The designer has accepted your production terms and finalized the contract. Payment is being processed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {order.designs?.name || 'Unknown Design'}
              </h1>
              <div className="flex flex-col gap-1">
                <p className="text-muted-foreground">Designer: {order.profiles?.full_name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">
                  Order received: {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {order.status === 'production_approval' ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Contract Finalized
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  On Track
                </Badge>
              )}
              <Badge variant="outline">{order.status?.replace(/_/g, ' ') || 'Pending'}</Badge>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('manufacturer:open-messages', {
                    detail: { orderId: id },
                  })
                );
              }}
            >
              <MessageSquare className="w-4 h-4" />
              Message Designer
            </Button>
          </div>
        </div>

        {/* Pipeline Layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Pipeline Stepper */}
          <div className="col-span-3">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ManufacturerStepper activeStep={activeTab} onStepChange={handleTabChange} orderData={{ ...order, match_status: matchStatus }} />
              </CardContent>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="col-span-9">
            {/* Accept Order Stage */}
            {activeTab === 'accept-order' && (
              <AcceptOrderStage
                order={order}
                matchStatus={matchStatus}
                onAccept={() => {
                  setMatchStatus('accepted');
                  setOrder((prev: any) => ({ ...prev, match_status: 'accepted' }));
                  setActiveTab('review-feasibility');
                }}
                onDecline={() => {
                  setMatchStatus('rejected');
                  setOrder((prev: any) => ({ ...prev, match_status: 'rejected' }));
                }}
              />
            )}

            {/* Merged Review & Feasibility */}
            {activeTab === 'review-feasibility' && (
              <ManufacturerReviewFeasibility
                order={order}
                onTechPackConfirmed={() => {
                  // Update local state
                  setOrder((prev: any) => ({
                    ...prev,
                    tech_pack_checklist: prev.tech_pack_checklist
                  }));
                }}
                onProductionConfirmed={() => {
                  // Update local state
                  setOrder((prev: any) => ({
                    ...prev,
                    tech_pack_feasible: true,
                    tech_pack_feasibility_confirmed_at: new Date().toISOString(),
                    production_params_submitted_at: new Date().toISOString(),
                    status: 'production_approval'
                  }));
                }}
              />
            )}

            {/* Sample Development Content */}
            {activeTab === 'sample' && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {order.production_params_submitted_at && !order.production_params_approved && order.production_params_approved !== false ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Waiting for Designer Approval</p>
                        <p className="text-xs text-blue-700 mt-0.5">
                          Your production parameters have been submitted. Sample development will be available once the designer approves.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : !order.production_params_approved ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <p className="text-sm text-amber-800">
                        Please submit production parameters in the Production Approval stage first.
                      </p>
                    </div>
                  </div>
                ) : order.sample_submitted_at && !order.sample_approved && order.sample_approved !== false ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Waiting for Designer Sample Approval</p>
                        <p className="text-xs text-blue-700 mt-0.5">
                          Sample submitted on {new Date(order.sample_submitted_at).toLocaleDateString()}. Waiting for designer review.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : order.sample_approved === false ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-900">Sample Rejected</p>
                        <p className="text-xs text-red-700 mt-0.5">Please review feedback and resubmit</p>
                      </div>
                    </div>
                  </div>
                ) : order.sample_approved === true ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Sample Approved</p>
                        <p className="text-xs text-green-700 mt-0.5">
                          You can now proceed to Quality Check
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                
                <div className="space-y-3">
                  <Label>Upload Sample Progress Photos</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="sample-photos" 
                      multiple 
                      accept="image/*"
                      onChange={(e) => setSamplePhotos(e.target.files)}
                      disabled={!order.production_params_approved || (order.sample_submitted_at && order.sample_approved !== false)}
                    />
                    <Label 
                      htmlFor="sample-photos" 
                      className={`cursor-pointer ${(!order.production_params_approved || (order.sample_submitted_at && order.sample_approved !== false)) ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <span>Select Files {samplePhotos && samplePhotos.length > 0 && `(${samplePhotos.length})`}</span>
                      </Button>
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Notes / Questions</Label>
                  <Textarea
                    placeholder="Add any notes or questions about the sample..."
                    rows={3}
                    value={sampleNotes}
                    onChange={(e) => setSampleNotes(e.target.value)}
                    disabled={!order.production_params_approved || (order.sample_submitted_at && order.sample_approved !== false)}
                  />
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={handleSubmitSampleUpdate}
                      disabled={submitting || (!samplePhotos && !sampleNotes) || !order.production_params_approved || (order.sample_submitted_at && order.sample_approved !== false)}
                    >
                      {submitting ? 'Submitting...' : order.sample_submitted_at && order.sample_approved !== false ? 'Awaiting Approval' : 'Submit for Approval'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleTabChange('production')}
                      disabled={!order.sample_approved}
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Production Content */}
            {activeTab === 'production' && (
            <Card>
              <CardHeader>
                <CardTitle>Production Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Submit production updates to keep the designer informed about progress.
                </p>

                <div className="space-y-3">
                  <Label>Current Production Phase</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['cutting', 'sewing', 'finishing', 'packing'].map((phase, index) => {
                      const phases = ['cutting', 'sewing', 'finishing', 'packing'];
                      const currentPhaseIndex = phases.indexOf(order?.production_timeline_data?.current_phase || '');
                      const isCompleted = currentPhaseIndex >= 0 && index <= currentPhaseIndex;
                      const isCurrent = order?.production_timeline_data?.current_phase === phase;
                      
                      return (
                        <Button
                          key={phase}
                          variant={isCompleted ? 'default' : 'outline'}
                          className={`capitalize ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                          onClick={async () => {
                            try {
                              // Update order with current phase
                              await supabase
                                .from('orders')
                                .update({
                                  production_timeline_data: {
                                    ...order?.production_timeline_data,
                                    current_phase: phase,
                                    last_updated: new Date().toISOString()
                                  }
                                })
                                .eq('id', order.id);

                              // Create production update
                              await supabase
                                .from('production_updates')
                                .insert({
                                  order_id: order.id,
                                  status: phase,
                                  message: `Production moved to ${phase} phase`
                                });

                              toast.success(`Production phase updated to ${phase}`);
                            } catch (error) {
                              console.error('Error updating phase:', error);
                              toast.error('Failed to update production phase');
                            }
                          }}
                        >
                          {phase}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Upload Production Photos</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;

                      setSubmitting(true);
                      try {
                        const uploadPromises = Array.from(files).map(async (file) => {
                          const fileExt = file.name.split('.').pop();
                          const fileName = `${order.id}/production-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                          const { error: uploadError } = await supabase.storage
                            .from('design-files')
                            .upload(fileName, file);

                          if (uploadError) throw uploadError;

                          const { data: { publicUrl } } = supabase.storage
                            .from('design-files')
                            .getPublicUrl(fileName);

                          return publicUrl;
                        });

                        const urls = await Promise.all(uploadPromises);
                        const existingPhotos = order?.production_timeline_data?.production_photos || [];

                        await supabase
                          .from('orders')
                          .update({
                            production_timeline_data: {
                              ...order?.production_timeline_data,
                              production_photos: [...existingPhotos, ...urls]
                            }
                          })
                          .eq('id', order.id);

                        toast.success('Production photos uploaded');
                      } catch (error) {
                        console.error('Error uploading photos:', error);
                        toast.error('Failed to upload photos');
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Production Notes</Label>
                  <Textarea
                    placeholder="Add any notes about production progress, issues, or updates..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button
                    onClick={async () => {
                      try {
                        await supabase
                          .from('orders')
                          .update({
                            production_timeline_data: {
                              ...order?.production_timeline_data,
                              production_completed: true,
                              completed_at: new Date().toISOString()
                            },
                            status: 'quality_check' as any
                          })
                          .eq('id', order.id);

                        await supabase
                          .from('production_updates')
                          .insert({
                            order_id: order.id,
                            status: 'completed',
                            message: 'Production completed, ready for QC'
                          });

                        toast.success('Production marked as complete');
                        handleTabChange('quality');
                      } catch (error) {
                        console.error('Error:', error);
                        toast.error('Failed to complete production');
                      }
                    }}
                    disabled={submitting}
                  >
                    Mark Production Complete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTabChange('quality')}
                  >
                    Continue to QC
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Quality Check Content */}
            {activeTab === 'quality' && (
            <Card>
              <CardHeader>
                <CardTitle>Quality Check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {order?.qc_submitted_at && !order.qc_approved && order.qc_approved !== false && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Waiting for Designer Approval</p>
                      <p className="text-sm text-muted-foreground">
                        QC submitted on {new Date(order.qc_submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {order?.qc_approved === false && (
                  <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="font-medium text-destructive">QC Rejected</p>
                      <p className="text-sm text-muted-foreground">
                        Please review and resubmit quality check
                      </p>
                    </div>
                  </div>
                )}

                {order?.qc_approved === true && (
                  <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-primary">QC Approved</p>
                      <p className="text-sm text-muted-foreground">
                        Quality check approved by designer
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label>Upload QC Photos (by size)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <div key={size} className="space-y-2">
                        <Label className="text-sm">Size {size}</Label>
                        <div className="space-y-2">
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleQCPhotoUpload(e, size)}
                            disabled={submitting || order?.qc_approved === true}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>QC Notes & Defect Counts</Label>
                  <Textarea
                    placeholder="Document any defects or quality concerns..."
                    rows={4}
                    value={qcNotes}
                    onChange={(e) => setQcNotes(e.target.value)}
                    disabled={order?.qc_approved === true}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Overall QC Result</Label>
                  <div className="flex gap-3">
                    <Button 
                      variant={qcResult === 'passed' ? 'default' : 'outline'} 
                      className="flex-1 gap-2"
                      onClick={() => setQcResult('passed')}
                      disabled={order?.qc_approved === true}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Passed
                    </Button>
                    <Button 
                      variant={qcResult === 'needs_fixes' ? 'default' : 'outline'} 
                      className="flex-1 gap-2"
                      onClick={() => setQcResult('needs_fixes')}
                      disabled={order?.qc_approved === true}
                    >
                      <XCircle className="w-4 h-4" />
                      Needs Fixes
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button 
                    className="flex-1"
                    onClick={handleSubmitQC}
                    disabled={submitting || !qcResult || order?.qc_approved === true}
                  >
                    {submitting ? 'Submitting...' : 'Submit QC to Designer'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleTabChange('shipping')}
                    disabled={!order?.qc_approved}
                  >
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Shipping Content */}
            {activeTab === 'shipping' && (
              <ShippingLogisticsStage
                order={order}
                isSubmitting={submitting}
                onConfirmReadyForShipment={async (shippingData) => {
                  if (!order?.id) return;
                  
                  setSubmitting(true);
                  try {
                    const { error } = await supabase
                      .from('orders')
                      .update({
                        shipping_terms: shippingData.shippingResponsibility,
                        shipping_carton_count: shippingData.cartonCount,
                        shipping_tracking_number: shippingData.trackingNumber || null,
                        shipping_notes: shippingData.notes || null,
                        shipping_confirmed_at: new Date().toISOString(),
                        status: 'shipping'
                      })
                      .eq('id', order.id);

                    if (error) throw error;

                    toast.success('Shipping confirmed! Designer will be notified.');
                    
                    // Refresh order data
                    const { data: updatedOrder } = await supabase
                      .from('orders')
                      .select('*')
                      .eq('id', order.id)
                      .single();
                    
                    if (updatedOrder) {
                      setOrder({ ...order, ...updatedOrder });
                    }
                  } catch (error) {
                    console.error('Error confirming shipping:', error);
                    toast.error('Failed to confirm shipping');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Messages Widget for Manufacturers */}
      <ManufacturerMessaging />
    </div>
  );
};

export default ManufacturerOrderWorkspace;
