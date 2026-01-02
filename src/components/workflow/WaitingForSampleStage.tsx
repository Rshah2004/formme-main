import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, Package } from 'lucide-react';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
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
  const [waitingTime, setWaitingTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const { markStageComplete } = useWorkflow();

  useEffect(() => {
    // Timer for waiting duration
    const timer = setInterval(() => {
      setWaitingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if sample is already ready
    const checkSampleStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the active order (not cancelled) for this design
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

      // Check if sample has been submitted (sample_submitted_at is set)
      if (order?.sample_submitted_at) {
        setIsReady(true);
        toast.success('Your sample is ready for review!');
        
        // Auto-proceed after 2 seconds
        setTimeout(() => {
          markStageComplete('waiting-sample');
          navigate({
            pathname: '/workflow',
            search: `?designId=${design.id}&stage=sample`
          });
        }, 2000);
      }
    };

    checkSampleStatus();

    // Set up real-time subscription for sample readiness
    const channel = supabase
      .channel('sample-production')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `design_id=eq.${design.id}`
        },
        async (payload: any) => {
          console.log('Order updated:', payload);
          
          // Check if sample has been submitted (sample_submitted_at is set)
          if (payload.new.sample_submitted_at && payload.new.status !== 'cancelled') {
            setIsReady(true);
            toast.success('Your sample is ready for review!');
            
            // Auto-proceed to sample stage after 2 seconds
            setTimeout(() => {
              markStageComplete('waiting-sample');
              navigate({
                pathname: '/workflow',
                search: `?designId=${design.id}&stage=sample`
              });
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [design.id, navigate, markStageComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <StageHeader
        icon={Clock}
        title={isReady ? "Sample Ready!" : "Sample in Production"}
        description={isReady 
          ? "Your sample has been manufactured and is ready for review" 
          : "Your design is currently being manufactured. You'll be notified when the sample is ready."
        }
      />

      <div className="max-w-2xl mx-auto mt-12">
        <Card className="border-border">
          <CardContent className="p-12">
            {!isReady ? (
              <div className="text-center space-y-8">
                {/* Animated Loading Circle */}
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-8 border-muted rounded-full" />
                  <div className="absolute inset-0 border-8 border-primary border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-12 h-12 text-primary" />
                  </div>
                </div>

                {/* Waiting Message */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">
                    Manufacturing your sample...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The manufacturer is producing your sample. You'll be notified as soon as it's ready for review.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                {/* Success Animation */}
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle2 className="w-20 h-20 text-primary" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-foreground">
                    Sample Ready!
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Your sample has been manufactured and is ready for review
                  </p>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Proceeding to sample review...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!isReady && (
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Sample production typically takes 5-10 days. You'll receive a notification when it's ready.
            </p>
          </div>
        )}

        <StageNavigation 
          nextLabel="Continue to Sample Review"
          showBack={true}
        />
      </div>
    </div>
  );
};

export default WaitingForSampleStage;
