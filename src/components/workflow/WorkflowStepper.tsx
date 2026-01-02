import React from 'react';
import { Check, Lock, Info } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { stageNames } from '@/data/workflowData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const stages = [
  'tech-pack',
  'factory-match',
  'send-tech-pack',
  'payment',
  'sample',
  'production-tracking',
  'quality',
  'shipping'
];

// Production steps that require feasibility confirmation
const productionSteps = ['payment', 'sample', 'quality', 'shipping'];

export const WorkflowStepper = () => {
  const { currentStage, completedStages, setCurrentStage } = useWorkflow();

  const getStageStatus = (stage: string, index: number) => {
    const currentIndex = stages.indexOf(currentStage);
    
    // If current stage is found and this stage is before it, mark as completed
    if (currentIndex !== -1 && index < currentIndex) {
      return 'completed';
    }
    
    // If explicitly in completed stages
    if (completedStages.includes(stage)) return 'completed';
    
    // Current stage
    if (stage === currentStage) return 'current';
    
    // Lock stages after current
    if (currentIndex !== -1 && index > currentIndex) {
      return 'locked';
    }
    
    return 'accessible';
  };

  return (
    <TooltipProvider>
      <div className="space-y-1">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage, index);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const isLocked = status === 'locked';
          const isAccessible = status === 'accessible' || isCompleted || isCurrent;
          const isProductionStep = productionSteps.includes(stage);

          const stepButton = (
            <button
              onClick={() => !isLocked && setCurrentStage(stage)}
              disabled={isLocked}
              className={`w-full text-left flex items-start gap-3 p-2 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-primary/5'
                  : isLocked
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-muted/50 cursor-pointer'
              }`}
            >
              {/* Circle/Check/Lock */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                  isCompleted
                    ? 'bg-primary border-primary'
                    : isCurrent
                    ? 'bg-primary/10 border-primary'
                    : isLocked
                    ? 'bg-muted border-muted'
                    : 'bg-background border-border'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-primary-foreground" />
                ) : isLocked && isProductionStep ? (
                  <Lock className="w-3 h-3 text-muted-foreground/50" />
                ) : (
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent 
                        ? 'text-primary' 
                        : isLocked
                        ? 'text-muted-foreground/50'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 pt-1">
                <p
                  className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                      ? 'text-foreground'
                      : isLocked
                      ? 'text-muted-foreground/50'
                      : 'text-muted-foreground'
                  }`}
                >
                  {stageNames[stage as keyof typeof stageNames]}
                </p>
                {isCompleted && (
                  <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
                )}
                {isLocked && isProductionStep && (
                  <p className="text-xs text-muted-foreground/50 mt-0.5">Awaiting feasibility</p>
                )}
                {isLocked && !isProductionStep && (
                  <p className="text-xs text-muted-foreground/50 mt-0.5">Locked</p>
                )}
              </div>
            </button>
          );

          return (
            <div key={stage} className="relative">
              {/* Connector Line - Centered with circle */}
              {index < stages.length - 1 && (
                <div
                  className={`absolute left-6 top-10 w-0.5 h-8 ${
                    isCompleted || (stages.indexOf(currentStage) > index) ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}

              {/* Step Item with Tooltip for locked production steps */}
              {isLocked && isProductionStep ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {stepButton}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-sm">
                      This step unlocks after the manufacturer confirms production feasibility.
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                stepButton
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
