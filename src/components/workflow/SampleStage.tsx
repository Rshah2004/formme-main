import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryDocuments } from './FactoryDocuments';
import { supabase } from '@/integrations/supabase/client';
import { orderApi } from '@/lib/api';
import { toast } from 'sonner';

interface SampleStageProps { design: Design; }

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  approved: boolean;
  rejected: boolean;
  rejectionNote: string;
}

const defaultChecklist: ChecklistItem[] = [
  {
    id: 'colour',
    label: 'Colour accuracy',
    description: 'Colour matches specifications and approved lab dips',
    approved: false,
    rejected: false,
    rejectionNote: ''
  },
  {
    id: 'construction',
    label: 'Construction details',
    description: 'Seams, stitching, and assembly are correct',
    approved: false,
    rejected: false,
    rejectionNote: ''
  },
  {
    id: 'print',
    label: 'Print quality and placement',
    description: 'Artwork, prints, or embroidery are positioned and quality is acceptable',
    approved: false,
    rejected: false,
    rejectionNote: ''
  },
  {
    id: 'size',
    label: 'Size and measurements',
    description: 'Measurements match the spec sheet within tolerance',
    approved: false,
    rejected: false,
    rejectionNote: ''
  },
  {
    id: 'silhouette',
    label: 'Overall silhouette and fit',
    description: 'The overall look and fit matches the design intent',
    approved: false,
    rejected: false,
    rejectionNote: ''
  }
];

const SampleStage = ({ design }: SampleStageProps) => {
  const { workflowData, updateWorkflowData, setCurrentStage, markStageComplete } = useWorkflow();
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: order, error } = await supabase
          .from('orders')
          .select('*')
          .eq('design_id', design.id)
          .eq('designer_id', user.id)
          .not('manufacturer_id', 'is', null)
          .neq('status', 'cancelled')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) console.error('Error fetching order:', error);
        setOrderData(order);

        // Load saved checklist state from order if it exists
        const timelineData = order?.production_timeline_data as Record<string, any> | null;
        if (timelineData?.sample_checklist) {
          setChecklist(timelineData.sample_checklist);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [design.id]);

  useEffect(() => {
    if (!orderData?.id) return;

    const channel = supabase
      .channel(`sample-updates-${orderData.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderData.id}`
        },
        (payload) => {
          if ((payload.new as any)?.status === 'cancelled') return;
          setOrderData(payload.new);
          // Reload checklist if manufacturer resubmitted
          const timelineData = (payload.new as any)?.production_timeline_data as Record<string, any> | null;
          if (timelineData?.sample_checklist) {
            setChecklist(timelineData.sample_checklist);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderData?.id]);

  const samplePhotos = orderData?.production_timeline_data?.sample_photos || [];
  const sampleNotes = orderData?.production_timeline_data?.sample_notes || '';
  const hasSampleData = samplePhotos.length > 0 || orderData?.sample_submitted_at;
  
  // Check if sample was previously rejected and manufacturer resubmitted
  const wasRejected = orderData?.sample_approved === false;
  const isResubmission = wasRejected && orderData?.sample_submitted_at;

  const allItemsReviewed = checklist.every(item => item.approved || item.rejected);
  const allItemsApproved = checklist.every(item => item.approved && !item.rejected);
  const hasRejectedItems = checklist.some(item => item.rejected);
  const canProceed = allItemsApproved && !hasRejectedItems;

  const handleApproveItem = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id
        ? { ...item, approved: true, rejected: false, rejectionNote: '' }
        : item
    ));
  };

  const handleRejectItem = (id: string) => {
    if (!rejectionNote.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setChecklist(prev => prev.map(item =>
      item.id === id
        ? { ...item, rejected: true, approved: false, rejectionNote: rejectionNote.trim() }
        : item
    ));
    setRejectionNote('');
    setShowRejectionForm(null);
  };

  const handleClearRejection = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id
        ? { ...item, rejected: false, rejectionNote: '' }
        : item
    ));
  };

  const handleSubmitRejection = async () => {
    if (!orderData?.id) return;
    
    setIsSubmitting(true);
    try {
      const rejectedItems = checklist.filter(item => item.rejected);
      const feedbackNotes = rejectedItems
        .map(item => `• ${item.label}: ${item.rejectionNote}`)
        .join('\n');

      // Save checklist state and reject sample
      await supabase
        .from('orders')
        .update({
          sample_approved: false,
          production_timeline_data: {
            ...orderData.production_timeline_data,
            sample_checklist: checklist,
            designer_feedback: feedbackNotes
          }
        })
        .eq('id', orderData.id);

      await orderApi.rejectSample(orderData.id, feedbackNotes);
      toast.success('Sample feedback sent to manufacturer');
    } catch (error) {
      console.error('Error rejecting sample:', error);
      toast.error('Failed to send feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveAll = async () => {
    if (!orderData?.id || !canProceed) return;
    
    setIsSubmitting(true);
    try {
      // Save final checklist state
      await supabase
        .from('orders')
        .update({
          production_timeline_data: {
            ...orderData.production_timeline_data,
            sample_checklist: checklist
          }
        })
        .eq('id', orderData.id);

      await orderApi.approveSample(orderData.id, workflowData.fitNotes);
      toast.success('Sample approved! Proceeding to production.');
      updateWorkflowData({ sampleApproved: true });
      markStageComplete('sample');
      setCurrentStage('production-tracking');
    } catch (error) {
      console.error('Error approving sample:', error);
      toast.error('Failed to approve sample');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemStatus = (item: ChecklistItem) => {
    if (item.approved) return 'approved';
    if (item.rejected) return 'rejected';
    return 'pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading sample data...</p>
      </div>
    );
  }

  // Already approved - show success state
  if (orderData?.sample_approved === true) {
    return (
      <div>
        <StageHeader icon={Package} title="Sample Review" description="Sample has been approved." />
        <div className="max-w-3xl mx-auto mt-8">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                Sample Approved
              </h3>
              <p className="text-green-700 dark:text-green-300 mb-6">
                You've approved the sample. Production will begin shortly.
              </p>
              <Button onClick={() => setCurrentStage('production-tracking', true)}>
                Go to Production Tracking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StageHeader 
        icon={Package} 
        title="View your design sample" 
        description="Review each aspect of the sample and approve or request changes before production begins." 
        contextInfo={[
          { label: 'Factory', value: workflowData.selectedFactory?.name || 'Not selected' }, 
          { label: 'Quantity', value: workflowData.quantity || 'Not set' }
        ]} 
      />
      
      {!hasSampleData ? (
        <div className="max-w-3xl mx-auto mt-12">
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="w-8 h-8 text-muted-foreground animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Waiting for sample
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    The manufacturer is preparing your sample. You'll be able to review and approve it once they upload the sample photos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Resubmission notice */}
            {isResubmission && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Revised Sample Received
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        The manufacturer has submitted a revised sample based on your feedback.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sample Photos */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Manufacturer Samples</h3>
              <Card className="border-border">
                <CardContent className="p-6">
                  {samplePhotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {samplePhotos.map((url: string, idx: number) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border">
                          <img 
                            src={url} 
                            alt={`Sample ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No sample photos uploaded yet.
                    </p>
                  )}
                  {sampleNotes && (
                    <div className="mt-4 pt-4 border-t">
                      <Label className="text-xs text-muted-foreground mb-1 block">Manufacturer Notes</Label>
                      <p className="text-sm">{sampleNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Sample Approval Checklist */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Sample Approval Checklist</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {checklist.filter(i => i.approved).length}/{checklist.length} Approved
                  </Badge>
                  {hasRejectedItems && (
                    <Badge variant="destructive" className="text-xs">
                      {checklist.filter(i => i.rejected).length} Issues
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                {checklist.map((item) => {
                  const status = getItemStatus(item);
                  
                  return (
                    <Card 
                      key={item.id}
                      className={`border transition-all ${
                        status === 'approved' 
                          ? 'border-green-200 bg-green-50/50 dark:bg-green-950/10' 
                          : status === 'rejected'
                          ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10'
                          : 'border-border'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              status === 'approved' 
                                ? 'bg-green-100 dark:bg-green-900' 
                                : status === 'rejected'
                                ? 'bg-red-100 dark:bg-red-900'
                                : 'bg-muted'
                            }`}>
                              {status === 'approved' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : status === 'rejected' ? (
                                <XCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium text-sm ${
                                status === 'approved' 
                                  ? 'text-green-900 dark:text-green-100' 
                                  : status === 'rejected'
                                  ? 'text-red-900 dark:text-red-100'
                                  : 'text-foreground'
                              }`}>
                                {item.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.description}
                              </p>
                              
                              {/* Rejection note display */}
                              {item.rejected && item.rejectionNote && (
                                <div className="mt-2 p-2 bg-red-100/50 dark:bg-red-900/30 rounded text-sm flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                  <span className="text-red-800 dark:text-red-200">{item.rejectionNote}</span>
                                </div>
                              )}
                              
                              {/* Rejection form */}
                              {showRejectionForm === item.id && (
                                <div className="mt-3 space-y-2">
                                  <Textarea
                                    placeholder="Describe what needs to be fixed..."
                                    value={rejectionNote}
                                    onChange={(e) => setRejectionNote(e.target.value)}
                                    className="text-sm resize-none"
                                    rows={2}
                                  />
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleRejectItem(item.id)}
                                    >
                                      Flag Issue
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => {
                                        setShowRejectionForm(null);
                                        setRejectionNote('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          {showRejectionForm !== item.id && (
                            <div className="flex gap-2 shrink-0">
                              {status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => handleApproveItem(item.id)}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => setShowRejectionForm(item.id)}
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Issue
                                  </Button>
                                </>
                              )}
                              {status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-muted-foreground"
                                  onClick={() => setShowRejectionForm(item.id)}
                                >
                                  Change
                                </Button>
                              )}
                              {status === 'rejected' && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => handleApproveItem(item.id)}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs"
                                    onClick={() => handleClearRejection(item.id)}
                                  >
                                    Clear
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Additional Notes */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Additional Notes (Optional)</h3>
              <Card className="border-border">
                <CardContent className="p-6">
                  <Textarea 
                    placeholder="Any additional notes or instructions for the manufacturer..." 
                    value={workflowData.fitNotes || ''} 
                    onChange={(e) => updateWorkflowData({ fitNotes: e.target.value })} 
                    className="min-h-[100px] text-sm resize-none" 
                  />
                </CardContent>
              </Card>
            </section>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t">
              {hasRejectedItems && allItemsReviewed && (
                <Button 
                  onClick={handleSubmitRejection}
                  disabled={isSubmitting}
                  variant="destructive"
                  className="gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Feedback to Manufacturer'}
                </Button>
              )}
              
              {canProceed && (
                <Button 
                  onClick={handleApproveAll}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isSubmitting ? 'Approving...' : 'Approve Sample & Continue to Production'}
                </Button>
              )}

              {!allItemsReviewed && (
                <p className="text-sm text-muted-foreground">
                  Review all {checklist.length} items to continue
                </p>
              )}
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

export default SampleStage;
