import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Target } from 'lucide-react';

type StepStatus = 
  | 'awaiting_review'
  | 'blocked'
  | 'changes_requested'
  | 'approved'
  | 'in_progress'
  | 'ready'
  | 'completed';

interface StepHeaderProps {
  stepNumber: number;
  stepTitle: string;
  owner: 'Manufacturer' | 'Designer';
  requiredAction: string;
  status?: StepStatus;
}

const statusConfig: Record<StepStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  awaiting_review: { 
    label: 'Awaiting Manufacturer Review', 
    variant: 'secondary',
    className: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  blocked: { 
    label: 'Blocked — Action Required', 
    variant: 'destructive' 
  },
  changes_requested: { 
    label: 'Changes Requested', 
    variant: 'destructive',
    className: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  approved: { 
    label: 'Approved for Production', 
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  in_progress: { 
    label: 'In Production', 
    variant: 'secondary',
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  ready: { 
    label: 'Ready for Shipment', 
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  completed: { 
    label: 'Completed', 
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
};

export const StepHeader = ({ 
  stepNumber, 
  stepTitle, 
  owner, 
  requiredAction,
  status 
}: StepHeaderProps) => {
  const statusInfo = status ? statusConfig[status] : null;

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Step {stepNumber}
            </span>
            {statusInfo && (
              <Badge 
                variant={statusInfo.variant} 
                className={statusInfo.className}
              >
                {statusInfo.label}
              </Badge>
            )}
          </div>
          
          {/* Step title */}
          <h2 className="text-xl font-semibold text-foreground mb-3">
            {stepTitle}
          </h2>
          
          {/* Owner and Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Owner:</span>
              <span className="font-medium text-foreground">{owner}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Action:</span>
              <span className="font-medium text-foreground">{requiredAction}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
