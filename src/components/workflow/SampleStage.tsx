import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Package, Image as ImageIcon, Clock } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryDocuments } from './FactoryDocuments';
import { supabase } from '@/integrations/supabase/client';
import { orderApi } from '@/lib/api';

interface SampleStageProps { design: Design; }

const SampleStage = ({ design }: SampleStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();
  const [approvals, setApprovals] = useState({ colour: false, details: false, print: false, size: false, silhouette: false });
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) console.error('Error fetching order:', error);
        setOrderData(order);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();

    // Real-time subscription for sample updates
    const channel = supabase
      .channel('sample-updates')
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

  const allApproved = Object.values(approvals).every(v => v);
  const samplePhotos = orderData?.production_timeline_data?.sample_photos || [];
  const sampleNotes = orderData?.production_timeline_data?.sample_notes || '';
  const hasSampleData = samplePhotos.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading sample data...</p>
      </div>
    );
  }

  return (
    <div>
      <StageHeader icon={Package} title="View your design sample" description="Review samples provided by the manufacturer and approve specific aspects before production." contextInfo={[{ label: 'Factory', value: workflowData.selectedFactory?.name || 'Not selected' }, { label: 'Quantity', value: workflowData.quantity || 'Not set' }]} />
      
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
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Manufacturer Samples</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {samplePhotos.map((url: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Sample ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {sampleNotes && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-xs text-muted-foreground mb-1 block">Manufacturer Notes</Label>
                    <p className="text-sm">{sampleNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Sample Approval Checklist</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[{ key: 'colour', label: 'Colour accuracy matches specifications' }, { key: 'details', label: 'Construction details are correct' }, { key: 'print', label: 'Print quality and placement' }, { key: 'size', label: 'Size and measurements' }, { key: 'silhouette', label: 'Overall silhouette and fit' }].map(item => (
                    <div key={item.key} className="flex items-center space-x-3">
                      <Checkbox id={item.key} checked={approvals[item.key as keyof typeof approvals]} onCheckedChange={(checked) => setApprovals(prev => ({ ...prev, [item.key]: checked as boolean }))} />
                      <Label htmlFor={item.key} className="text-sm font-normal cursor-pointer">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Feedback & Notes</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <Textarea placeholder="Provide detailed feedback about the sample before production begins..." value={workflowData.fitNotes} onChange={(e) => updateWorkflowData({ fitNotes: e.target.value })} className="min-h-[120px] text-sm resize-none" />
              </CardContent>
            </Card>
          </section>

          <StageNavigation 
            onNext={async () => { 
              if (!allApproved) return false; 
              
              // Update database to approve sample via backend API
              if (orderData?.id) {
                try {
                  await orderApi.approveSample(orderData.id, workflowData.fitNotes);
                } catch (error) {
                  console.error('Error approving sample:', error);
                  return false;
                }
              }
              
              updateWorkflowData({ sampleApproved: true }); 
              return true; 
            }} 
            nextLabel={allApproved ? "Approve & Continue to Quality Check" : "Complete checklist to continue"} 
            showBack={true} 
          />
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
