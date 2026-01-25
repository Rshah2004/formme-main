import React from 'react';
import { Check, Lock, Palette, FileText, Factory, Sparkles } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { useContractStatus } from '@/hooks/useContractStatus';
import { toast } from 'sonner';

import { Upload } from 'lucide-react';

// Top level tabs - 4 phases
const topLevelStages = [
  { id: 'tech-pack', label: 'Tech Pack', icon: FileText },
  { id: 'manufacturers', label: 'Manufacturers', icon: Factory },
  { id: 'production', label: 'Production', icon: Factory },
];

// Tech Pack sub-stages - Upload first, then generator steps
export const techPackSubStages = [
  { id: 'upload-tech-pack', label: 'Upload Tech Pack' },
  { id: 'design', label: 'Design Details' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'fabric-color', label: 'Fabric & Color' },
];

// Manufacturers sub-stages
export const manufacturersSubStages = [
  { id: 'factory-match', label: 'Find Manufacturers' },
  { id: 'manufacture-selection', label: 'Finalize Manufacturer' },
];

// Production sub-stages
export const productionSubStages = [
  { id: 'payment', label: 'Payment' },
  { id: 'sample', label: 'Sample Review' },
  { id: 'production-tracking', label: 'Production' },
  { id: 'quality', label: 'Quality Check' },
  { id: 'shipping', label: 'Delivery' },
];

// Map current stage to top-level tab
export const getTopLevelStage = (currentStage: string): string => {
  // Tech Pack phase (upload or generator steps)
  if (['upload-tech-pack', 'design', 'specifications', 'fabric-color', 'tech-pack', 'tech-pack-review', 'tech-pack-overview'].includes(currentStage)) {
    return 'tech-pack';
  }
  
  // Manufacturers phase (finding and finalizing)
  if (['factory-match', 'factory-selection', 'send-tech-pack', 'waiting', 'manufacture-selection'].includes(currentStage)) {
    return 'manufacturers';
  }

  // Production phase
  if (['payment', 'production', 'waiting-sample', 'sample', 'production-tracking', 'quality', 'shipping'].includes(currentStage)) {
    return 'production';
  }
  
  return 'tech-pack';
};

export const HorizontalProgressTabs = () => {
  const { currentStage, completedStages, setCurrentStage } = useWorkflow();
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('designId');
  const { isContractFinalized } = useContractStatus(designId);

  const activeTopLevel = getTopLevelStage(currentStage);
  const isInTechPack = activeTopLevel === 'tech-pack';
  const isInManufacturers = activeTopLevel === 'manufacturers';
  const isInProduction = activeTopLevel === 'production';

  const getStageStatus = (stageId: string) => {
    const stageOrder = topLevelStages.map(s => s.id);
    const currentIndex = stageOrder.indexOf(activeTopLevel);
    const stageIndex = stageOrder.indexOf(stageId);

    // Lock tech-pack and manufacturers tabs when contract is finalized
    if (isContractFinalized && (stageId === 'tech-pack' || stageId === 'manufacturers')) {
      return 'locked';
    }

    if (stageIndex < currentIndex) return 'completed';
    if (stageId === activeTopLevel) return 'current';
    if (stageIndex > currentIndex) return 'locked';
    return 'accessible';
  };

  const handleStageClick = (stageId: string, status: string) => {
    if (status === 'locked') {
      if (isContractFinalized && (stageId === 'tech-pack' || stageId === 'manufacturers')) {
        toast.error('This section is locked after contract finalization');
      }
      return;
    }
    
    if (stageId === 'tech-pack') setCurrentStage('upload-tech-pack');
    else if (stageId === 'manufacturers') setCurrentStage('factory-match');
    else if (stageId === 'production') setCurrentStage('payment');
  };

  return (
    <div className="w-full">
      {/* Top Level Horizontal Progress Tabs */}
      <div className="flex items-center justify-between bg-white border border-border rounded-xl p-2 mb-6 shadow-sm">
        {topLevelStages.map((stage, index) => {
          const status = getStageStatus(stage.id);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const isLocked = status === 'locked';
          const Icon = stage.icon;

          return (
            <React.Fragment key={stage.id}>
              <button
                onClick={() => handleStageClick(stage.id, status)}
                disabled={isLocked}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all flex-1 justify-center",
                  isCurrent && "bg-primary text-primary-foreground shadow-sm",
                  isCompleted && "bg-accent/20 text-accent hover:bg-accent/30",
                  isLocked && "text-muted-foreground/50 cursor-not-allowed",
                  !isCurrent && !isCompleted && !isLocked && "hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium",
                  isCurrent && "bg-primary-foreground/20",
                  isCompleted && "bg-accent text-accent-foreground",
                  isLocked && "bg-muted",
                  !isCurrent && !isCompleted && !isLocked && "bg-muted"
                )}>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="font-medium text-sm hidden sm:inline">{stage.label}</span>
              </button>

              {index < topLevelStages.length - 1 && (
                <div className={cn(
                  "w-6 h-0.5 mx-0.5",
                  index < topLevelStages.findIndex(s => s.id === activeTopLevel)
                    ? "bg-accent"
                    : "bg-border"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Tech Pack Sub-stages */}
      {isInTechPack && <TechPackSubTabs />}

      {/* Manufacturers Sub-stages */}
      {isInManufacturers && <ManufacturersSubTabs />}

      {/* Production Sub-stages */}
      {isInProduction && <ProductionSubTabs />}
    </div>
  );
};

// Sub-tabs for Tech Pack phase (upload first, then generator steps)
const TechPackSubTabs = () => {
  const { currentStage, setCurrentStage, completedStages } = useWorkflow();

  const getCurrentSubIndex = () => {
    if (currentStage === 'upload-tech-pack') return 0;
    if (currentStage === 'design' || currentStage === 'tech-pack' || currentStage === 'tech-pack-overview') return 1;
    if (currentStage === 'specifications') return 2;
    if (currentStage === 'fabric-color') return 3;
    return 0;
  };

  const currentSubIndex = getCurrentSubIndex();

  return (
    <div className="flex items-center gap-1 bg-white/60 border border-border/50 rounded-lg p-1.5 overflow-x-auto">
      {techPackSubStages.map((subStage, index) => {
        const isCurrent = index === currentSubIndex;
        const isCompleted = completedStages.includes(subStage.id);

        return (
          <button
            key={subStage.id}
            onClick={() => setCurrentStage(subStage.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
              isCurrent && "bg-white text-primary shadow-sm border border-border/50",
              isCompleted && !isCurrent && "text-accent hover:bg-white/50",
              !isCurrent && !isCompleted && "text-muted-foreground hover:bg-white/50"
            )}
          >
            {isCompleted && !isCurrent && (
              <Check className="w-3 h-3 inline mr-1 text-accent" />
            )}
            {subStage.label}
          </button>
        );
      })}
    </div>
  );
};

// Sub-tabs for Manufacturers phase
const ManufacturersSubTabs = () => {
  const { currentStage, setCurrentStage, completedStages } = useWorkflow();

  const getCurrentSubIndex = () => {
    if (currentStage === 'factory-match' || currentStage === 'factory-selection') return 0;
    if (currentStage === 'manufacture-selection' || currentStage === 'waiting' || currentStage === 'send-tech-pack') return 1;
    return 0;
  };

  const currentSubIndex = getCurrentSubIndex();

  return (
    <div className="flex items-center gap-1 bg-white/60 border border-border/50 rounded-lg p-1.5 overflow-x-auto">
      {manufacturersSubStages.map((subStage, index) => {
        const isCurrent = index === currentSubIndex;
        const isCompleted = index < currentSubIndex || completedStages.includes(subStage.id);

        return (
          <button
            key={subStage.id}
            onClick={() => setCurrentStage(subStage.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
              isCurrent && "bg-white text-primary shadow-sm border border-border/50",
              isCompleted && !isCurrent && "text-accent hover:bg-white/50",
              !isCurrent && !isCompleted && "text-muted-foreground hover:bg-white/50"
            )}
          >
            {isCompleted && !isCurrent && (
              <Check className="w-3 h-3 inline mr-1 text-accent" />
            )}
            {subStage.label}
          </button>
        );
      })}
    </div>
  );
};

// Sub-tabs for production phase
const ProductionSubTabs = () => {
  const { currentStage, setCurrentStage, completedStages } = useWorkflow();

  const getCurrentSubIndex = () => {
    if (currentStage === 'payment') return 0;
    if (currentStage === 'production' || currentStage === 'waiting-sample' || currentStage === 'sample') return 1;
    if (currentStage === 'production-tracking') return 2;
    if (currentStage === 'quality') return 3;
    if (currentStage === 'shipping') return 4;
    return 0;
  };

  const currentSubIndex = getCurrentSubIndex();

  return (
    <div className="flex items-center gap-1 bg-white/60 border border-border/50 rounded-lg p-1.5 overflow-x-auto">
      {productionSubStages.map((subStage, index) => {
        const isCurrent = index === currentSubIndex;
        const isCompleted = index < currentSubIndex || completedStages.includes(subStage.id);
        const isLocked = index > currentSubIndex && !completedStages.includes(productionSubStages[index - 1]?.id);

        return (
          <button
            key={subStage.id}
            onClick={() => !isLocked && setCurrentStage(subStage.id)}
            disabled={isLocked}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
              isCurrent && "bg-white text-primary shadow-sm border border-border/50",
              isCompleted && !isCurrent && "text-accent hover:bg-white/50",
              isLocked && "text-muted-foreground/40 cursor-not-allowed",
              !isCurrent && !isCompleted && !isLocked && "text-muted-foreground hover:bg-white/50"
            )}
          >
            {isCompleted && !isCurrent && (
              <Check className="w-3 h-3 inline mr-1 text-accent" />
            )}
            {subStage.label}
          </button>
        );
      })}
    </div>
  );
};

export default HorizontalProgressTabs;