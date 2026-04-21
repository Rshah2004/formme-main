import React from 'react';
import { Check } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { useContractStatus } from '@/hooks/useContractStatus';
import { toast } from 'sonner';

const topLevelStages = [
  { id: 'tech-pack',     label: 'Tech Pack',      number: '01' },
  { id: 'manufacturers', label: 'Manufacturers',   number: '02' },
  { id: 'production',    label: 'Production',      number: '03' },
];

export const techPackSubStages = [
  { id: 'upload-tech-pack',       label: 'Upload' },
  { id: 'design',                 label: 'Design Details' },
  { id: 'specifications',         label: 'Specifications' },
  { id: 'fabric-color',           label: 'Fabric & Color' },
  { id: 'final-tech-pack-review', label: 'Review' },
];

export const manufacturersSubStages = [
  { id: 'factory-match',         label: 'Find Manufacturers' },
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
  if (['upload-tech-pack','design','specifications','fabric-color','tech-pack','tech-pack-review','tech-pack-overview','final-tech-pack-review'].includes(currentStage)) return 'tech-pack';
  if (['factory-match','factory-selection','send-tech-pack','waiting','manufacture-selection'].includes(currentStage)) return 'manufacturers';
  if (['payment','production','waiting-sample','sample','production-tracking','quality','shipping'].includes(currentStage)) return 'production';
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
    const stageIdx   = order.indexOf(stageId);
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
    <div className="w-full space-y-0">
      {/* Phase rail */}
      <div className="flex items-center gap-0 border-b border-border mb-0 pb-0">
        {topLevelStages.map((stage, index) => {
          const status      = getStageStatus(stage.id);
          const isCompleted = status === 'completed';
          const isCurrent   = status === 'current';
          const isLocked    = status === 'locked';

          return (
            <React.Fragment key={stage.id}>
              <button
                onClick={() => handleStageClick(stage.id, status)}
                disabled={isLocked}
                className={cn(
                  'relative flex items-center gap-2.5 px-5 py-3.5 text-sm transition-all group',
                  isCurrent  && 'text-foreground',
                  isCompleted && 'text-muted-foreground hover:text-foreground',
                  isLocked   && 'text-muted-foreground/35 cursor-not-allowed',
                )}
              >
                {/* Active underline */}
                {isCurrent && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                )}

                {/* Number or check */}
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 transition-all',
                  isCurrent   && 'bg-primary text-primary-foreground',
                  isCompleted && 'bg-accent/20 text-accent',
                  isLocked    && 'bg-muted text-muted-foreground/40',
                )}>
                  {isCompleted ? <Check className="w-3 h-3" /> : stage.number}
                </span>

                <span className={cn(
                  'font-medium hidden sm:inline',
                  isCurrent && 'text-foreground',
                )}>
                  {stage.label}
                </span>
              </button>

              {index < topLevelStages.length - 1 && (
                <span className="text-border text-xs px-1 select-none">/</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Sub-stage row */}
      <div className="pt-3">
        {activeTopLevel === 'tech-pack'     && <TechPackSubTabs />}
        {activeTopLevel === 'manufacturers' && <ManufacturersSubTabs />}
        {activeTopLevel === 'production'    && <ProductionSubTabs />}
      </div>
    </div>
  );
};

/* ── Sub-tab bar ── */
interface SubTabBarProps {
  stages: { id: string; label: string }[];
  currentIndex: number;
  onSelect: (id: string) => void;
  completedStages: string[];
  useIndexCompletion?: boolean;
  lockFuture?: boolean;
}

const SubTabBar = ({ stages, currentIndex, onSelect, completedStages, useIndexCompletion, lockFuture }: SubTabBarProps) => (
  <div className="flex items-center gap-0 overflow-x-auto">
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
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap mr-1.5',
            isCurrent   && 'bg-primary/10 text-primary border border-primary/20',
            isCompleted && !isCurrent && 'text-accent hover:text-accent/80',
            isLocked    && 'text-muted-foreground/30 cursor-not-allowed',
            !isCurrent && !isCompleted && !isLocked && 'text-muted-foreground hover:text-foreground',
          )}
        >
          {isCompleted && !isCurrent && <Check className="w-2.5 h-2.5 shrink-0" />}
          {stage.label}
        </button>
      );
    })}
  </div>
);

/* ── Phase sub-tab components ── */
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
