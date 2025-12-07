import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { stageOrder } from '@/data/workflowData';
import { toast } from 'sonner';

interface StageNavigationProps {
  onNext?: () => boolean | Promise<boolean>; // Return true if can proceed
  nextLabel?: string;
  showBack?: boolean;
  showFinishLater?: boolean;
  incompleteItems?: string[];
}

export const StageNavigation = ({ 
  onNext, 
  nextLabel = 'Continue to Next Step',
  showBack = true,
  showFinishLater = true,
  incompleteItems = []
}: StageNavigationProps) => {
  const { currentStage, setCurrentStage, markStageComplete } = useWorkflow();

  const currentIndex = stageOrder.indexOf(currentStage as any);
  const hasNext = currentIndex < stageOrder.length - 1;
  const hasPrevious = currentIndex > 0;

  const handleNext = async () => {
    // Run validation if provided
    const canProceed = onNext ? await onNext() : true;
    
    if (canProceed && hasNext) {
      markStageComplete(currentStage);
      setCurrentStage(stageOrder[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (hasPrevious) {
      setCurrentStage(stageOrder[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinishLater = () => {
    if (hasNext) {
      // Force navigation without marking complete
      setCurrentStage(stageOrder[currentIndex + 1], true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (incompleteItems.length > 0) {
        toast.info(`You can come back to complete: ${incompleteItems.join(', ')}`);
      } else {
        toast.info('You can come back to complete this step later');
      }
    }
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t mt-8">
      <div className="flex items-center gap-3">
        {showBack && hasPrevious && (
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        
        {showFinishLater && hasNext && (
          <Button 
            variant="ghost" 
            onClick={handleFinishLater}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Clock className="w-4 h-4" />
            Finish Later
          </Button>
        )}
      </div>

      {hasNext && (
        <Button 
          onClick={handleNext}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          {nextLabel}
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};