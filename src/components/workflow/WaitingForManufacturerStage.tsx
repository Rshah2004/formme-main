import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, Factory, ArrowRight, Mail } from 'lucide-react';
import { StageHeader } from './StageHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkflow } from '@/context/WorkflowContext';
import { Button } from '@/components/ui/button';

interface WaitingForManufacturerStageProps {
  design: {
    id: string;
    name: string;
  };
}

const WaitingForManufacturerStage = ({ design }: WaitingForManufacturerStageProps) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [acceptedManufacturer, setAcceptedManufacturer] = useState<string | null>(null);
  const { markStageComplete, setCurrentStage } = useWorkflow();

  const handleContinue = () => {
    markStageComplete('waiting');
    setCurrentStage('manufacture-selection');
  };

  useEffect(() => {
    const checkExistingAcceptance = async () => {
      const { data: matches } = await supabase
        .from('manufacturer_matches')
        .select('*, manufacturers(name)')
        .eq('design_id', design.id)
        .eq('status', 'accepted')
        .maybeSingle();

      if (matches) {
        setIsAccepted(true);
        setAcceptedManufacturer(matches.manufacturers?.name || 'Manufacturer');
      }
    };

    checkExistingAcceptance();

    const channel = supabase
      .channel('manufacturer-acceptance')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'manufacturer_matches', filter: `design_id=eq.${design.id}` },
        async (payload) => {
          if (payload.new.status === 'accepted') {
            const { data: manufacturer } = await supabase
              .from('manufacturers')
              .select('name')
              .eq('id', payload.new.manufacturer_id)
              .single();
            setIsAccepted(true);
            setAcceptedManufacturer(manufacturer?.name || 'Manufacturer');
            toast.info(`${manufacturer?.name || 'A manufacturer'} has agreed to review your tech pack`);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [design.id]);

  return (
    <div className="space-y-8">
      <StageHeader
        stageLabel="Step 02 · Manufacturers"
        title={isAccepted ? 'A manufacturer is reviewing your pack.' : 'Waiting for manufacturer response.'}
        description={
          isAccepted
            ? `${acceptedManufacturer} has agreed to review your tech pack. They'll confirm feasibility before production can begin.`
            : "Your request has been sent to matched manufacturers. You'll be notified as soon as one responds."
        }
      />

      {!isAccepted ? (
        <div className="space-y-6">
          {/* Status card */}
          <div className="border border-border rounded-xl p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Outreach sent to matched manufacturers</p>
                <p className="text-sm text-muted-foreground">
                  Your tech pack has been shared with manufacturers who fit your criteria. This typically takes 2–5 minutes.
                </p>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">What happens next</p>
            </div>
            <div className="divide-y divide-border">
              {[
                { icon: Factory, label: 'Manufacturer reviews your tech pack', note: '2–5 min' },
                { icon: CheckCircle2, label: 'They confirm capacity and feasibility', note: '1–2 days' },
                { icon: ArrowRight, label: 'You finalize terms and move to sampling', note: 'After confirmation' },
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
            You'll receive a notification when a manufacturer responds. You can safely leave this page.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Accepted state */}
          <div className="border border-accent/30 bg-accent/5 rounded-xl p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-accent" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{acceptedManufacturer} has accepted your request</p>
                <p className="text-sm text-muted-foreground">
                  They are reviewing your tech pack and will confirm production feasibility. This is not a production commitment yet.
                </p>
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">What to expect</p>
            </div>
            <div className="divide-y divide-border">
              {[
                { label: 'Feasibility review', value: '1–2 business days' },
                { label: 'Next step', value: 'Review manufacturer terms & pricing' },
                { label: 'Production confirmed', value: 'Only after feasibility approval' },
              ].map(({ label, value }, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleContinue} className="gap-2">
              View manufacturer details
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitingForManufacturerStage;
