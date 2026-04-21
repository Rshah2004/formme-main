import React from 'react';
import { Button } from '@/components/ui/button';
import { Image, Ruler, Palette, CheckCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { cn } from '@/lib/utils';

interface TechPackOverviewStageProps {
  design: any;
}

const TechPackOverviewStage = ({ design }: TechPackOverviewStageProps) => {
  const { currentStage, setCurrentStage, markStageComplete, completedStages } = useWorkflow();

  const techPackSections = [
    {
      id: 'design',
      title: 'Design Details',
      description: 'Product name, description, and design files',
      icon: Image,
      isComplete: completedStages.includes('design') || design?.name,
    },
    {
      id: 'specifications',
      title: 'Specifications',
      description: 'Size charts, measurements, and construction details',
      icon: Ruler,
      isComplete: completedStages.includes('specifications'),
    },
    {
      id: 'fabric-color',
      title: 'Fabric & Color',
      description: 'Fabric type, GSM, print method, and colors',
      icon: Palette,
      isComplete: completedStages.includes('fabric-color'),
    },
  ];

  const completedCount = techPackSections.filter(s => s.isComplete).length;
  const isReady = completedCount === techPackSections.length;

  const handleContinue = async () => {
    if (!isReady) return;
    markStageComplete('tech-pack');
    setCurrentStage('factory-match');
  };

  return (
    <div className="space-y-8">
      <StageHeader
        stageLabel="Step 01 · Tech Pack"
        title="Review your tech pack."
        description="Check that each section is complete before we find you the right manufacturers."
        contextInfo={[
          { label: 'Design', value: design?.name || 'Untitled' },
          { label: 'Progress', value: `${completedCount} of ${techPackSections.length} complete` },
        ]}
      />

      {/* Sections list */}
      <div className="border border-border rounded-xl overflow-hidden">
        {techPackSections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setCurrentStage(section.id)}
              className={cn(
                'w-full flex items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/40',
                idx < techPackSections.length - 1 && 'border-b border-border',
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                section.isComplete ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground',
              )}>
                {section.isComplete ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', section.isComplete ? 'text-foreground' : 'text-muted-foreground')}>
                  {section.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {section.isComplete ? (
                  <span className="text-[10px] uppercase tracking-widest text-accent font-medium">Done</span>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Incomplete</span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">
          {isReady
            ? 'All sections complete — ready to find manufacturers.'
            : `${techPackSections.length - completedCount} section${techPackSections.length - completedCount !== 1 ? 's' : ''} still need attention.`}
        </p>
        <Button
          onClick={handleContinue}
          disabled={!isReady}
          className="gap-2"
        >
          Find Manufacturers
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TechPackOverviewStage;
