import React from 'react';
import { Check, Lock, Palette, Ruler, Shirt, FileText, Factory } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { cn } from '@/lib/utils';

// Designer-friendly stage definitions - Top level tabs
const topLevelStages = [
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'specifications', label: 'Specifications', icon: Ruler },
  { id: 'fabric-color', label: 'Fabric & Color', icon: Shirt },
  { id: 'tech-pack', label: 'Tech Pack', icon: FileText },
  { id: 'production', label: 'Production', icon: Factory },
];

// Tech Pack sub-stages
export const techPackSubStages = [
  { id: 'tech-pack-overview', label: 'Overview' },
  { id: 'factory-match', label: 'Finding Manufacturers' },
  { id: 'send-tech-pack', label: 'Tech Pack Feasibility' },
];

// Production sub-stages (matching reference image)
export const productionSubStages = [
  { id: 'payment', label: 'Payment' },
  { id: 'sample', label: 'Sample Review' },
  { id: 'quality', label: 'Quality Check' },
  { id: 'shipping', label: 'Delivery' },
];

// Map current stage to top-level tab
export const getTopLevelStage = (currentStage: string): string => {
  // Design phase
  if (currentStage === 'design') return 'design';
  if (currentStage === 'specifications') return 'specifications';
  if (currentStage === 'fabric-color') return 'fabric-color';
  
  // Tech Pack phase (includes overview, finding manufacturers, feasibility)
  if (['tech-pack', 'tech-pack-review', 'tech-pack-overview', 'factory-match', 'send-tech-pack', 'waiting', 'factory-selection'].includes(currentStage)) {
    return 'tech-pack';
  }
  
  // Production phase
  if (['payment', 'production', 'waiting-sample', 'sample', 'quality', 'shipping'].includes(currentStage)) {
    return 'production';
  }
  
  return 'design';
};

// Map top-level tab to internal stage
export const stageMapping: Record<string, string> = {
  'design': 'design',
  'specifications': 'specifications',
  'fabric-color': 'fabric-color',
  'tech-pack': 'tech-pack',
  'production': 'payment',
};

export const HorizontalProgressTabs = () => {
  const { currentStage, completedStages, setCurrentStage } = useWorkflow();

  const activeTopLevel = getTopLevelStage(currentStage);
  const isInTechPack = activeTopLevel === 'tech-pack';
  const isInProduction = activeTopLevel === 'production';

  const getStageStatus = (stageId: string, index: number) => {
    const stageOrder = topLevelStages.map(s => s.id);
    const currentIndex = stageOrder.indexOf(activeTopLevel);
    const stageIndex = stageOrder.indexOf(stageId);

    if (stageIndex < currentIndex) return 'completed';
    if (stageId === activeTopLevel) return 'current';
    if (stageIndex > currentIndex) return 'locked';
    return 'accessible';
  };

  const handleStageClick = (stageId: string, status: string) => {
    if (status === 'locked') return;
    
    // Navigate to appropriate internal stage
    if (stageId === 'design') setCurrentStage('design');
    else if (stageId === 'specifications') setCurrentStage('specifications');
    else if (stageId === 'fabric-color') setCurrentStage('fabric-color');
    else if (stageId === 'tech-pack') setCurrentStage('tech-pack');
    else if (stageId === 'production') setCurrentStage('payment');
  };

  return (
    <div className="w-full">
      {/* Top Level Horizontal Progress Tabs */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-2 mb-6">
        {topLevelStages.map((stage, index) => {
          const status = getStageStatus(stage.id, index);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const isLocked = status === 'locked';
          const Icon = stage.icon;

          return (
            <React.Fragment key={stage.id}>
              {/* Tab Button */}
              <button
                onClick={() => handleStageClick(stage.id, status)}
                disabled={isLocked}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all flex-1 justify-center",
                  isCurrent && "bg-primary text-primary-foreground shadow-sm",
                  isCompleted && "bg-primary/10 text-primary hover:bg-primary/20",
                  isLocked && "text-muted-foreground/50 cursor-not-allowed",
                  !isCurrent && !isCompleted && !isLocked && "hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium",
                  isCurrent && "bg-primary-foreground/20",
                  isCompleted && "bg-primary text-primary-foreground",
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

              {/* Connector Line */}
              {index < topLevelStages.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 mx-1",
                  index < topLevelStages.findIndex(s => s.id === activeTopLevel)
                    ? "bg-primary"
                    : "bg-border"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Tech Pack Sub-stages */}
      {isInTechPack && <TechPackSubTabs />}

      {/* Production Sub-stages */}
      {isInProduction && <ProductionSubTabs />}
    </div>
  );
};

// Sub-tabs for Tech Pack phase
const TechPackSubTabs = () => {
  const { currentStage, setCurrentStage, completedStages } = useWorkflow();

  const getCurrentSubIndex = () => {
    if (currentStage === 'tech-pack' || currentStage === 'tech-pack-review' || currentStage === 'tech-pack-overview') return 0;
    if (currentStage === 'factory-match' || currentStage === 'factory-selection') return 1;
    if (currentStage === 'send-tech-pack' || currentStage === 'waiting') return 2;
    return 0;
  };

  const currentSubIndex = getCurrentSubIndex();

  const handleSubTabClick = (subStageId: string, index: number) => {
    if (subStageId === 'tech-pack-overview') setCurrentStage('tech-pack');
    else if (subStageId === 'factory-match') setCurrentStage('factory-match');
    else if (subStageId === 'send-tech-pack') setCurrentStage('send-tech-pack');
  };

  return (
    <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1.5 overflow-x-auto">
      {techPackSubStages.map((subStage, index) => {
        const isCurrent = index === currentSubIndex;
        const isCompleted = index < currentSubIndex || completedStages.includes(subStage.id);

        return (
          <button
            key={subStage.id}
            onClick={() => handleSubTabClick(subStage.id, index)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
              isCurrent && "bg-background text-foreground shadow-sm",
              isCompleted && !isCurrent && "text-primary hover:bg-background/50",
              !isCurrent && !isCompleted && "text-muted-foreground hover:bg-background/50"
            )}
          >
            {isCompleted && !isCurrent && (
              <Check className="w-3 h-3 inline mr-1" />
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
    if (currentStage === 'quality') return 2;
    if (currentStage === 'shipping') return 3;
    return 0;
  };

  const currentSubIndex = getCurrentSubIndex();

  return (
    <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1.5 overflow-x-auto">
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
              isCurrent && "bg-background text-foreground shadow-sm",
              isCompleted && !isCurrent && "text-primary hover:bg-background/50",
              isLocked && "text-muted-foreground/40 cursor-not-allowed",
              !isCurrent && !isCompleted && !isLocked && "text-muted-foreground hover:bg-background/50"
            )}
          >
            {isCompleted && !isCurrent && (
              <Check className="w-3 h-3 inline mr-1" />
            )}
            {subStage.label}
          </button>
        );
      })}
    </div>
  );
};

export default HorizontalProgressTabs;