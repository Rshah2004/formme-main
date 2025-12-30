import React from 'react';
import { Check, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface ManufacturerStepperProps {
  activeStep: string;
  onStepChange: (step: string) => void;
  orderData?: any;
}

const manufacturerStages = [
  { id: 'review-feasibility', label: 'Review & Feasibility', completionKey: 'tech_pack_feasible' },
  { id: 'sample', label: 'Sample Development', completionKey: 'sample_submitted_at', requiresApproval: true },
  { id: 'quality', label: 'Quality Check', completionKey: 'qc_submitted_at', requiresApproval: true },
  { id: 'shipping', label: 'Shipping & Logistics', completionKey: 'shipping_completed', requiresApproval: true },
];

export const ManufacturerStepper = ({ activeStep, onStepChange, orderData }: ManufacturerStepperProps) => {
  const currentIndex = manufacturerStages.findIndex(s => s.id === activeStep);

  const isStageCompleted = (stage: typeof manufacturerStages[0]) => {
    if (!orderData) return false;
    
    switch (stage.id) {
      case 'review-feasibility':
        return orderData.tech_pack_feasible === true && !!orderData.production_params_submitted_at;
      case 'sample':
        return !!orderData.sample_approved;
      case 'quality':
        return !!orderData.qc_approved;
      case 'shipping':
        return orderData.status === 'delivered';
      default:
        return false;
    }
  };

  const isStageAccessible = (stage: typeof manufacturerStages[0], index: number) => {
    if (!orderData) return false;
    
    if (stage.id === 'review-feasibility') return true;
    if (stage.id === 'sample') return orderData.production_params_approved === true;
    if (stage.id === 'quality') return orderData.sample_approved === true;
    if (stage.id === 'shipping') return orderData.qc_approved === true;
    
    return index > 0 && isStageCompleted(manufacturerStages[index - 1]);
  };

  const getStageStatus = (index: number) => {
    const stage = manufacturerStages[index];
    if (isStageCompleted(stage)) return 'completed';
    if (index === currentIndex) return 'current';
    if (!isStageAccessible(stage, index)) return 'locked';
    return 'accessible';
  };

  return (
    <div className="space-y-1">
      {manufacturerStages.map((stage, index) => {
        const status = getStageStatus(index);
        const isCompleted = status === 'completed';
        const isCurrent = status === 'current';
        const isLocked = status === 'locked';
        const isAccessible = isStageAccessible(stage, index);

        return (
          <div key={stage.id} className="relative">
            {index < manufacturerStages.length - 1 && (
              <div className={`absolute left-[15px] top-8 w-0.5 h-8 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
            )}

            <button
              onClick={() => {
                if (isLocked) {
                  toast.error('This stage is locked until the previous stage is approved');
                  return;
                }
                if (isAccessible) onStepChange(stage.id);
              }}
              className={`w-full text-left flex items-start gap-3 p-2 rounded-lg transition-all ${
                isCurrent ? 'bg-primary/5' : isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50 cursor-pointer'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                isCompleted ? 'bg-primary border-primary' : isCurrent ? 'bg-primary/10 border-primary' : isLocked ? 'bg-muted border-border' : 'bg-background border-border'
              }`}>
                {isCompleted ? (
                  <Check className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <span className={`text-xs font-semibold ${isCurrent ? 'text-primary' : isLocked ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                    {index + 1}
                  </span>
                )}
              </div>

              <div className="flex-1 pt-1">
                <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : isLocked ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                  {stage.label}
                </p>
                {isCompleted && <p className="text-xs text-muted-foreground mt-0.5">Completed</p>}
                {isLocked && stage.requiresApproval && <p className="text-xs text-amber-600 mt-0.5">Awaiting approval</p>}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
};
