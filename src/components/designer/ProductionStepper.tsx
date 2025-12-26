import React from 'react';
import { cn } from '@/lib/utils';

export type ProductionStep = 
  | 'tech-pack-review'
  | 'production-parameters'
  | 'sample-development'
  | 'quality-check'
  | 'shipping';

interface ProductionStepperProps {
  activeStep: ProductionStep;
  onStepChange: (step: ProductionStep) => void;
  order?: any;
}

const steps: { id: ProductionStep; label: string }[] = [
  { id: 'tech-pack-review', label: 'Tech Pack Review' },
  { id: 'production-parameters', label: 'Production Parameters' },
  { id: 'sample-development', label: 'Sample Development' },
  { id: 'quality-check', label: 'Quality Check' },
  { id: 'shipping', label: 'Shipping & Logistics' },
];

export const ProductionStepper = ({ 
  activeStep, 
  onStepChange,
  order
}: ProductionStepperProps) => {
  const getStepStatus = (stepId: ProductionStep) => {
    if (!order) return 'pending';
    
    switch (stepId) {
      case 'tech-pack-review':
        if (order.tech_pack_feasible === true) return 'complete';
        if (order.tech_pack_feasible === false) return 'needs_action';
        return 'pending';
      case 'production-parameters':
        if (order.production_params_approved === true) return 'complete';
        if (order.production_params_submitted_at && order.production_params_approved === null) return 'needs_action';
        return 'pending';
      case 'sample-development':
        if (order.sample_approved === true) return 'complete';
        if (order.sample_submitted_at && order.sample_approved === null) return 'needs_action';
        return 'pending';
      case 'quality-check':
        if (order.qc_approved === true) return 'complete';
        if (order.qc_submitted_at && order.qc_approved === null) return 'needs_action';
        return 'pending';
      case 'shipping':
        if (order.status === 'delivered') return 'complete';
        return 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <nav className="space-y-1">
      {steps.map((step) => {
        const isActive = step.id === activeStep;
        const status = getStepStatus(step.id);
        
        return (
          <button
            key={step.id}
            onClick={() => onStepChange(step.id)}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-between",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{step.label}</span>
            {status === 'complete' && (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            )}
            {status === 'needs_action' && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
