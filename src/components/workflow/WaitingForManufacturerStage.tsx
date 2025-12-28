import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {Clock, CheckCircle2, Factory, ArrowLeft, ArrowRight} from 'lucide-react';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/context/WorkflowContext';
import {Button} from "@/components/ui/button.tsx";

interface WaitingForManufacturerStageProps {
  design: {
    id: string;
    name: string;
  };
}

const WaitingForManufacturerStage = ({ design }: WaitingForManufacturerStageProps) => {
  const [waitingTime, setWaitingTime] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);
  const { currentStage, setCurrentStage, markStageComplete } = useWorkflow();
  const [acceptedManufacturer, setAcceptedManufacturer] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleBack = () => {
    // setCurrentStage('tech-pack');
  };

  const handleContinue = () => {
    markStageComplete('waiting');
    setCurrentStage('manufacture-selection');
  };

  useEffect(() => {
    // Timer for waiting duration
    const timer = setInterval(() => {
      setWaitingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if already accepted
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
        // Don't auto-navigate - let designer manually proceed
      }
    };

    checkExistingAcceptance();

    // Set up real-time subscription for manufacturer acceptance
    const channel = supabase
      .channel('manufacturer-acceptance')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'manufacturer_matches',
          filter: `design_id=eq.${design.id}`
        },
        async (payload) => {
          console.log('Manufacturer match updated:', payload);
          
          if (payload.new.status === 'accepted') {
            // Fetch manufacturer name
            const { data: manufacturer } = await supabase
              .from('manufacturers')
              .select('name')
              .eq('id', payload.new.manufacturer_id)
              .single();

            setIsAccepted(true);
            setAcceptedManufacturer(manufacturer?.name || 'Manufacturer');
            toast.success(`${manufacturer?.name || 'A manufacturer'} has accepted your order!`);
            // Don't auto-navigate - let designer manually proceed
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [design.id, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <StageHeader
        icon={Clock}
        title={isAccepted ? "Manufacturer Found!" : "Waiting for manufacturer to approve your order"}
        description={isAccepted 
          ? `${acceptedManufacturer} has accepted your order` 
          : "Your order has been sent to the manufacturer. You'll be notified as soon as they approve."
        }
      />

      <div className="max-w-2xl mx-auto mt-12">
        <Card className="border-border">
          <CardContent className="p-12">
            {!isAccepted ? (
                <div className="text-center space-y-8">
                  {/* Animated Loading Circle */}
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 border-8 border-muted rounded-full"/>
                    <div
                        className="absolute inset-0 border-8 border-primary border-t-transparent rounded-full animate-spin"/>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Factory className="w-12 h-12 text-primary"/>
                    </div>
                  </div>

                  {/* Waiting Message */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-foreground">
                      Waiting for manufacturer...
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your order has been sent to the manufacturer. You'll be notified as soon as they approve.
                    </p>
                  </div>
                </div>
            ) : (
                <div className="text-center space-y-6">
                  {/* Success Animation */}
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"/>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle2 className="w-20 h-20 text-primary"/>
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-foreground">
                      Manufacturer Confirmed!
                    </h3>
                    <p className="text-base text-muted-foreground">
                      {acceptedManufacturer} has accepted your order
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Click the button below to review and finalize your contract
                    </p>
                  </div>
                </div>
            )}
          </CardContent>
        </Card>

        {!isAccepted && (
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                This usually takes 2-5 minutes. You'll receive a notification when a manufacturer accepts.
              </p>
            </div>
        )}

        {/*<StageNavigation */}
        {/*  nextLabel="View Accepted Manufacturers"*/}
        {/*  showBack={true}*/}
        {/*  onNext={async () => {*/}
        {/*    // Only allow proceeding if manufacturer has accepted*/}
        {/*    if (!isAccepted) {*/}
        {/*      toast.error('Please wait for manufacturer approval before proceeding');*/}
        {/*      return false;*/}
        {/*    }*/}
        {/*    return true;*/}
        {/*  }}*/}
        {/*/>*/}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4"/>
            Back to Tech Pack
          </Button>
          <Button onClick={handleContinue} className="gap-2">
            Move to manufacture selection page
            <ArrowRight className="w-4 h-4"/>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WaitingForManufacturerStage;
