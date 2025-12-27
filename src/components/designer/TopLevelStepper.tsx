import React from 'react';
import { Check, Palette, Ruler, Shirt, FileText, Factory } from 'lucide-react';

interface TopLevelStepperProps {
  currentStep: 'design' | 'specifications' | 'fabric-color' | 'tech-pack' | 'production';
  onStepChange: (step: 'design' | 'specifications' | 'fabric-color' | 'tech-pack' | 'production') => void;
  designComplete?: boolean;
  specsComplete?: boolean;
  fabricComplete?: boolean;
  techPackComplete?: boolean;
}

const steps = [
  { id: 'design' as const, label: 'Design', icon: Palette },
  { id: 'specifications' as const, label: 'Specifications', icon: Ruler },
  { id: 'fabric-color' as const, label: 'Fabric & Color', icon: Shirt },
  { id: 'tech-pack' as const, label: 'Tech Pack', icon: FileText },
  { id: 'production' as const, label: 'Production', icon: Factory },
];

export const TopLevelStepper = ({ 
  currentStep, 
  onStepChange,
  designComplete = true,
  specsComplete = false,
  fabricComplete = false,
  techPackComplete = false
}: TopLevelStepperProps) => {
  const isStepAccessible = (stepId: string) => {
    if (stepId === 'design') return true;
    if (stepId === 'specifications') return designComplete;
    if (stepId === 'fabric-color') return specsComplete;
    if (stepId === 'tech-pack') return fabricComplete;
    if (stepId === 'production') return techPackComplete;
    return false;
  };

  const isStepComplete = (stepId: string) => {
    if (stepId === 'design') return designComplete;
    if (stepId === 'specifications') return specsComplete;
    if (stepId === 'fabric-color') return fabricComplete;
    if (stepId === 'tech-pack') return techPackComplete;
    return false;
  };

  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-xl p-2 mb-6">
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
                flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all flex-1 justify-center
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : isComplete
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : isAccessible
                  ? 'hover:bg-muted/50 text-muted-foreground'
                  : 'text-muted-foreground/50 cursor-not-allowed'
                }
              `}
            >
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium
                ${isActive
                  ? 'bg-primary-foreground/20'
                  : isComplete
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
                }
              `}>
                {isComplete && !isActive ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="font-medium text-sm hidden sm:inline">{step.label}</span>
            </button>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${isComplete ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
