import React from 'react';
import { Check, Palette, FileText, Factory } from 'lucide-react';

interface TopLevelStepperProps {
  currentStep: 'design' | 'tech-pack' | 'production';
  onStepChange: (step: 'design' | 'tech-pack' | 'production') => void;
  designComplete?: boolean;
  techPackComplete?: boolean;
}

const steps = [
  { id: 'design' as const, label: 'Design', icon: Palette },
  { id: 'tech-pack' as const, label: 'Tech Pack', icon: FileText },
  { id: 'production' as const, label: 'Production', icon: Factory },
];

export const TopLevelStepper = ({ 
  currentStep, 
  onStepChange,
  designComplete = true,
  techPackComplete = false
}: TopLevelStepperProps) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  const isStepAccessible = (stepId: string) => {
    if (stepId === 'design') return true;
    if (stepId === 'tech-pack') return designComplete;
    if (stepId === 'production') return techPackComplete;
    return false;
  };

  const isStepComplete = (stepId: string) => {
    if (stepId === 'design') return designComplete;
    if (stepId === 'tech-pack') return techPackComplete;
    return false;
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isComplete = isStepComplete(step.id);
        const isAccessible = isStepAccessible(step.id);
        const Icon = step.icon;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isAccessible && onStepChange(step.id)}
              disabled={!isAccessible}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : isComplete
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : isAccessible
                  ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                  : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                }
              `}
            >
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center
                ${isComplete && !isActive
                  ? 'bg-primary text-primary-foreground'
                  : ''
                }
              `}>
                {isComplete && !isActive ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className="font-medium text-sm">{step.label}</span>
            </button>
            
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${isComplete ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
