import React from 'react';
import { Check, Lock, Palette, Ruler, Shirt, FileText, Factory } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { cn } from '@/lib/utils';

// Designer-friendly stage definitions
const creativeStages = [
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'specifications', label: 'Specifications', icon: Ruler },
  { id: 'fabric-color', label: 'Fabric & Color', icon: Shirt },
  { id: 'tech-pack', label: 'Tech Pack', icon: FileText },
];

const productionStage = { id: 'production', label: 'Production', icon: Factory };

// Map old stage names to new structure
export const stageMapping: Record<string, string> = {
  // Old stages -> New stages
  'tech-pack': 'design', // Start with design
  'factory-match': 'production',
  'send-tech-pack': 'production',
  'waiting': 'production',
  'payment': 'production',
  'sample': 'production',
  'quality': 'production',
  'shipping': 'production',
};

// New stage order
export const newStageOrder = [
  'design',
  'specifications', 
  'fabric-color',
  'tech-pack',
  'factory-selection', // Transition step
  'production',
] as const;

// Production sub-stages (shown when in production)
export const productionSubStages = [
  { id: 'factory-match', label: 'Select Factory' },
  { id: 'send-tech-pack', label: 'Manufacturer Response' },
  { id: 'payment', label: 'Payment' },
  { id: 'sample', label: 'Sample Review' },
  { id: 'quality', label: 'Quality Check' },
  { id: 'shipping', label: 'Delivery' },
];

export const HorizontalProgressTabs = () => {
  const { currentStage, completedStages, setCurrentStage } = useWorkflow();

  // Determine which creative tab is active based on current stage
  const getActiveCreativeStage = () => {
    // Check if in production phases
    if (['factory-match', 'send-tech-pack', 'waiting', 'payment', 'sample', 'quality', 'shipping', 'production'].includes(currentStage)) {
      return 'production';
    }
    
    // Map current stage to creative stages
    if (currentStage === 'design' || currentStage === 'tech-pack') return 'design';
    if (currentStage === 'specifications') return 'specifications';
    if (currentStage === 'fabric-color') return 'fabric-color';
    
    return 'design'; // Default
  };

  const activeStage = getActiveCreativeStage();
  const isInProduction = activeStage === 'production';

  const getStageStatus = (stageId: string, index: number) => {
    const allStages = [...creativeStages.map(s => s.id), 'production'];
    const currentIndex = allStages.indexOf(activeStage);
    const stageIndex = allStages.indexOf(stageId);

    if (stageIndex < currentIndex) return 'completed';
    if (stageId === activeStage) return 'current';
    if (stageIndex > currentIndex) return 'locked';
    return 'accessible';
  };

  const handleStageClick = (stageId: string, status: string) => {
    if (status === 'locked') return;
    
    // Map to internal stage names for navigation
    if (stageId === 'design') setCurrentStage('tech-pack');
    else if (stageId === 'specifications') setCurrentStage('specifications');
    else if (stageId === 'fabric-color') setCurrentStage('fabric-color');
    else if (stageId === 'tech-pack') setCurrentStage('tech-pack-review');
    else if (stageId === 'production') setCurrentStage('factory-match');
  };

  return (
    <div className="w-full">
      {/* Horizontal Progress Tabs */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-2 mb-6">
        {[...creativeStages, productionStage].map((stage, index) => {
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
              {index < creativeStages.length && (
                <div className={cn(
                  "w-8 h-0.5 mx-1",
                  index < [...creativeStages, productionStage].findIndex(s => s.id === activeStage)
                    ? "bg-primary"
                    : "bg-border"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Production Sub-stages (only shown when in production) */}
      {isInProduction && (
        <ProductionSubTabs />
      )}
    </div>
  );
};

// Sub-tabs for production phase
const ProductionSubTabs = () => {
  const { currentStage, setCurrentStage, completedStages } = useWorkflow();

  const getCurrentSubIndex = () => {
    const index = productionSubStages.findIndex(s => s.id === currentStage);
    // Handle special cases
    if (currentStage === 'waiting') return 1; // Manufacturer Response
    if (currentStage === 'production') return 1; // Review production params
    return index >= 0 ? index : 0;
  };

  const currentSubIndex = getCurrentSubIndex();

  return (
    <div className="mt-4 ml-0 sm:ml-8">
      {/* Sub-step container with visual connection to main workflow */}
      <div className="relative">
        {/* Connection line from Production to sub-steps */}
        <div className="absolute -top-4 left-6 w-0.5 h-4 bg-border hidden sm:block" />
        
        {/* Sub-steps wrapper */}
        <div className="bg-card border border-border rounded-xl p-2 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {productionSubStages.map((subStage, index) => {
              const isCurrent = index === currentSubIndex;
              const isCompleted = index < currentSubIndex || completedStages.includes(subStage.id);
              const isLocked = index > currentSubIndex && !completedStages.includes(productionSubStages[index - 1]?.id);

              return (
                <React.Fragment key={subStage.id}>
                  <button
                    onClick={() => !isLocked && setCurrentStage(subStage.id)}
                    disabled={isLocked}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap",
                      "text-sm font-medium min-h-[40px]",
                      isCurrent && "bg-primary text-primary-foreground shadow-sm",
                      isCompleted && !isCurrent && "bg-primary/10 text-primary hover:bg-primary/20",
                      isLocked && "bg-muted/50 text-muted-foreground/50 cursor-not-allowed",
                      !isCurrent && !isCompleted && !isLocked && "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {/* Step indicator */}
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold",
                      isCurrent && "bg-primary-foreground/20 text-primary-foreground",
                      isCompleted && !isCurrent && "bg-primary text-primary-foreground",
                      isLocked && "bg-muted-foreground/20 text-muted-foreground/50",
                      !isCurrent && !isCompleted && !isLocked && "bg-muted-foreground/20 text-muted-foreground"
                    )}>
                      {isCompleted && !isCurrent ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span>{subStage.label}</span>
                  </button>

                  {/* Connector between sub-steps */}
                  {index < productionSubStages.length - 1 && (
                    <div className={cn(
                      "w-4 h-0.5 shrink-0",
                      index < currentSubIndex ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalProgressTabs;
