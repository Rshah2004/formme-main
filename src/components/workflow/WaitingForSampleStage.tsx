import React, { useEffect, useState } from 'react';
import { Package, CheckCircle2, Scissors, Truck, ClipboardCheck } from 'lucide-react';
import { StageHeader } from './StageHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/context/WorkflowContext';

interface WaitingForSampleStageProps {
  design: {
    id: string;
    name: string;
  };
}

const WaitingForSampleStage = ({ design }: WaitingForSampleStageProps) => {
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const { markStageComplete } = useWorkflow();

  useEffect(() => {
    const checkSampleStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: order } = await supabase
        .from('orders')
        .select('status, sample_submitted_at')
        .eq('design_id', design.id)
        .eq('designer_id', user.id)
        .not('manufacturer_id', 'is', null)
        .neq('status', 'cancelled')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (order?.sample_submitted_at) {
        setIsReady(true);
        toast.success('Your sample is ready for review!');
        setTimeout(() => {
          markStageComplete('waiting-sample');
          navigate({ pathname: '/workflow', search: `?designId=${design.id}&stage=sample` });
        }, 2000);
      }
    };

    checkSampleStatus();

    const channel = supabase
      .channel('sample-production')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `design_id=eq.${design.id}` },
        async (payload: any) => {
          if (payload.new.sample_submitted_at && payload.new.status !== 'cancelled') {
            setIsReady(true);
            toast.success('Your sample is ready for review!');
            setTimeout(() => {
              markStageComplete('waiting-sample');
              navigate({ pathname: '/workflow', search: `?designId=${design.id}&stage=sample` });
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [design.id, navigate, markStageComplete]);

  return (
    <div className="space-y-8">
      <StageHeader
        stageLabel="Step 03 · Production"
        title={isReady ? 'Sample ready for review.' : 'Sample in production.'}
        description={
          isReady
            ? 'Your sample has been manufactured. Redirecting you to the review screen now.'
            : "The manufacturer is producing your physical sample. You'll be notified the moment it's ready."
        }
      />

      {!isReady ? (
        <div className="space-y-6">
          {/* Status */}
          <div className="border border-border rounded-xl p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Your sample is being manufactured</p>
                <p className="text-sm text-muted-foreground">
                  The factory is cutting and sewing your sample. You'll receive a notification as soon as it's submitted for review.
                </p>
              </div>
            </div>
          </div>

          {/* Production stages */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Sample production stages</p>
            </div>
            <div className="divide-y divide-border">
              {[
                { icon: ClipboardCheck, label: 'Pattern grading & material sourcing', note: 'Days 1–2' },
                { icon: Scissors, label: 'Cutting & construction', note: 'Days 3–7' },
                { icon: Package, label: 'Quality check & finishing', note: 'Days 8–9' },
                { icon: Truck, label: 'Sample submitted for your review', note: 'Day 10' },
              ].map(({ icon: Icon, label, note }, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground flex-1">{label}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{note}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Sample production typically takes 5–10 days. You can safely leave this page — we'll notify you when it's ready.
          </p>
        </div>
      ) : (
        <div className="border border-accent/30 bg-accent/5 rounded-xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Sample ready</p>
              <p className="text-sm text-muted-foreground">Redirecting you to the sample review screen…</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitingForSampleStage;
