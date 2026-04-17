import React from 'react';
import { Check, FileText, Factory, Package } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { useContractStatus } from '@/hooks/useContractStatus';
import { toast } from 'sonner';

const topLevelStages = [
  { id: 'tech-pack',     label: 'Tech Pack',     number: '01', icon: FileText },
  { id: 'manufacturers', label: 'Manufacturers',  number: '02', icon: Factory  },
  { id: 'production',    label: 'Production',     number: '03', icon: Package  },
];

export const techPackSubStages = [
  { id: 'upload-tech-pack',      label: 'Upload' },
  { id: 'design',                label: 'Design Details' },
  { id: 'specifications',        label: 'Specifications' },
  { id: 'fabric-color',          label: 'Fabric & Color' },
  { id: 'final-tech-pack-review', label: 'Review' },
];

export const manufacturersSubStages = [
  { id: 'factory-match',       label: 'Find Manufacturers' },
  { id: 'manufacture-selection', label: 'Finalize Manufacturer' },
];

export const productionSubStages = [
  { id: 'payment',             label: 'Contract & Deposit' },
  { id: 'sample',              label: 'Sampling' },
  { id: 'production-tracking', label: 'Production' },
  { id: 'quality',             label: 'Quality Check' },
  { id: 'shipping',            label: 'Delivery' },
];

export const getTopLevelStage = (currentStage: string): string => {
  if (['upload-tech-pack','design','specifications','fabric-color','tech-pack','tech-pack-review','tech-pack-overview','final-tech-pack-review'].includes(currentStage)) {
    return 'tech-pack';
  }
  if (['factory-match','factory-selection','send-tech-pack','waiting','manufacture-selection'].includes(currentStage)) {
    return 'manufacturers';
  }
  if (['payment','production','waiting-sample','sample','production-tracking','quality','shipping'].includes(currentStage)) {
    return 'production';
  }
  return 'tech-pack';
};

export const HorizontalProgressTabs = () => {
  const { currentStage, setCurrentStage } = useWorkflow();
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('designId');
  const { isContractFinalized } = useContractStatus(designId);

  const activeTopLevel = getTopLevelStage(currentStage);

  const getStageStatus = (stageId: string) => {
    const order = topLevelStages.map(s => s.id);
    const currentIdx = order.indexOf(activeTopLevel);
    const stageIdx  = order.indexOf(stageId);

    if (isContractFinalized && (stageId === 'tech-pack' || stageId === 'manufacturers')) return 'locked';
    if (stageIdx < currentIdx) return 'completed';
    if (stageId === activeTopLevel) return 'current';
    return 'locked';
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
    <div className="w-full space-y-3">
      {/* Phase stepper */}
      <div className="flex items-center bg-card border border-border rounded-xl px-3 py-2.5 shadow-sm">
        {topLevelStages.map((stage, index) => {
          const status = getStageStatus(stage.id);
          const isCompleted = status === 'completed';
          const isCurrent   = status === 'current';
          const isLocked    = status === 'locked';

          return (
            <div key={stage.id} className="flex flex-1 items-center">
              <button
                onClick={() => handleStageClick(stage.id, status)}
                disabled={isLocked}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all flex-1 justify-center min-w-0',
                  isCurrent  && 'bg-primary text-primary-foreground shadow-sm',
                  isCompleted && 'text-accent hover:bg-accent/10',
                  isLocked   && 'text-muted-foreground/40 cursor-not-allowed',
                  !isCurrent && !isCompleted && !isLocked && 'hover:bg-muted/50 text-muted-foreground',
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold',
                  isCurrent  && 'bg-white/15 text-primary-foreground',
                  isCompleted && 'bg-accent text-accent-foreground',
                  isLocked   && 'bg-muted text-muted-foreground/50',
                  !isCurrent && !isCompleted && !isLocked && 'bg-muted',
                )}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span>{stage.number}</span>}
                </div>
                <span className="font-medium text-sm hidden sm:inline truncate">
                  {stage.label}
                </span>
              </button>

              {index < topLevelStages.length - 1 && (
                <div className={cn(
                  'w-6 h-px mx-1 shrink-0',
                  index < topLevelStages.findIndex(s => s.id === activeTopLevel) ? 'bg-accent/50' : 'bg-border',
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Sub-stage pills */}
      {activeTopLevel === 'tech-pack'     && <TechPackSubTabs />}
      {activeTopLevel === 'manufacturers' && <ManufacturersSubTabs />}
      {activeTopLevel === 'production'    && <ProductionSubTabs />}
    </div>
  );
};

/* ── Shared sub-tab bar ── */
interface SubTabBarProps {
  stages: { id: string; label: string }[];
  currentIndex: number;
  onSelect: (id: string) => void;
  completedStages: string[];
  useIndexCompletion?: boolean;
  lockFuture?: boolean;
}

const SubTabBar = ({ stages, currentIndex, onSelect, completedStages, useIndexCompletion, lockFuture }: SubTabBarProps) => (
  <div className="flex items-center gap-1 bg-muted/30 border border-border/50 rounded-lg p-1.5 overflow-x-auto">
    {stages.map((stage, index) => {
      const isCurrent   = index === currentIndex;
      const isCompleted = useIndexCompletion ? index < currentIndex : completedStages.includes(stage.id);
      const isLocked    = lockFuture && index > currentIndex && !completedStages.includes(stages[index - 1]?.id);

      return (
        <button
          key={stage.id}
          onClick={() => !isLocked && onSelect(stage.id)}
          disabled={isLocked}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap',
            isCurrent  && 'bg-card text-primary shadow-sm border border-border/50',
            isCompleted && !isCurrent && 'text-accent hover:bg-card/60',
            isLocked   && 'text-muted-foreground/40 cursor-not-allowed',
            !isCurrent && !isCompleted && !isLocked && 'text-muted-foreground hover:bg-card/60',
          )}
        >
          {isCompleted && !isCurrent && <Check className="w-3 h-3 text-accent shrink-0" />}
          {stage.label}
        </button>
      );
    })}
  </div>
);

/* ── Phase-specific sub-tab components ── */
const TechPackSubTabs = () => {
  const { currentStage, setCurrentStage, completedStages } = useWorkflow();
  const getCurrentSubIndex = () => {
    if (currentStage === 'upload-tech-pack') return 0;
    if (['design','tech-pack','tech-pack-overview'].includes(currentStage)) return 1;
    if (currentStage === 'specifications') return 2;
    if (currentStage === 'fabric-color') return 3;
    if (currentStage === 'final-tech-pack-review') return 4;
    return 0;
  };
  return <SubTabBar stages={techPackSubStages} currentIndex={getCurrentSubIndex()} onSelect={(id) => setCurrentStage(id)} completedStages={completedStages} />;
};

const ManufacturersSubTabs = () => {
  const { currentStage, setCurrentStage, completedStages } = useWorkflow();
  const getCurrentSubIndex = () => {
    if (['factory-match','factory-selection'].includes(currentStage)) return 0;
    if (['manufacture-selection','waiting','send-tech-pack'].includes(currentStage)) return 1;
    return 0;
  };
  return <SubTabBar stages={manufacturersSubStages} currentIndex={getCurrentSubIndex()} onSelect={(id) => setCurrentStage(id)} completedStages={completedStages} useIndexCompletion />;
};

const ProductionSubTabs = () => {
  const { currentStage, setCurrentStage, completedStages } = useWorkflow();
  const getCurrentSubIndex = () => {
    if (currentStage === 'payment') return 0;
    if (['waiting-sample','sample'].includes(currentStage)) return 1;
    if (['production','production-tracking'].includes(currentStage)) return 2;
    if (currentStage === 'quality') return 3;
    if (currentStage === 'shipping') return 4;
    return 0;
  };
  return <SubTabBar stages={productionSubStages} currentIndex={getCurrentSubIndex()} onSelect={(id) => setCurrentStage(id)} completedStages={completedStages} useIndexCompletion lockFuture />;
};

export default HorizontalProgressTabs;
